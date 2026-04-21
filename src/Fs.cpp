#include "Fs.h"

FileHandle::FileHandle(int id_) {
	id=id_;
	drainOnTick=true;
}

void FileHandle::write(std::vector<uint8_t> data) {
	if (isClosed() || isPeerClosed())
		return;

	auto otherShared=other.lock();
	if (!otherShared)
		return;

	if (sync)
		otherShared->handleIncomingSync(data);

	else
		otherShared->handleIncoming(data);
}

std::vector<uint8_t> FileHandle::read() {
	assert(sync);
	if (!readBuffer.size() && !isClosed() && !isPeerClosed()) {
		auto otherShared=other.lock();
		if (otherShared)
			otherShared->drainEvent.emit();
	}

	std::vector<uint8_t> data=readBuffer;
	readBuffer.clear();
	if (isPeerClosed() && !readBuffer.size())
		close();

	return data;
}

void FileHandle::tick() {
	if (isPeerClosed() && !readBuffer.size())
		close();

	if (drainOnTick && !isClosed() && !isPeerClosed())
		drainEvent.emit();

	drainOnTick=false;
	if (readBuffer.size() && !sync) {
		dataEvent.emit(readBuffer);
		readBuffer.clear();
		auto otherShared=other.lock();
		if (otherShared)
			otherShared->drainOnTick=true;
	}
}

void FileHandle::close() {
	if (closed)
		return;

	closed=true;
	auto otherShared=other.lock();
	if (otherShared)
		other.lock()->closeEvent.emit();
}

bool FileHandle::isPeerSync() {
	auto otherShared=other.lock();
	if (!otherShared)
		return false;

	return otherShared->sync;
}

bool FileHandle::isPeerClosed() {
	auto otherShared=other.lock();
	if (!otherShared)
		return true;

	return otherShared->isClosed();
}

void FileHandle::handleIncomingSync(std::vector<uint8_t> data) {
	readBuffer.insert(readBuffer.end(), data.begin(), data.end());
	dataEvent.emit(readBuffer);
	readBuffer.clear();
}

void FileHandle::handleIncoming(std::vector<uint8_t> data) {
	readBuffer.insert(readBuffer.end(), data.begin(), data.end());
	//haveNewData=true;
}

void FileHandle::setSync(bool c) {
	sync=c;
	if (isPeerClosed())
		return;

	auto otherShared=other.lock();
	if (otherShared)
		return;

	if (sync) {
		assert(!isPeerSync());
		otherShared->drainOnTick=false;
	}

	else {
		otherShared->drainOnTick=true;
	}
}

FileHandlePair::FileHandlePair(int firstId, int secondId) {
	first=std::make_shared<FileHandle>(firstId);
	second=std::make_shared<FileHandle>(secondId);
	first->setOther(second);
	second->setOther(first);
}

void FileHandlePair::tick() {
	first->tick();
	second->tick();
}

void FileHandlePair::close() {
	first->close();
	second->close();
}

OpenEvent::OpenEvent(std::shared_ptr<FileHandlePair> pair_, std::string pathname_, std::string mode_) {
	pair=pair_;
	pathname=pathname_;
	mode=mode_;
}

std::shared_ptr<FileHandle> OpenEvent::accept() {
	if (accepted)
		return nullptr;

	accepted=true;
	return pair->getSecond();
}

std::shared_ptr<FileHandlePair> Fs::createFileHandlePair() {
	std::shared_ptr<FileHandlePair> pair=std::make_shared<FileHandlePair>(nextId++,nextId++);
	pairs.push_back(pair);
	return pair;
}

std::shared_ptr<FileHandle> Fs::open(std::string pathname, std::string mode) {
	auto fp=createFileHandlePair();
	auto ev=std::make_shared<OpenEvent>(fp, pathname, mode);
	openRequest.emit(ev);

	if (ev->isAccepted()) {
		return fp->getFirst();
	}

	else {
		fp->close();
		return nullptr;
	}
}

void Fs::tick() {
	for (auto fp: pairs)
		fp->tick();

	pairs.erase(
	    std::remove_if(
	        pairs.begin(),
	        pairs.end(),
	        [](const std::shared_ptr<FileHandlePair>& p) {
	            return p->isClosed();
	        }
	    ),
	    pairs.end()
	);
}

void Fs::close() {
	tick();

	for (auto fp: pairs)
		fp->close();

	tick();
}

std::shared_ptr<Fs> Fs::getInstance() {
	static std::shared_ptr<Fs> instance=nullptr;

	if (instance==nullptr)
		instance=std::shared_ptr<Fs>(new Fs());

	return instance;
}

std::shared_ptr<Fs> Fs::createForTesting() {
	return std::shared_ptr<Fs>(new Fs());
}

std::shared_ptr<FileHandle> Fs::getFileHandle(int fid) {
	for (auto fp: pairs) {
		if (fp->getFirst()->getId()==fid)
			return fp->getFirst();

		if (fp->getSecond()->getId()==fid)
			return fp->getSecond();
	}

	return nullptr;
}

std::shared_ptr<Fs> getFsInstance() {
	return Fs::getInstance();
}
