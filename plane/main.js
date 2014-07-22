var ex = ex || {};

ex.mainLoop = function(N, gui) {
  var
    status = document.getElementById('p'),
    generator = new ex.generator(2),
    workload = new ex.WorkLoad(query, 50),
    dataset;

  function redrawDataset() {
    gui.drawPoints(dataset, true); 
  }

  function query(k, done) {
    var queryPoints = generator.generateQuery(k);
    status.innerHTML = Math.round(workload.getCurrentQps()) + " qps";
    ex.getNearestCallback(
      queryPoints,
      function (res) {
        done(queryPoints, res);
      }
    );
  }

  function step() {
    workload.invoke(function (queryPoints, res) {
      var it, key, toDraw = {pts: queryPoints, colors: []};
      for (it = 0; it < queryPoints.length; ++it) {
        for (key in res[it]) {
          toDraw.colors.push(dataset.colors[key]);
        }
      }
      gui.drawPoints(toDraw, false);
      window.requestAnimationFrame(step);
    });
  }

  (function () {
    dataset = generator.generateDataset(N);
    gui.registerResizeCallback(redrawDataset);
    redrawDataset();
    status.innerHTML = "building index.";
    ex.buildIndexCallback(dataset.pts, step);
  })();
};

ex.onLoad = function () {
  var numberOfPivots = 100,
    gui = new ex.gui(document.getElementById("c")),
    hash = document.location.hash;

  if (hash.substr(0, 2) == "#n") {
    numberOfPivots = Number(hash.substr(2));
  }

  ex.mainLoop(numberOfPivots, gui);
};

window.addEventListener('load', ex.onLoad, false);
