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
    Serial.printf("************** start ********** \n");
	peac_notify_setup();
	engine.begin();
	//pinMode(8,OUTPUT);
}

void loop() {
	engine.loop();
	peac_notify_loop();

	/*digitalWrite(8,!digitalRead(8));	
	delay(250);*/
}
