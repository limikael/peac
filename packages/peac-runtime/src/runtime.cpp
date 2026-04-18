#include <Arduino.h>
#include "runtime.h"
#include "Timer.h"

void digitalToggle(int pin) {
	pinMode(8,OUTPUT);
	digitalWrite(pin,!digitalRead(pin));
}

void msleep(int millis) {
	delay(millis);
}

void runtime_start() {
	//Timer::clearTimers();

	pinMode(8,OUTPUT);


	/*for (int i=0; i<10; i++) {
		digitalToggle(8);
		delay(1000);
	}*/
}

void runtime_stop() {
	//Timer::clearTimers();
}

void runtime_setup() {
	pinMode(8,OUTPUT);

	/*for (int i=0; i<10; i++) {
		digitalToggle(8);
		delay(1000);
	}*/
}

void runtime_loop() {
	Timer::loop();
}