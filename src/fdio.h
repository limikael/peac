#pragma once
#include "Fs.h"
#include <string>
#include <vector>

int fileOpen(std::string name, std::string mode);
std::vector<uint8_t> fileRead(int fid);
void fileWrite(int fid, std::vector<uint8_t> data);
std::string fileReadString(int fid);
void fileWriteString(int fid, std::string s);
void fileClose(int fid);

