eval(require('fs').readFileSync('../../flann.js').toString());

stress_test(500, 3, 3, true);
stress_test(10000, 100000, 3, false);

function stress_test(N, K, nn, verbose) {
  var dataset, queryPoints;
  var index, key, timer, it;

  console.log("\n\ngenerating dataset with " + N + " points..");
  dataset = buildRandomDataset(N);

  console.log("building index..");
  index = Flann.fromDataset(dataset);

  console.log("generating queryPoints..");
  queryPoints = buildRandomDataset(K);

  {
    console.log("querying " + K + " query points..");
    timer = new Timer();
    result = index.multiQuery(queryPoints, nn);

    if (verbose) {
      for (it = 0; it < K; ++it) {
        for (key in result[it]) {
          console.log("Point #"
                        + key + " (" + dataset[key] + ")"
                        + " has distance to #" + it
                        + " query point " + result[it][key]);
        }
        console.log();
      }
    }
    console.log("query on " + K + " points took " + timer.get() + " ms.");
  }

  index.destroy();
}


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


