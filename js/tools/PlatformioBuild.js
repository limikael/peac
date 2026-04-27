import fs, {promises as fsp} from "fs";
import {escapeCString, unindent, autoIndent, createIniContent} from "../utils/lang-util.js";
import path from "path";
import {arrayify} from "../utils/js-util.js";
import {runCommand} from "../utils/node-util.js";

export default class PlatformioBuild {
	constructor({targetPath, config, projectName, buildFlags, buildUnflags,
			includeDirs, sources, defines, cmake, dryRun}) {
		this.targetPath=targetPath;
		this.config=config;
		this.projectName=projectName;
		this.buildFlags=arrayify(buildFlags);
		this.buildUnflags=arrayify(buildUnflags);
		this.includeDirs=arrayify(includeDirs);
		this.sources=arrayify(sources);
		this.defines={...defines};
		this.cmake=cmake;
		this.dryRun=dryRun;
	}

    createSrcExt() {
        fs.mkdirSync(path.join(this.targetPath,"src-ext"),{recursive: true});

        let sources=[];
        for (let source of this.sources) {
            let stats=fs.statSync(source);

            if (stats.isFile()) {
                let name=path.basename(source);
                let linkToName=path.join(this.targetPath,"src-ext",name);
                if (!fs.existsSync(linkToName))
                    fs.symlinkSync(source,linkToName);

                sources.push(linkToName);
            }

            else {
                sources.push(source);
            }
        }

        sources.push(path.join(this.targetPath,"src-ext"));
        return sources;
    }

    generateCmake() {
        let topCmakeContent=unindent(`
            cmake_minimum_required(VERSION 3.16)
            include($ENV{IDF_PATH}/tools/cmake/project.cmake)
            project(peakernel)            
        `);
        fs.writeFileSync(path.join(this.targetPath,"CMakeLists.txt"),topCmakeContent);

        fs.mkdirSync(path.join(this.targetPath,"main"),{recursive: true});
        let sources=[];
        for (let source of this.sources) {
            let stats=fs.statSync(source);

            if (stats.isFile()) {
                sources.push(source);
            }

            else {
                for (let entry of fs.readdirSync(source))
                    if (entry.endsWith(".c") || entry.endsWith(".cpp"))
                        sources.push(path.join(source,entry));
            }
        }

        let projectCmakeContent=autoIndent(`
            idf_component_register(
                SRCS
                    ${sources.map(d=>`"${d}"\n`).join("\n")}
                INCLUDE_DIRS
                    ${this.includeDirs.map(d=>`"${d}"\n`).join("\n")}
            )
        `);

        fs.writeFileSync(path.join(this.targetPath,"main","CMakeLists.txt"),projectCmakeContent);
    }

	generateIni() {
		let platformioIni={
            platformio: {
                src_dir: "main"
            },

            [`env:${this.projectName}`]: {
            	...this.config,
            	build_flags: [
            		...this.buildFlags,
                    ...this.includeDirs.map(i=>`-I${i}`),
                    ...Object.entries(this.defines).map(([k,v])=>v?`-D${k}=${v}`:`-D${k}`)
            	],
            	build_unflags: [
            		...this.buildUnflags
            	]
            }
		}

		fs.rmSync(path.join(this.targetPath,"CMakeLists.txt"), {force: true});
		fs.rmSync(path.join(this.targetPath,"main"), {recursive: true, force: true});
		fs.rmSync(path.join(this.targetPath,"src-ext"), {recursive: true, force: true});

		if (this.cmake) {
	        this.generateCmake();
		}

		else {
			let sources=this.createSrcExt();
            platformioIni[`env:${this.projectName}`].build_src_filter=[
                "-<*>",
                ...sources.map(d=>`+<${d}>`),
            ];
		}

		let iniContent=createIniContent(platformioIni);
		fs.writeFileSync(path.join(this.targetPath,"platformio.ini"),iniContent);
	}

	async run() {
		fs.mkdirSync(this.targetPath,{recursive: true});
		await this.generateIni();

    	if (!this.dryRun) {
	        await runCommand("pio",["run","--target","upload"],{cwd: this.targetPath});
    	}
	}
}

export async function platformioBuild(options) {
	let build=new PlatformioBuild(options);
	await build.run();
}