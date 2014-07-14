var ex = {};

ex.animate = function(dataset) {
  var width = ex.canvas.width, height = ex.canvas.height;
  var ctx = ex.ctx;
  var R = 3, K = 100, targetDuration = 20;
  var index = Flann.fromDataset(dataset.pts);
  var status = document.getElementById('p');

  ex.ctx.fillStyle = "#000";

  function redrawDataset() {
    var it;
    for (it = 0; it < dataset.pts.length; ++it) {
      var x = dataset.pts[it][0] * width;
      var y = dataset.pts[it][1] * height;
      ex.ctx.fillStyle = dataset.colors[it];
      ctx.fillRect(x - R / 2, y - R / 2,R,R);
    }
  }


  function query(k) {
    var pts = ex.generateDataset(k).pts;
    var res = index.multiQuery(pts, 1);
    var it;
    for (it = 0; it < k; ++it) {
      var x = pts[it][0] * width, y = pts[it][1] * height;
      for (var key in res[it]) {
        ex.ctx.fillStyle = dataset.colors[key];
        ctx.fillRect(x - R / 2, y - R / 2,R,R);
      }
    }
  }

  function clock() {
    return (new Date()).getTime();
  }

  function step() {
    var start = clock(), duration;
    query(K);
    duration = clock() - start;
    if (duration > targetDuration * 1.1) K *= 0.9;
    if (duration < targetDuration * 0.9) K *= 1.1;
    K = Math.round(K);
    status.innerHTML = Math.round(1000 * K / duration) + " qps";

    window.requestAnimationFrame(step);
  }

  function resizeCanvas() {
    width = ex.canvas.width = window.innerWidth * 0.9;
    height = ex.canvas.height = window.innerHeight * 0.9;
    redrawDataset();
  };

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();
  step();
};

ex.color = function () {
  return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
};

ex.generateDataset = function (n) {
  var colors = Array(n), pts = Array(n), it;
  for (it = 0; it < n; ++it) {
    pts[it] = [0,0].map(Math.random);
    colors[it] = ex.color();
  }
  return {pts: pts, colors: colors};
};

ex.onLoad = function () {
  ex.canvas = document.getElementById("c");
  
  ex.ctx = ex.canvas.getContext("2d");
  ex.ctx.fillStyle = "#ccc";
  ex.ctx.fillRect(0,0,1500,7500);

  var N = 100;
  var x = document.location.hash;
  if (x.substr(0, 2) == "#n") {
    N = Number(x.substr(2));
  }

  var dataset = ex.generateDataset(N);
  ex.animate(dataset);
};

window.addEventListener('load', ex.onLoad, false);
