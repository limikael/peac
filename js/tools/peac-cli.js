#!/usr/bin/env node
import {Command, program} from "commander";
import {withMergedOptions} from "../utils/commander-util.js";
import {peacFlash} from "./peac-flash.js";
import {peacMonitor} from "./peac-commands.js";

program
    .name('peac')
    .description('Plugin and JS based MCU platform.')
    .option("-p, --port <port>","How to reach the MCU.")

program
    .command('flash')
    .description("Compile and flash firmware.")
    .action(withMergedOptions(peacFlash));

program
    .command('monitor')
    .description("Open monitor.")
    .action(withMergedOptions(peacMonitor));

await program.parseAsync(process.argv);
