#include <Arduino.h>
#include "QuickjsEngine.h"

extern const char boot_js[];

QuickjsEngine engine(boot_js);

void scheduleRestart() {
	engine.scheduleRestart();
}

void setup() {
	engine.begin();
	pinMode(8,OUTPUT);
}

void loop() {
	engine.loop();
	digitalWrite(8,!digitalRead(8));	
	delay(250);
}
