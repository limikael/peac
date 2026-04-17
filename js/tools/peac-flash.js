import {readPackageUp} from "read-package-up";
import {dirnameFromImportMeta, runCommand} from "../utils/node-util.js";
import path from "path";
import fs from "fs";
import {loadHookChannel, HookEvent} from "hook-channel";
import {peabind, peabindMerge, peabindGetLibConf} from "peabind";

let __dirname=dirnameFromImportMeta(import.meta);

function generatePlatformioIni({port, sourceDirs, includeDirs}) {
    return (`
[env:peac]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino
build_unflags = -std=gnu++11  # remove the default
build_flags = 
    -DARDUINO_USB_MODE=1
    -DARDUINO_USB_CDC_ON_BOOT=1 
    -std=c++17
    -DJS_STRICT_NAN_BOXING
    -DJS_NO_REGEXP
    -DJS_NO_MODULE_LOADER
    -DJS_NO_OS
    -DCONFIG_VERSION=\\"embedded\\"
    -DEMSCRIPTEN
${includeDirs.map(d=>`    -I${d}`).join("\n")}
monitor_speed = 115200
upload_port=${port}
monitor_port=${port}
build_src_filter =
    -<*>
${sourceDirs.map(d=>`    +<${d}>`).join("\n")}
`);
}

function escapeCString(str) {
    return str
        .replace(/\\/g, '\\\\')   // backslash
        .replace(/"/g, '\\"')     // double quote
        .replace(/\n/g, '\\n')    // newline
        .replace(/\r/g, '\\r')    // carriage return
        .replace(/\t/g, '\\t');   // tab
}

class BuildEvent extends HookEvent {
    constructor() {
        super("build");
        this.bindings=[];
        this.bootContent="";
        this.sourceDirs=[];
        this.includeDirs=[];
    }

    addBinding(binding) {
        this.bindings.push(binding);
    }

    addSourceDir(sourceDir) {
        this.sourceDirs.push(sourceDir);
    }

    addIncludeDir(includeDir) {
        this.includeDirs.push(includeDir);
    }
}

export async function peacFlash({cwd, port}) {
    let up=await readPackageUp(cwd);

    cwd=path.dirname(up.path);
    let targetPath=path.join(cwd,".target");

    let hookChannel=await loadHookChannel({
        cwd,
        keyword: "peac-plugin",
        exportPath: "peac-build-hooks",
        extraModuleDirs: path.join(__dirname,"../../packages")
    });

    let ev=await hookChannel.dispatch(new BuildEvent());
    fs.mkdirSync(targetPath,{recursive: true});

    ev.addIncludeDir(peabindGetLibConf("includeDir"));
    //ev.addSourceDir(peabindGetLibConf("sourceDir"));

    ev.addIncludeDir(path.join(__dirname,"../../vendor/quickjs"));
    ev.addSourceDir(path.join(__dirname,"../../vendor/quickjs"));
    ev.addSourceDir(path.join(__dirname,"../../src"));
    ev.addSourceDir(targetPath);

    let bindings=ev.bindings.map(b=>{
        if (typeof b=="string")
            b=fs.readFileSync(b);

        return b;
    });

    await peabind({
        idl: peabindMerge(bindings),
        target: "quickjs",
        output: path.join(targetPath,"peac_bindings.cpp"),
        prefix: "peac_bindings_"
    });

    let boot=`const char boot_js[]="${escapeCString(ev.bootContent)}";`;
    fs.writeFileSync(path.join(targetPath,"boot_js.c"),boot);

    let relativeSourceDirs=ev.sourceDirs.map(d=>{
        if (fs.statSync(d).isDirectory())
            return d;

        return path.relative(targetPath,d);
    });

    let iniSource=generatePlatformioIni({
        port,
        sourceDirs: relativeSourceDirs,
        includeDirs: ev.includeDirs
    });
    fs.writeFileSync(path.join(targetPath,"platformio.ini"),iniSource);

    await runCommand("pio",["run","--target","upload"],{cwd: targetPath});
}