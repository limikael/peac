#include "peac_bindings.out.h"

void test_sys() {
	printf("- testing that things are cleaned up...\n");
	peac_bindings_init_jsval();

	peac_bindings_exit();
}
