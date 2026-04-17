#include "QuickjsEngine.h"
#include "peac_bindings.h"
#include "jsval-util.h"

QuickjsEngine::QuickjsEngine(const char *boot_)
		:warningTimer(1000) {
	boot=boot_;
}

void QuickjsEngine::begin() {
	if (rt || ctx)
		return; // should throw

    rt=JS_NewRuntime();
    ctx=JS_NewContext(rt);
	errorMessage="";

	peac_bindings_init(ctx);
	JSVAL res=jsvalEval(boot);
	if (jsvalHasException())
		errorMessage=jsvalCatchExceptionStdString();

	jsvalFree(res);

    //JSValue val=JS_Eval(ctx, boot, strlen(boot), "boot", JS_EVAL_TYPE_GLOBAL);
    /*if (JS_IsException(val))
        bootError=getExceptionMessage();*/

    //JS_FreeValue(ctx, val);
}

void QuickjsEngine::close() {
	if (!rt || !ctx)
		return; // should throw

	peac_bindings_exit();

    JS_FreeContext(ctx);
    ctx=nullptr;

    JS_RunGC(rt);
    JS_FreeRuntime(rt);
	rt=nullptr;
}

void QuickjsEngine::loop() {
	if (warningTimer.tick() && errorMessage!="") {
		Serial.printf("%s\n",errorMessage.c_str());
	}

	if (restartScheduled) {
		restartScheduled=false;
		close();
		begin();
	}
}

void QuickjsEngine::scheduleRestart() {
	restartScheduled=true;
}