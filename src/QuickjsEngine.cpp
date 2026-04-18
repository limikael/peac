#include "QuickjsEngine.h"
#include "peac_bindings.h"
#include "jsval-util.h"
#include "Fs.h"

extern "C" void peac_notify_start();
extern "C" void peac_notify_stop();

QuickjsEngine::QuickjsEngine(const char *boot_)
		:warningTimer(1000) {
	boot=boot_;
}

void QuickjsEngine::begin() {
	assert(ctx==NULL);
	JSRuntime *rt=JS_NewRuntime();
    ctx=JS_NewContext(rt);
	errorMessage="";

	peac_bindings_init(ctx);
	peac_notify_start();
	JSVAL res=jsvalEval(boot);
	if (jsvalHasException())
		errorMessage=jsvalCatchExceptionStdString();

	jsvalFree(res);
}

void QuickjsEngine::close() {
	assert(ctx!=NULL);
	Fs::getInstance()->close();
	assert(Fs::getInstance()->getNumOpenFiles()==0);
	peac_notify_stop();
	peac_bindings_exit();
	JSRuntime *rt=JS_GetRuntime(ctx);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);
	ctx=nullptr;
}

void QuickjsEngine::loop() {
	Fs::getInstance()->tick();

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