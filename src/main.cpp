#include <Arduino.h>
#include "QuickjsEngine.h"

extern const char boot_js[];
extern "C" void peac_setup();
extern "C" void peac_loop();

QuickjsEngine engine(boot_js);

void scheduleRestart() {
	engine.scheduleRestart();
}

void setup() {
	engine.begin();
	peac_setup();
	//pinMode(8,OUTPUT);
}

void loop() {
	engine.loop();
	peac_loop();

	/*digitalWrite(8,!digitalRead(8));	
	delay(250);*/
}
