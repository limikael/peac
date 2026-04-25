#pragma once

extern "C" {

void digitalToggle(int pin);	
void runtime_setup();
void runtime_loop();
void runtime_start();
void runtime_stop();
void msleep(int millis);

}