import {fileURLToPath} from 'url';
import {spawn} from "child_process";
import {packageUpSync} from "package-up";
import {DeclaredError} from "./js-util.js";
import path from "path";

export function dirnameFromImportMeta(meta) {
    return fileURLToPath(new URL('.', meta.url));
}

export function runCommand(cmd, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            stdio: "inherit",
            //stdio: ["ignore", "pipe", "pipe"],
            ...options,
        });

        let stdout = "";
        let stderr = "";

        if (child.stdout) {
            child.stdout.on("data", d => stdout += d);
        }

        if (child.stderr) {
            child.stderr.on("data", d => stderr += d);
        }

        child.on("error", reject);

        child.on("close", code => {
            if (code === 0) {
                resolve({ code, stdout, stderr });
            } else {
                const err = new Error(`Command failed: ${cmd} ${args.join(" ")}`);
                err.code = code;
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
            }
        });
    });
}

export function packageDirname(cwd) {
    let packageFilename=packageUpSync({cwd});
    if (!packageFilename)
        throw new DeclaredError("Not inside a project.");

    return path.dirname(packageFilename);
}