// flann.js is not a node.JS package, that's why we don't do require.
// although one could wrapp flann.js into a node package it is more reasonable
// to build a bindings for node and have native code executing.
//
// this example shows flann.js basic usage and interface.
//
eval(require('fs').readFileSync('../../flann.js').toString());

(function () {
  var N = 200000, K = 100, nn = 3, dataset, queries;
  var indexKD, indexLinear;

  desc("generating dataset with " + N + " points", function() {
    dataset = buildRandomDataset(N);
  });

  desc("building KD tree index", function () {
    indexKD = Flann.fromDataset(dataset, {
      algorithm : Flann.FLANN_INDEX_KDTREE
    });
  });

  desc("building linear (brute force) index", function () {
    indexLinear = Flann.fromDataset(dataset, {
      algorithm : Flann.FLANN_INDEX_LINEAR
    });
  });

  desc("generating query dataset with " + K + " points", function() {
    queries = buildRandomDataset(K);
  });

  desc("--> query linear tree index on " + K + " query points", function () {
    indexLinear.multiQuery(queries, nn);
  });

  desc("--> query KD tree index on " + K + " query points", function () {
    indexKD.multiQuery(queries, nn);
  });

  indexKD.destroy();
  indexLinear.destroy();
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

