#!/usr/bin/env node

import {dirnameFromImportMeta} from "../utils/node-util.js";
import {peakernelLoad} from "peakernel";

loadProjectEnv();

let project=await peakernelLoad({
	cwd: getProjectCwd()
});

