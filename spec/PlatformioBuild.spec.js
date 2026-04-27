import {dirnameFromImportMeta} from "../js/utils/node-util.js";
import fs, {promises as fsp} from "fs";
import path from "path";
import PlatformioBuild from "../js/tools/PlatformioBuild.js";

let __dirname=dirnameFromImportMeta(import.meta);

describe("PlatformioBuild",()=>{
	it("can generate a platformio project",async ()=>{
		fs.rm(path.join(__dirname,".target"),{recursive: true, force: true});

		let p=new PlatformioBuild({
			targetPath: path.join(__dirname,".target"),
			projectName: "myproject",
			buildFlags: ["-std=c++17"],
			buildUnflags: ["-std=gnu++11"],
			includeDirs: ["blabla"],
			sources: ["test.c","test2.c"],
			defines: {bla: 1, bla2: 2},
			config: {
                monitor_speed: 115200,
                upload_port: "/dev/hello",
                monitor_port: "/dev/hello",
			}
		});

		await p.generate();
	});
});