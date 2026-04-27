import {dirnameFromImportMeta} from "../../js/utils/node-util.js";
import path from "path";

let __dirname=dirnameFromImportMeta(import.meta);

export function build(ev) {
	ev.addSource(path.join(__dirname,"arduino-main.cpp"));
	ev.addPlatformioIniItem("platform","espressif32");
	ev.addPlatformioIniItem("framework","arduino");
    ev.addBuildFlag("-DARDUINO_USB_MODE=1");
    ev.addBuildFlag("-DARDUINO_USB_CDC_ON_BOOT=1");
 }