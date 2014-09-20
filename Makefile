lzdir=flann-src/src/cpp/flann/ext
include=-Iflann-src/src/cpp/

# this is 1gb of available memory to flann.js
# if you hit out of memory change this to '-s ALLOW_MEMORY_GROWTH=1'
memory=-s ALLOW_MEMORY_GROWTH=1

# if you want lzma compression for index-es use 'lz4_0=bin/lz4.o bin/lz4hc.o'
# here.
# be aware of https://github.com/mariusmuja/flann/pull/142#issuecomment-48772575
lz4_0=

eflags=-O3

emcc=emcc $(eflags) $(include)
emxx=em++ $(eflags) $(include)

ef="['_buildFromDataset','_buildFromFile','_saveIndex',\
	 '_destroyIndex','_knnSearch','_indexVeclen','_indexSize',\
	 '_indexParameters']"

flannflags=$(memory) \
					-s EXPORTED_FUNCTIONS=$(ef) \
					-s DISABLE_EXCEPTION_CATCHING=0 \
					--pre-js glue/const.js \
					--pre-js glue/glue.js

flann.js: bin/flann.js wrapper.js.sh
	sh wrapper.js.sh > flann.js

bin:
	mkdir -p bin

bin/lz4.o: $(lzdir)/lz4.c bin
	$(emcc) -c -o $@ $^

bin/lz4hc.o: $(lzdir)/lz4hc.c bin
	$(emcc) -c -o $@ $^

bin/flann.js: glue/glue.h glue/glue.cpp $(lz4_o) bin
	$(emxx) $(flannflags) glue/glue.cpp $(lz4_o) -o $@

clean:
	rm -rf bin/

