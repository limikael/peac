#include <Arduino.h>
#include "QuickjsEngine.h"

extern const char boot_js[];
extern "C" void peac_notify_setup();
extern "C" void peac_notify_loop();

QuickjsEngine engine(boot_js);

void scheduleRestart() {
	engine.scheduleRestart();
}

void setup() {
    Serial.begin(112500);
	engine.begin();
	peac_notify_setup();
	//pinMode(8,OUTPUT);
}

void loop() {
	engine.loop();
	peac_notify_loop();

	/*digitalWrite(8,!digitalRead(8));	
	delay(250);*/
}
