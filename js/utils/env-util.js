import path from "path";
import dotenv from "dotenv";
import {packageDirname} from "./node-util.js";
import {packageUpSync} from "package-up";

function getCwd(argv = process.argv) {
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];

//        console.log(arg);

        // --cwd=value
        if (arg.startsWith("--cwd=")) {
            return arg.slice("--cwd=".length);
        }

        // --cwd value
        if (arg === "--cwd" && argv[i + 1]) {
            const next = argv[i + 1];
            if (!next.startsWith("--")) return next;
        }
    }

    return process.cwd();
}

export function getProjectCwd(argv = process.argv) {
    let cwd=getCwd();
    let upCwd=packageUpSync({cwd});
    if (!upCwd)
        return;

    return packageDirname(cwd);
}

export function loadProjectEnv(argv = process.argv) {
    let cwd=getProjectCwd();
    if (!cwd)
        return;

    const projectDir = packageDirname(cwd);
    const envPath = path.join(projectDir, ".env");
    const localEnvPath = path.join(projectDir, ".env.local");

    const base = dotenv.config({ path: envPath, quiet: true }).parsed ?? {};
    const local = dotenv.config({ path: localEnvPath, quiet: true }).parsed ?? {};

    // 4. merge into process.env
    Object.assign(process.env, base, local);
}