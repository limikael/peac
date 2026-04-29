import path from "path";
import dotenv from "dotenv";
import {packageUp} from "package-up";
import {Command, Option, program} from "commander";

export function withMergedOptions(fn) {
    return async (...args) => {
        let cmd=args.pop();
        let cmdOpts=args.pop();
        const globalOpts = cmd.parent.opts();
        const options = { ...globalOpts, ...cmdOpts, args };
        return fn(options);
    };
}

export function attachEventCommand(program, project, name) {
    let command=program.command(name);
    command.action(async (...args) => {
        let cmd=args.pop();
        let cmdOpts=args.pop();
        const globalOpts = cmd.parent.opts();
        const options = { ...globalOpts, ...cmdOpts, project, args };
        return project[name](options);
    });
    return command;
}
