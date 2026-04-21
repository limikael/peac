#include "fdio.h"

std::string static vecToString(std::vector<uint8_t> vec) {
	std::string s(vec.begin(),vec.end());
	return s;
}

std::vector<uint8_t> static stringToVec(std::string s) {
	std::vector<unsigned char> v(s.begin(), s.end());
	return v;
}

int fileOpen(std::string name, std::string mode) {
	std::shared_ptr<FileHandle> f=Fs::getInstance()->open(name,mode);
	if (!f)
		return 0;

	f->setSync(true);
	return f->getId();
}

std::vector<uint8_t> fileRead(int fid) {
	std::shared_ptr<FileHandle> f=Fs::getInstance()->getFileHandle(fid);
	if (!f)
		return std::vector<uint8_t>();

	return f->read();
}

std::string fileReadString(int fid) {
	return vecToString(fileRead(fid));
}

void fileWrite(int fid, std::vector<uint8_t> data) {
	std::shared_ptr<FileHandle> f=Fs::getInstance()->getFileHandle(fid);
	if (!f)
		return;

	f->write(data);	
}

void fileWriteString(int fid, std::string s) {
	fileWrite(fid,stringToVec(s));
}

void fileClose(int fid) {
	std::shared_ptr<FileHandle> f=Fs::getInstance()->getFileHandle(fid);
	if (!f)
		return;

	f->close();
}


