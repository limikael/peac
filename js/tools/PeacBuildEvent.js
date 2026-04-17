import {loadHookChannel, HookEvent} from "hook-channel";

export default class BuildEvent extends HookEvent {
    constructor() {
        super("build");
        this.bindings=[];
        this.bootContent="";
        this.sourceDirs=[];
        this.includeDirs=[];
        this.setupFunctions=[];
        this.loopFunctions=[];
        this.bootFiles=[];
    }

    addBootFile(bootFile) {
        this.bootFiles.push(bootFile);
    }

    addBinding(binding) {
        this.bindings.push(binding);
    }

    addSourceDir(sourceDir) {
        this.sourceDirs.push(sourceDir);
    }

    addIncludeDir(includeDir) {
        this.includeDirs.push(includeDir);
    }

    addSetupFunction(f) {
        this.setupFunctions.push(f);
    }

    addLoopFunction(f) {
        this.loopFunctions.push(f);
    }
}
