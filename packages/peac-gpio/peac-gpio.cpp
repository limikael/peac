#include "peac-gpio.h"
#include <Arduino.h>

int peac_gpio::digitalRead(int pin) {
	return ::digitalRead(pin);
}

void peac_gpio::digitalWrite(int pin, int value) {
	::digitalWrite(pin, value);
}

void peac_gpio::pinMode(int pin, std::string mode) {
	if (mode=="input")
		::pinMode(pin,INPUT);

	if (mode=="input_pullup")
		::pinMode(pin,INPUT_PULLUP);

	else if (mode=="output")
		::pinMode(pin,OUTPUT);

	else {
		Serial.printf("warning! unrecognized pin mode");
	}
}
