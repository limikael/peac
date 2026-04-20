#pragma once
#include <string>

namespace peac_gpio {

int digitalRead(int pin);
void digitalWrite(int pin, int value);
void pinMode(int pin, std::string mode);

}