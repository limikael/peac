.PHONY: test

test:
	rm -f test/*.out.*
	peabind -tquickjs packages/peac-vfs/bindings.json -otest/peac_bindings.out.cpp -ppeac_bindings_
	wrapcc -std=c++20 \
		-o bin/testmain \
		test/*.cpp \
		packages/peac-runtime/encoding.cpp \
		packages/peac-info/InfoRecord.cpp \
		packages/peac-vfs/Fs.cpp \
		-Ipackages/peac-vfs \
		-Ipackages/peac-info \
		-Ipackages/peac-runtime \
		-Ivendor/quickjs \
		$(shell peabind --lib-conf=cargs -tquickjs) \
		-O0 \
		-Iext/quickjs-2025-09-13 \
		ext/quickjs-2025-09-13/libquickjs.a
	./bin/testmain
