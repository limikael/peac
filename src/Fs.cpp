#include "Fs.h"

static std::shared_ptr<Fs> fsInstance;

std::shared_ptr<Fs> Fs::getInstance() {
	if (fsInstance==nullptr)
		fsInstance=std::make_shared<Fs>();

	return fsInstance;
}

std::shared_ptr<Fs> getFsInstance() {
	return Fs::getInstance();
}
