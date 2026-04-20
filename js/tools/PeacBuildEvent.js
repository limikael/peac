import {loadHookChannel, HookEvent} from "hook-channel";

export default class BuildEvent extends HookEvent {
    constructor() {
        super("build");
        this.bindings=[];
        this.bootContent="";
        this.sources=[];
        this.includeDirs=[];
        this.bootFiles=[];
        this.setupFunctions=[];
        this.loopFunctions=[];
        this.startFunctions=[];
        this.stopFunctions=[];
    }

    addBootFile(bootFile) {
        this.bootFiles.push(bootFile);
    }

    addBinding(binding) {
        this.bindings.push(binding);
    }

    addSource(source) {
        this.sources.push(source);
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

    addStartFunction(f) {
        this.startFunctions.push(f);
    }

    addStopFunction(f) {
        this.stopFunctions.push(f);
    }
}
