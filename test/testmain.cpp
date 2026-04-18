#include <stdio.h>

void test_fs_pair();
void test_fs_accept();
void test_fs_accept_read();

int main() {
	printf("Running tests...\n");

	test_fs_pair();
	test_fs_accept();
	test_fs_accept_read();

	return 0;
}