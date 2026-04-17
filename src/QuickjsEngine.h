extern "C" {
#include "quickjs.h"
}

class QuickjsEngine {
public:
	QuickjsEngine(const char *boot_);
	void begin();
	void close();
	void loop();
	void scheduleRestart();

private:
	JSRuntime *rt=nullptr;
	JSContext *ctx=nullptr;
	bool restartScheduled=false;
	const char *boot;
};
