import {dirnameFromImportMeta, runCommand, packageDirname} from "../utils/node-util.js";
import {DeclaredError} from "../utils/js-util.js";
import path from "path";
import fs from "fs";
import {loadHookChannel, HookEvent} from "hook-channel";
import {peabind, peabindMerge, peabindGetLibConf} from "peabind";
import {escapeCString, unindent, autoIndent, createIniContent} from "../utils/lang-util.js";
import JSON5 from "json5";
import PeakernelBuildEvent from "./PeakernelBuildEvent.js";
import {peakernelLoadHookChannel} from "./peakernel-commands.js";
import {platformioBuild} from "./PlatformioBuild.js";

let __dirname=dirnameFromImportMeta(import.meta);

class PeakernelFlasher {
    constructor({cwd, port, dryRun, projectName}) {
        if (!port)
            throw new DeclaredError("No port specified.");

        this.port=port;
        this.cwd=packageDirname(cwd);
        this.targetPath=path.join(this.cwd,".target");
        this.projectName=projectName;
    }

    async createBuildEvent() {
        let hookChannel=await peakernelLoadHookChannel({cwd: this.cwd});
        let ev=await hookChannel.dispatch(new PeakernelBuildEvent());

        ev.addIncludeDir(this.targetPath);
        ev.addIncludeDir(path.join(__dirname,"../../src"));
        ev.addSource(path.join(__dirname,"../../src"));
        ev.addSource(this.targetPath);

        // this should go into the quickjs module!!! 
        ev.addIncludeDir(peabindGetLibConf("includeDir"));
        ev.addIncludeDir(path.join(__dirname,"../../vendor/quickjs"));
        ev.addSource(path.join(__dirname,"../../vendor/quickjs"));
        for (let source of peabindGetLibConf("sources",{target: "quickjs"}))
            ev.addSource(source);

        return ev;
    }

    loadJsonIfFilename(filenameOrObject) {
        if (typeof filenameOrObject=="string")
            filenameOrObject=JSON5.parse(fs.readFileSync(filenameOrObject));

        return filenameOrObject;
    }

    generatePeakernelMain(ev) {
        return autoIndent(`
            extern "C" {
                ${ev.setupFunctions.map(f=>`void ${f}();`).join("\n")}
                ${ev.loopFunctions.map(f=>`void ${f}();`).join("\n")}
                ${ev.getStartFunctions().map(f=>`void ${f}();`).join("\n")}
                ${ev.getStopFunctions().map(f=>`void ${f}();`).join("\n")}

                void peakernel_notify_setup() {
                    ${ev.setupFunctions.map(f=>`${f}();`).join("\n")}
                }

                void peakernel_notify_loop() {
                    ${ev.loopFunctions.map(f=>`${f}();`).join("\n")}
                }

                void peakernel_notify_start() {
                    ${ev.getStartFunctions().map(f=>`${f}();`).join("\n")}
                }

                void peakernel_notify_stop() {
                    ${ev.getStopFunctions().map(f=>`${f}();`).join("\n")}
                }
            }
        `);
    }

    generateBootContent(ev) {
        let content=`
            ${ev.bootContent}
            ${ev.getBootFiles().map(f=>fs.readFileSync(f,"utf8")).join("\n")}
        `;

        return `const char boot_js[]="${escapeCString(content)}";`;
    }

    async run() {
        fs.mkdirSync(this.targetPath,{recursive: true});

        let ev=await this.createBuildEvent();

        // this should go into the quickjs module!!! 
        await peabind({
            idl: peabindMerge(ev.bindings.map(b=>this.loadJsonIfFilename(b))),
            target: "quickjs",
            output: path.join(this.targetPath,"pk_bindings.cpp"),
            prefix: "pk_bindings_"
        });

        let boot=this.generateBootContent(ev);
        fs.writeFileSync(path.join(this.targetPath,"boot_js.c"),boot);

        let peakernelMainSource=this.generatePeakernelMain(ev);
        fs.writeFileSync(path.join(this.targetPath,"peakernel_main.cpp"),peakernelMainSource);

        await platformioBuild({
            dryRun: this.dryRun,
            cmake: ev.cmake,
            projectName: this.projectName,
            targetPath: this.targetPath,
            config: {
                ...ev.platformioIniItems,
                board: "esp32-c3-devkitm-1",
            },
            buildUnflags: [
                "-std=gnu++11",
                ...ev.buildUnflags
            ],
            buildFlags: [
                "-std=c++17",
                "-DJS_STRICT_NAN_BOXING",
                "-DJS_NO_REGEXP",
                "-DJS_NO_MODULE_LOADER",
                "-DJS_NO_OS",
                `-DCONFIG_VERSION=\\"embedded\\"`,
                "-DEMSCRIPTEN",
                "-DJSVAL_TARGET_QUICKJS",
                ...ev.buildFlags
            ],
            includeDirs: ev.includeDirs,
            sources: ev.sources
        });
    }
}

export async function peakernelFlash({cwd, port, dryRun}) {
    cwd=packageDirname(cwd);
    let pkg=JSON.parse(fs.readFileSync(path.join(cwd,"package.json")));
    let flasher=new PeakernelFlasher({cwd, port, dryRun, projectName: pkg.name});
    await flasher.run();
}