#include <Arduino.h>
#include "runtime.h"

void digitalToggle(int pin) {
	pinMode(8,OUTPUT);
	digitalWrite(pin,!digitalRead(pin));
}

void msleep(int millis) {
	delay(millis);
}

void runtime_start() {
	pinMode(8,OUTPUT);

	/*for (int i=0; i<10; i++) {
		digitalToggle(8);
		delay(1000);
	}*/
}

void runtime_stop() {

}

void runtime_setup() {
	pinMode(8,OUTPUT);

	/*for (int i=0; i<10; i++) {
		digitalToggle(8);
		delay(1000);
	}*/
}

void runtime_loop() {
//	delay(100);
}