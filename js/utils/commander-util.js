import path from "path";
import dotenv from "dotenv";
import {packageUp} from "package-up";
import {Command} from "commander";

export function withMergedOptions(fn) {
    return async (cmdOpts, cmd) => {
        //console.log(cmd.name());
        const globalOpts = cmd.parent.opts();
        const options = { ...globalOpts, ...cmdOpts };
        return fn(options);
    };
}
