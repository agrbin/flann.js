// flann.js is not a node.JS package, that's why we don't do require.
// although one could wrapp flann.js into a node package it is more reasonable
// to build a bindings for node and have native code executing.
//
// this example shows flann.js basic usage and interface.
//
//
// it is currently a bit clumsy to save a autotuned index together with
// dataset. in order to do that, you must:
//
// first build autotuned index:
//
// index = Flann.fromDataset(dataset)
//
// then, get it's params and add save_dataset: true
//
// params = index.getParameters();
// params.save_dataset = true;
//
// and then build it again
//
// index = Flann.fromDataset(dataset, params)
//
eval(require('fs').readFileSync('../../flann.js').toString());

(function () {
  var N = 2000, K = 50, nn = 3, dataset;
  var index1, index2, path = "index.serialized";
  var fs = require('fs');
  var sol1, sol2;

  desc("generating dataset with " + N + " points", function() {
    dataset = buildRandomDataset(N);
  });

  desc("--> building autotuned index", function () {
    index1 = Flann.fromDataset(dataset);
  });

  desc("serializing index and saving to disk", function () {
    var serialized = index1.serialize();
    fs.writeFileSync(path, toNodeBuffer(serialized));
  });

  desc("--> building index from serialized file", function () {
    var serialized = fs.readFileSync(path);
    index2 = Flann.fromSerialized(dataset, serialized);
  });

  desc("generating query dataset with " + K + " points", function() {
    queries = buildRandomDataset(K);
  });

  desc("query first index on " + K + " query points", function () {
    sol1 = JSON.stringify(index1.multiQuery(queries, nn));
  });

  desc("query second index on " + K + " query points", function () {
    sol2 = JSON.stringify(index2.multiQuery(queries, nn));
  });

  if (sol1 === sol2) {
    console.log("query results are identical.");
  } else {
    console.log("ERROR, query results are not identical.");
  }

  index1.destroy();
  index2.destroy();
})();


// build uniform random dataset of N vectors with K random elements
function buildRandomDataset(N) {
  var dataset = Array(N);
  for (
    it = 0;
    it < N;
    dataset[it++] = [0, 0, 0].map(Math.random)
  );
  return dataset;
}

// simple timer class
function Timer() {
  var start = null;
  this.reset = function () {
    start = (new Date()).getTime();
  
  };
  this.get = function () {
    return (new Date()).getTime() - start;
  };
  this.reset();
};

function desc(desc, func) {
  var timer = new Timer();
  
  process.stdout.write(desc + " ... ");
  try {
    func();
    process.stdout.write("> [ok] [took " + timer.get() + " ms]\n");
  } catch (e) {
    process.stdout.write("> [error: " + e + "]\n");
  }
}

function toNodeBuffer(ab) {
  var buffer = new Buffer(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}
