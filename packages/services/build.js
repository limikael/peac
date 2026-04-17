import {dirnameFromImportMeta} from "../../js/utils/node-util.js";

export function build(ev) {
	ev.addBinding({
		include: "services.h",
		functions: {
			"serialWrite": {args: ["int"]}
		}
	});

	ev.addSourceDir(__dirname);
	ev.addIncludeDir(__dirname);
}