#pragma once

extern "C" {

void digitalToggle(int pin);	
void runtime_setup();
void runtime_loop();
void msleep(int millis);

}