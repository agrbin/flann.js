// flann.js is not a node.JS package, that's why we don't do require.
// although one could wrapp flann.js into a node package it is more reasonable
// to build a bindings for node and have native code executing.
//
// this example shows flann.js basic usage and interface.
//
eval(require('fs').readFileSync('../../flann.js').toString());

(function () {
  var N = 1000, nn = 3, dataset, index, result, key, timer;

  console.log("generating dataset..");
  dataset = buildRandomDataset(N);

  console.log("building index..");
  index = Flann.fromDataset(dataset);

  {
    console.log("querying..");
    timer = new Timer();
    result = index.query([0.5, 0.5, 0.5], nn);

    for (key in result) {
      console.log("Point #"
                  + key + " (" + dataset[key] + ")"
                  + " has distance to query point " + result[key]);
    }
    console.log("query took " + timer.get() + " ms.");
  }

  index.destroy();
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


