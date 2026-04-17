import {readPackageUpSync} from "read-package-up";
import {dirnameFromImportMeta, runCommand} from "../utils/node-util.js";
import path from "path";

export async function peacMonitor({cwd, port}) {
    let up=readPackageUpSync(cwd);
    cwd=path.dirname(up.path);
    let targetPath=path.join(cwd,".target");

    await runCommand("pio",["device","monitor"],{cwd: targetPath});
}