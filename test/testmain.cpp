#include <stdio.h>

void test_fs_pair();
void test_fs_accept();
void test_fs_accept_read();
void test_InfoRecord();
void test_buffered();
void test_buffered_delayed_write();

int main() {
	printf("Running tests...\n");

	test_fs_pair();
	test_fs_accept();
	test_fs_accept_read();
	test_InfoRecord();
	test_buffered();
	test_buffered_delayed_write();

	return 0;
}