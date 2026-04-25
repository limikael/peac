#!/usr/bin/env node
import {Command, Option, program} from "commander";
import {withMergedOptions} from "../utils/commander-util.js";
import {peacFlash, peacMonitor, peacInit, peacCat, peacDeploy,
        peacStart, peacStop, peacLsmod, peacEnable, peacDisable,
        peacLoadHookChannel} from "./peac-commands.js";
import {loadProjectEnv, getProjectCwd} from "../utils/env-util.js";
import PeacCliConfigEvent from "./PeacCliConfigEvent.js";

Command.prototype.mergedAction=function(fn) {
    this.action(withMergedOptions(fn));
}

loadProjectEnv();

let cwd=getProjectCwd();
if (cwd) {
    let channel=await peacLoadHookChannel({cwd});
    await channel.dispatch(new PeacCliConfigEvent(program));
}

program
    .name('peac')
    .description('Plugin and JS based MCU platform.')
    .option("--cwd <cwd>","Project dir.")
    .addOption(new Option("-p, --port <port>","How to reach the MCU.").env("PEAC_PORT"))

program
    .command('flash')
    .description("Compile and flash firmware.")
    .option("--dry-run","Just build, don't flash.")
    .action(withMergedOptions(peacFlash));

program
    .command('monitor')
    .description("Open monitor.")
    .action(withMergedOptions(peacMonitor));

program
    .command("init")
    .description("Create peac project in current dir.")
    .action(withMergedOptions(peacInit));

program
    .command("cat")
    .description("Print remote file.")
    .argument('<file>', 'File to print.')
    .action(withMergedOptions(peacCat));

program
    .command("deploy")
    .description("Deploy program.")
    .argument('[file]', 'Main file.')
    .addOption(new Option("-m, --main <file>","Main file.").env("PEAC_MAIN"))
    .option("--flash","Flash device before deploying.")
    .action(withMergedOptions(peacDeploy));

program
    .command("start")
    .description("Start the current program.")
    .action(withMergedOptions(peacStart));

program
    .command("stop")
    .description("Stop the current program.")
    .action(withMergedOptions(peacStop));

program
    .command("lsmod")
    .description("List plugin modules.")
    .action(withMergedOptions(peacLsmod));

program
    .command("enable")
    .description("Enable plugin.")
    .argument('<name>', 'Plugin name.')
    .action(withMergedOptions(peacEnable));

program
    .command("disable")
    .description("Disable plugin.")
    .argument('<name>', 'Plugin name.')
    .action(withMergedOptions(peacDisable));

try {
    await program.parseAsync(process.argv);
}

catch (e) {
    if (!e.declared)
        throw e;

    console.log(e.message);
    process.exit(1);
}