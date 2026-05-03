import {DeclaredError} from "../utils/js-util.js";
import {createDevice} from "../../js/device/Device.js";
import path from "path";
import fs, {promises as fsp} from "fs";
import * as esbuild from "esbuild";

export class PeakernelBundler {
    constructor({cwd, chain, main}) {
        this.chain=chain;
        this.main=main;
        this.cwd=cwd;
    }

    async getBundleAiife() {
        let esbuildConfig={
            entryPoints: [this.main],
            jsx: "automatic",
            //jsxImportSource: "peabrian-jsx",
            minify: true,
            bundle: true,
            write: false,
            platform: "neutral",
            format: "esm",
            //format: "iife",
            conditions: ["mcu", "import", "default"],
            alias: {
                //"peabrian-jsx/jsx-runtime": jsxRuntimeFn,
                //"peabrian-jsx/jsx-dev-runtime": jsxRuntimeFn,
                //"peabrain": peabrainExportsFn
            }
        }

        let ev={cwd: this.cwd, chain: this.chain, esbuildConfig};
        await this.chain.bundleConf(ev);

        const result=await esbuild.build(esbuildConfig);
        let source=new TextDecoder("utf-8").decode(result.outputFiles[0].contents);
        source=`(async ()=>{${source}})()`;

        return source;
    }
}

export function resolveDeployFile({cwd, args, main}) {
    if (args[0])
        return args[0];

    if (main)
        return path.resolve(cwd,main);
}

export async function deploy({cwd, chain, port, args, main}) {
    let deployFile=resolveDeployFile({cwd, args, main});
    if (!deployFile)
        throw new DeclaredError("No file to deploy.");

    if (!await chain.canBootFromFile())
        throw new DeclaredError("Can't deploy, file boot not active.");

    console.log("Deploy: "+deployFile);
    let bundler=new PeakernelBundler({cwd, chain, main: deployFile});
    let device=await createDevice({port});
    let bundleContent=await bundler.getBundleAiife();
    console.log("Bundle: "+bundleContent.length+" bytes");
    await device.writeFile("/boot.js",bundleContent);
    await device.scheduleRestart(true);
    await device.awaitBoot();
    await device.close();
}
