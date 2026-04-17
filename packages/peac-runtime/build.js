import {dirnameFromImportMeta} from "../../js/utils/node-util.js";
import path from "path";

let __dirname=dirnameFromImportMeta(import.meta);

export function build(ev) {
	ev.addBinding(path.join(__dirname,"bindings.json"));
	ev.addSourceDir(path.join(__dirname,"src"));
	ev.addIncludeDir(path.join(__dirname,"src"));
	ev.addSetupFunction("runtime_setup");
	ev.addLoopFunction("runtime_loop");
	ev.addBootFile(path.join(__dirname,"boot.js"));
}