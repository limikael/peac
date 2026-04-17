#!/usr/bin/env node

import {dirnameFromImportMeta, runCommand} from "../utils/node-util.js";
import path from "path";
import fs, {promises as fsp} from "fs";

let __dirname=dirnameFromImportMeta(import.meta);

let ext=path.join(__dirname,"../../ext");
fs.mkdirSync(ext,{recursive: true});

let downloadFile=path.join(ext,"quickjs-2025-09-13-2.tar.xz");
if (!fs.existsSync(downloadFile)) {
	await runCommand("curl",[
		"https://bellard.org/quickjs/quickjs-2025-09-13-2.tar.xz",
		"-o",downloadFile
	]);
}

if (!fs.existsSync(path.join(ext,"quickjs-2025-09-13"))) {
	await runCommand("tar",[
		"-xf",downloadFile,
		"-C",ext
	]);
}

await runCommand("make",[],{cwd: path.join(ext,"quickjs-2025-09-13")});

let vendor=path.join(__dirname,"../../vendor");
fs.rmSync(vendor,{recursive: true, force: true});
fs.mkdirSync(path.join(vendor,"quickjs"),{recursive: true});

let vendorFiles=[
	"cutils.c","cutils.h","dtoa.c","dtoa.h",
	"libregexp.c","libregexp.h","libregexp-opcode.h",
	"libunicode.c","libunicode.h","libunicode-table.h",
	"list.h","quickjs-atom.h",
	"quickjs.c","quickjs.h","quickjs-opcode.h",
	"unicode_gen.c","unicode_gen_def.h"
];

for (let f of vendorFiles) {
	fs.cpSync(
		path.join(ext,"quickjs-2025-09-13",f),
		path.join(vendor,"quickjs",f),
	);
}

let code = fs.readFileSync(path.join(vendor,"quickjs",'quickjs.c'), 'utf8');
code = code.replace(/res = -tm\.tm_gmtoff \/ 60;/, '// res = -tm.tm_gmtoff / 60;');
fs.writeFileSync(path.join(vendor,"quickjs",'quickjs.c'), code);