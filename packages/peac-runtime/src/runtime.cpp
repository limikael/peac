#include <Arduino.h>
#include "runtime.h"
#include "Timer.h"
#include "Fs.h"
#include "SoftTimer.h"
#include <cassert>

void digitalToggle(int pin) {
	pinMode(8,OUTPUT);
	digitalWrite(pin,!digitalRead(pin));
}

void msleep(int millis) {
	delay(millis);
}

//SoftTimer softTimer(1000);

//std::shared_ptr<FileHandle>devConsole;

void runtime_start() {
	//Timer::clearTimers();

	pinMode(8,OUTPUT);

	/*devConsole=Fs::getInstance()->open("/dev/console","w");
	assert(devConsole!=nullptr);*/

	/*for (int i=0; i<10; i++) {
		digitalToggle(8);
		delay(1000);
	}*/
}

void runtime_stop() {
	//Timer::clearTimers();
}

void runtime_setup() {
	//Serial.printf("********** runtime setup.....\n");

	pinMode(8,OUTPUT);

	Fs::getInstance()->openRequest.on([](std::shared_ptr<OpenEvent> ev) {
		if (ev->getPathname()!="/dev/console")
			return;

		auto f=ev->accept();
		if (!f)
			return;

		f->data.on([](std::vector<uint8_t> data) {
			Serial.write(data.data(),data.size());
			Serial.flush();
		});
	});
}

void runtime_loop() {
	/*if (softTimer.tick()) {
		Serial.printf("ticking here...\n");
	}*/
	Timer::loop();
}