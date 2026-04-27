#include <Arduino.h>
#include "peakernel.h"

void setup() {
    Serial.begin(112500);
	peakernel_setup();
}

void loop() {
	peakernel_loop();
}
