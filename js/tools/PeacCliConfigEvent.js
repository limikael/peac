import {loadHookChannel, HookEvent} from "hook-channel";

export default class CliConfigEvent extends HookEvent {
    constructor(program) {
        super("cliConfig");
        this.program=program;
    }
}
