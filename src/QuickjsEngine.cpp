#include "QuickjsEngine.h"

QuickjsEngine::QuickjsEngine(const char *boot_) {
	boot=boot_;
}

void QuickjsEngine::begin() {
	if (rt || ctx)
		return; // should throw

    rt=JS_NewRuntime();
    ctx=JS_NewContext(rt);

    JSValue val=JS_Eval(ctx, boot, strlen(boot), "boot", JS_EVAL_TYPE_GLOBAL);
    /*if (JS_IsException(val))
        bootError=getExceptionMessage();*/

    JS_FreeValue(ctx, val);
}

void QuickjsEngine::close() {
	if (!rt || !ctx)
		return; // should throw

    JS_FreeContext(ctx);
    ctx=nullptr;

    JS_RunGC(rt);
    JS_FreeRuntime(rt);
	rt=nullptr;
}

void QuickjsEngine::loop() {
	if (restartScheduled) {
		restartScheduled=false;
		close();
		begin();
	}
}

void QuickjsEngine::scheduleRestart() {
	restartScheduled=true;
}