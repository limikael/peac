#include <Arduino.h>
#include "QuickjsEngine.h"

extern "C" void peac_notify_setup();
extern "C" void peac_notify_loop();
extern "C" void peac_notify_start();
extern "C" void peac_notify_stop();

bool restartScheduled=false;
extern "C" void peac_restart() {
	restartScheduled=true;
}

void setup() {
	peac_notify_setup();
	peac_notify_start();
}

void loop() {
	if (restartScheduled) {
		restartScheduled=false;
		peac_notify_stop();
		peac_notify_start();
	}

	peac_notify_loop();
}
