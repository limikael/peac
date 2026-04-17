export function withMergedOptions(fn) {
    return async (cmdOpts, cmd) => {
        const globalOpts = cmd.parent.opts();
        const options = { ...globalOpts, ...cmdOpts };
        return fn(options);
    };
}