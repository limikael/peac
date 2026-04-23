#include <Arduino.h>
#include "runtime.h"
#include "Timer.h"
#include "Fs.h"
#include "SoftTimer.h"
#include <cassert>

void runtime_setup() {
}

void runtime_start() {
}

void runtime_loop() {
	Timer::loop();
}

void runtime_stop() {
	clearTimers();
}
