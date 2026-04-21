#include <cstdio>
#include <Fs.h>
#include <cassert>
#include <deque>
#include <string>

std::string static vecToString(std::vector<uint8_t> vec) {
	std::string s(vec.begin(),vec.end());
	return s;
}

std::vector<uint8_t> static stringToVec(std::string s) {
	std::vector<unsigned char> v(s.begin(), s.end());
	return v;
}

void test_fs_pair() {
	printf("- fs pairs\n");
	auto fs=Fs::createForTesting();
	auto p=fs->createFileHandlePair();
	std::vector<uint8_t>received;

	p->getSecond()->dataEvent.on([&received](std::vector<uint8_t> data){
		received=data;
	});
	p->getFirst()->write(stringToVec("hello"));

	fs->tick();

	assert(vecToString(received)=="hello");

	fs->close();
	assert(fs->getNumOpenFiles()==0);
}

void test_fs_accept() {
	printf("- fs accept\n");
	auto fs=Fs::createForTesting();

	std::string received;

	fs->openRequest.on([&received](std::shared_ptr<OpenEvent> ev){
		auto myh=ev->accept();
		myh->dataEvent.on([&received](std::vector<uint8_t> data) {
			received=std::string(data.begin(),data.end());
			//printf("got data...\n");
		});
	});

	auto h=fs->open("/dev/console","w");
	h->write(stringToVec("hello"));

	fs->tick();

	assert(received=="hello");
}

void test_fs_accept_read() {
	printf("- fs accept read\n");
	auto fs=Fs::createForTesting();

	fs->openRequest.on([](std::shared_ptr<OpenEvent> ev){
		if (ev->getPathname()=="/f1") {
			auto f=ev->accept();
			f->write(stringToVec("hello1"));
		}

		if (ev->getPathname()=="/f2") {
			auto f=ev->accept();
			f->drainEvent.on([f]() {
				//printf("write...\n");
				f->write(stringToVec("hello2"));
				//printf("wrote...\n");
			});
		}
	});

	auto f1=fs->open("/f1","r");
	auto f2=fs->open("/f2","r");

	assert(fs->open("/somehing","r")==nullptr);

	std::string s1,s2;
	f1->dataEvent.on([&s1](std::vector<uint8_t> v) { s1+=vecToString(v); });
	f2->dataEvent.on([&s2](std::vector<uint8_t> v) { s2+=vecToString(v); });

	for (int i=0; i<10; i++)
		fs->tick();

	assert(s1=="hello1");
	//printf("%s\n",s2.c_str());
	assert(s2=="hello2hello2hello2hello2hello2hello2hello2hello2hello2");

	assert(fs->getNumOpenFiles()==2);
	f1->close();
	f2->close();
	fs->tick();

	assert(fs->getNumOpenFiles()==0);
}

void test_buffered() {
	printf("- fs can do buffered read\n");
	auto fs=Fs::createForTesting();

	fs->openRequest.on([](std::shared_ptr<OpenEvent> ev){
		if (ev->getPathname()=="/f1") {
			auto f=ev->accept();
			f->write(stringToVec("hello1"));
		}
	});

	auto f1=fs->open("/f1","r");
	f1->setSync(true);
	f1->dataEvent.on([f1](std::vector<uint8_t> v) {
		assert(!v.size());
	});

	fs->tick();

	auto s=vecToString(f1->read());
	assert(s=="hello1");
}

void test_buffered_delayed_write() {
	printf("- fs can do buffered read with delay\n");
	auto fs=Fs::createForTesting();

	std::deque<std::string> send={"hello1","hello2","hello3"};

	fs->openRequest.on([&send](std::shared_ptr<OpenEvent> ev){
		if (ev->getPathname()=="/f1") {
			auto f=ev->accept();
			f->drainEvent.on([f,&send]() {
				f->write(stringToVec(send.front()));
				send.pop_front();
				if (send.size()==0)
					f->close();
			});
		}
	});

	auto f1=fs->open("/f1","r");
	f1->setSync(true);

	std::vector<std::string> rec;
	while (!f1->isClosed()) {
		fs->tick();
		fs->tick();
		fs->tick();
		fs->tick();
		rec.push_back(vecToString(f1->read()));
		fs->tick();
		fs->tick();
		fs->tick();
		fs->tick();
	}

	assert(rec.size()==3);

	/*for (int i=0; i<rec.size(); i++) {
		printf("s: %s\n",rec[i].c_str());
	}*/
}

void test_buffered_delayed_write2() {
	printf("- fs can do buffered read with delay in another way\n");
	auto fs=Fs::createForTesting();

	std::deque<std::string> send={"hello1","hello2","hello3"};

	fs->openRequest.on([&send](std::shared_ptr<OpenEvent> ev){
		if (ev->getPathname()=="/f1") {
			auto f=ev->accept();
			while (send.size()) {
				f->write(stringToVec(send.front()));
				send.pop_front();
			}
			f->close();
		}
	});

	auto f1=fs->open("/f1","r");
	f1->setSync(true);

	std::vector<std::string> rec;
	while (!f1->isClosed()) {
		//printf("reading\n");
		fs->tick();
		rec.push_back(vecToString(f1->read()));
		fs->tick();
	}

	assert(rec.at(0)=="hello1hello2hello3");

//	assert(rec.size()==3);
}

void test_buffered_app_write() {
	printf("- fs can do buffered write\n");
	auto fs=Fs::createForTesting();

	std::string written;

	fs->openRequest.on([&written](std::shared_ptr<OpenEvent> ev){
		if (ev->getPathname()=="/f1") {
			auto f=ev->accept();
			f->dataEvent.on([f,&written](std::vector<uint8_t> b) {
				written+=vecToString(b);
			});
		}
	});

	auto f1=fs->open("/f1","r");
	//assert(f1);

	f1->setSync(true);
	f1->write(stringToVec("hello"));
	f1->write(stringToVec("again"));

	assert(written=="helloagain");

	//printf("before...\n");
	fs->tick();
	//printf("after...\n");
}
