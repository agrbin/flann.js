(function() {

  // datasetPtr is false if built from file.
  Module["Index"] = function (indexPtr, datasetPtr) {
    var N, K, that = this;

    this.getVeclen = function () {
      return K;
    }

    this.getSize = function () {
      return N;
    }

    this.query = function (query, nn) {
      return that.multiQuery([query], nn)[0];
    };

    // return k above results where k is number of elements in query
    this.multiQuery = function (query, nn) {
      if (typeof nn === 'undefined') {
        nn = 1;
      }
      if (!(nn > 0 && nn < N)) {
        throw "nn should be in <0, N>";
      }

      var dim, Q, nSolutions;
      var queryHeap, idsHeap, distsHeap;
      var ids, dists, i, ret;

      dim = getDimensions(query);
      if (dim.length != 2) {
        throw "query should be Q x K rectangural matrix of numbers";
      }
      if (dim[1] != K) {
        throw "vector query length should be of same size as index";
      }
      Q = dim[0];

      queryHeap = allocateHeapWords(Q * K);
      idsHeap = allocateHeapWords(Q * nn);
      distsHeap = allocateHeapWords(Q * nn);
      arrayToTyped(Q, K, query, queryHeap.floats);

      // the call
      nSolutions = Module.ccall('knnSearch',
          'number',
          ['number','number','number','number','number','number','number'],
          [indexPtr, queryHeap.ptr, idsHeap.ptr, distsHeap.ptr, nn, Q, K]
        );

      if (nSolutions != Q * nn) {
        throw "couldn't find enough solutions. aborting.";
      }

      ids = emptyArray(Q, nn);
      dists = emptyArray(Q, nn);
      typedToArray(Q, nn, idsHeap.ints, ids);
      typedToArray(Q, nn, distsHeap.floats, dists);
      Module._free(queryHeap.ptr);
      Module._free(idsHeap.ptr);
      Module._free(distsHeap.ptr);

      return collateResults(Q, nn, ids, dists);
    };

    // free the allocated memory.
    this.destroy = function () {
      ccall('destroyIndex', 'void', ['number'], [indexPtr]);
      Module._free(datasetPtr);
    };

    // return ArrayBuffer
    this.serialize = function () {
      var filename = randomFileName();
      ccall('saveIndex', 'void', ['number', 'string'], [indexPtr, filename]);
      var ret = FS.readFile(filename, { encoding : 'binary' });
      ret = cloneArrayBuffer(ret.buffer);
      FS.unlink(filename);
      return ret;
    };

    this.getParameters = function () {
      var str, pair, it, sol = {};
      str = ccall('indexParameters', 'string', ['number'], [indexPtr]).split(' ');
      for (it = 0; it < str.length; ++it) {
        if (str[it]) {
          pair = str[it].split('=');
          if (pair.length === 2) {
            sol[pair[0]] = pair[1];
          }
        }
      }
      return sol;
    };

    (function () {
      N = ccall('indexSize', 'number', ['number'], [indexPtr]);
      K = ccall('indexVeclen', 'number', ['number'], [indexPtr]);
    })();
  };

  Module["fromDataset"] = function (dataset, options) {
    // emscripten FS to write dataset contents to a randomly named file
    // cpp to read a file, build an index
    // return index
    var sol, subHeap, dim = [];
    subHeap = datasetToHeap(dataset, dim);

    sol = Module.ccall('buildFromDataset',
        'number',
        ['number', 'number', 'number', 'string'],
        [subHeap.ptr, dim[0], dim[1], buildOptionsString(options)]);

    if (sol) {
      return new Module["Index"](sol, subHeap.ptr);
    } else {
      throw "building from file failed\n";
    }
  };

  Module["fromSerialized"] = function (dataset, indexContents) {
    // emscripten FS to write indexContents to a randomly named file 
    // cpp to build an index from that name
    // return index
    var filename, ptr;
    var datasetSubHeap, datasetDim = [];

    if (dataset) {
      datasetSubHeap = datasetToHeap(dataset, datasetDim);
    } else {
      datasetSubHeap = {ptr: 0};
      datasetDim = [0, 0];
    }

    filename = randomFileName();
    FS.writeFile(filename, indexContents, { encoding : 'binary' } );

    ptr = ccall('buildFromFile',
                'number',
                ['number', 'number', 'number', 'string'],
                [datasetSubHeap.ptr, datasetDim[0], datasetDim[1], filename]);

    FS.unlink(filename);
    if (ptr) {
      return new Module["Index"](ptr, datasetSubHeap.ptr);
    } else {
      throw "building from file failed\n";
    }
  };


  function randomFileName() {
    return "file_" + Math.random().toString().substr(2);
  }

  function cloneArrayBuffer(src)  {
    var dst = new ArrayBuffer(src.byteLength);
    new Uint8Array(dst).set(new Uint8Array(src));
    return dst;
  }

  function getDimensions(a) {
    var ret, it;
    if (!(a instanceof Array)) {
      if (typeof a !== 'number') {
      }
      return [];
    }
    if (!a.length) return [0];
    ret = getDimensions(a[0]);
    for (it = 0; it < a.length; ++it) {
      if (ret.length && a[it].length !== a[0].length) {
        throw "not rectangular.";
      }
      if (!ret.length && typeof a[it] != 'number') {
        throw "not all elements are numbers.";
      }
    }
    ret.unshift(a.length);
    return ret;
  }

  function arrayToTyped(N, M, arr, typed) {
    for (i = 0; i < N; ++i)
      for (j = 0; j < M; ++j)
        typed[i * M + j] = arr[i][j];
  }

  function typedToArray(N, M, typed, arr) {
    for (i = 0; i < N; ++i)
      for (j = 0; j < M; ++j)
        arr[i][j] = typed[i * M + j];
  }

  function emptyArray(N, M) {
    var ret = Array(N), it, jt;
    for (it = 0; it < N; ++it) {
      ret[it] = Array(M);
      for (jt = 0; jt < M; ++jt) {
        ret[it][jt] = 0;
      }
    }
    return ret;
  }

  function allocateHeapWords(count) {
    ptr = Module._malloc(count * 4);
    if (ptr % 4 !== 0) {
      throw "internal error. I expected malloc to return 4byte aligned ptr";
    }
    off = ptr / 4;
    return {
        floats : Module.HEAPF32.subarray(off, off + count),
        ints : Module.HEAPU32.subarray(off, off + count),
        ptr : ptr
      };
  }

  function collateResults(Q, nn, ids, dists) {
    var ret = Array(Q), i, j;
    for (i = 0; i < Q; ++i) {
      ret[i] = {};
      for (j = 0; j < nn; ++j) {
        ret[i][ ids[i][j] ] = dists[i][j];
      }
    }
    return ret;
  }

  function buildOptionsString(options) {
    if (!options) {
      return "";
    }
    var str = [];
    for (var key in options) {
      str.push(key + '=' + options[key]);
    }
    return str.join(' ');
  }

  function datasetToHeap(dataset, dim) {
    var subHeap;
    Array.prototype.push.apply(dim, getDimensions(dataset));
    if (dim.length != 2) {
      throw "dataset should be N x K rectangural matrix of numbers";
    }
    subHeap = allocateHeapWords(dim[0] * dim[1]);
    arrayToTyped(dim[0], dim[1], dataset, subHeap.floats);
    return subHeap;
  }

})();
