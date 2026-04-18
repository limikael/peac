#pragma once
#include <vector>
#include <memory>
#include "peabind.h"
#include <string>
#include <algorithm>

#ifdef ARDUINO
#include <Arduino.h>
#endif

static std::vector<uint8_t> stringToVec(std::string s) {
	std::vector<unsigned char> v(s.begin(), s.end());
	return v;
}

class FileHandle {
public:
	void write(std::vector<uint8_t> data_) {
		if (buffered) {
			writeBuffer.insert(writeBuffer.end(), data_.begin(), data_.end());
		}

		else {
			auto otherShared=other.lock();
			otherShared->data.emit(data_);
			writeBuffer.clear();
		}
	}

	void write(std::string s) {
		std::vector<unsigned char> v(s.begin(), s.end());
		write(v);
	}

	void setOther(std::weak_ptr<FileHandle> other_) { other=other_; }

	Dispatcher<std::vector<uint8_t>> data;
	Dispatcher<> closeEvent;

	void tick() {
		if (writeBuffer.size()) {
			auto otherShared=other.lock();
			otherShared->data.emit(writeBuffer);
			writeBuffer.clear();
		}
	}

	void close() {
		if (closed)
			return;

		closed=true;
		other.lock()->close();
	}

	bool isClosed() {
		return closed;
	}

	void setBuffered(bool buffered_) {
		buffered=buffered_;
	}

private:
	bool buffered=true;
	bool closed=false;
	std::weak_ptr<FileHandle> other;
	std::vector<uint8_t> writeBuffer;
};

class FileHandlePair {
public:
	FileHandlePair() {
		first=std::make_shared<FileHandle>();
		second=std::make_shared<FileHandle>();
		first->setBuffered(false);
		second->setBuffered(true);
		first->setOther(second);
		second->setOther(first);
	}

	std::shared_ptr<FileHandle> getFirst() { return first; }
	std::shared_ptr<FileHandle> getSecond() { return second; }

	void tick() {
		first->tick();
		second->tick();
	}

	bool isClosed() {
		return (first->isClosed() || second->isClosed());
	}

private:
	std::shared_ptr<FileHandle> first, second;
};

class OpenEvent {
public:
	OpenEvent(std::shared_ptr<FileHandlePair> pair_, std::string pathname_, std::string mode_) {
		pair=pair_;
		pathname=pathname_;
		mode=mode_;
	}

	std::string getPathname() {
		return pathname;
	}

	bool isAccepted() {
		return accepted;
	}

	std::shared_ptr<FileHandle> accept() {
		if (accepted)
			return nullptr;

		accepted=true;
		return pair->getSecond();
	}

private:
	bool accepted=false;
	std::shared_ptr<FileHandlePair> pair;
	std::string pathname;
	std::string mode;
};

class Fs {
public:
	std::shared_ptr<FileHandlePair> createFileHandlePair() {
		std::shared_ptr<FileHandlePair> pair=std::make_shared<FileHandlePair>();
		pairs.push_back(pair);
		return pair;
	}

	std::shared_ptr<FileHandle> open(std::string pathname, std::string mode) {
		auto fp=createFileHandlePair();
		auto ev=std::make_shared<OpenEvent>(fp, pathname, mode);
		openRequest.emit(ev);

		if (ev->isAccepted()) {
			return fp->getFirst();
		}

		else {
			fp->getFirst()->close();
			fp->getSecond()->close();
			return nullptr;
		}
	}

	Dispatcher<std::shared_ptr<OpenEvent>> openRequest;

	void tick() {
		for (auto fp: pairs)
			fp->tick();

		pairs.erase(
		    std::remove_if(
		        pairs.begin(),
		        pairs.end(),
		        [](const std::shared_ptr<FileHandlePair>& p) {
		        	if (p->isClosed()) {
						p->getFirst()->closeEvent.emit();
						p->getSecond()->closeEvent.emit();
		        	}
		            return p->isClosed();
		        }
		    ),
		    pairs.end()
		);
	}

	int getNumOpenFiles() {
		return pairs.size();
	}

	void close() {
		tick();

		for (auto fp: pairs) {
			fp->getFirst()->close();
			fp->getSecond()->close();
		}

		tick();
	}

	static std::shared_ptr<Fs> getInstance();

private:
	std::vector<std::shared_ptr<FileHandlePair>> pairs;
};

std::shared_ptr<Fs> getFsInstance();
