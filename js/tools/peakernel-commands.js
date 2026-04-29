import {dirnameFromImportMeta, runCommand, packageDirname, table} from "../utils/node-util.js";
import path from "path";
import {createDevice} from "../device/Device.js";
import {SerialDeviceConnection, createSerialDeviceConnection} from "../device/SerialDeviceConnection.js";
import {proxyComposeFb} from "../utils/proxy-compose.js";
import fs, {promises as fsp} from "fs";
import {DeclaredError} from "../utils/js-util.js";
import {pioStringify} from "../utils/pio-util.js";
import {Command, Option, program} from "commander";
import {attachEventCommand} from "../utils/commander-util.js";

let __dirname=dirnameFromImportMeta(import.meta);

export async function cat({cwd, port, args}) {
    let device=await createDevice({port});
    let content=await device.readFile(args[0],"utf8");
    console.log(content);
    await device.close();
}

export async function monitor({cwd, port}) {
    cwd=packageDirname(cwd);
    let targetPath=path.join(cwd,".target");

    await runCommand("pio",["device","monitor"],{cwd: targetPath});
}

export async function init() {
    let cwd=process.cwd();

    let packageJsonPath=path.join(cwd,"package.json");
    if (fs.existsSync(packageJsonPath))
        throw new DeclaredError("package.json already exists");

    let peakernelPkg=JSON.parse(fs.readFileSync(path.join(__dirname,"../../package.json")));
    let pkg={
        "name": path.basename(cwd),
        "type": "module",
        "scripts": {
            "flash": "peakernel flash"
        },
        "dependencies": {
            "peakernel": `^${peakernelPkg.version}`
        }
    }

    fs.writeFileSync(path.join(cwd,"package.json"),JSON.stringify(pkg,null,2));

    let ini={
        ["env:"+path.basename(cwd)]: {
            "platform": "espressif32",
            "framework": "arduino",
            "board": "esp32-c3-devkitm-1"
        }
    }

    fs.writeFileSync(path.join(cwd,"platformio.ini"),pioStringify(ini));
}

export async function lsmod({cwd}) {
    let moduleViews=this.getModules().map(m=>({
        Name: m.getName(),
        Description: m.getDescription(),
        Enabled: m.isEnabled(),
    }));

    table(moduleViews);
}

export async function stop({port}) {
    let device=await createDevice({port});
    await device.scheduleRestart(false);
    await device.close();
}

export async function start({port}) {
    let device=await createDevice({port});
    await device.scheduleRestart(true);
    await device.awaitBoot();
    await device.close();
}

export async function enable({args, project}) {
    await project.enablePlugin(args[0]);
}

export async function disable({args, project}) {
    await project.disablePlugin(args[0]);
}

export async function configCli(program, project) {
    attachEventCommand(program,project,"cat")
        .description("Print remote file.")
        .argument('<file>', 'File to print.');

    attachEventCommand(program,project,"monitor")
        .description("Open monitor.");

    attachEventCommand(program,project,"init")
        .description("Create peakernel project in current dir.");

    attachEventCommand(program,project,"lsmod")
        .description("List plugin modules.");

    attachEventCommand(program,project,"enable")
        .description("Enable plugin.")
        .argument('<name>', 'Plugin name.');

    attachEventCommand(program,project,"disable")
        .description("Disable plugin.")
        .argument('<name>', 'Plugin name.');

    attachEventCommand(program,project,"start")
        .description("Start the current program.");

    attachEventCommand(program,project,"stop")
        .description("Stop the current program.");
}
