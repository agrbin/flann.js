var ex = ex || {};

ex.gui = function (canvas) {
  var ctx = canvas.getContext("2d"),
    resizeCallback = null,
    width = null,
    height = null,
    kQueryRadius = 3,
    kPivotRadius = 10;

  this.registerResizeCallback = function (cb) {
    resizeCallback = cb;
  };

  // dataset ~ { pts: [], colors: [] }
  this.drawPoints = function (dataset, isPivot) {
    for (var it = 0; it < dataset.pts.length; ++it) {
      point(
        dataset.pts[it][0],
        dataset.pts[it][1],
        dataset.colors[it],
        isPivot ? kPivotRadius : kQueryRadius
      );
    }
  };

  function point(x, y, color, r) {
    x *= width; y *= height;
    ctx.fillStyle = color;
    ctx.fillRect(x - r / 2, y - r / 2, r, r);
  }

  function resize() {
    width = canvas.width = window.innerWidth * 0.9;
    height = canvas.height = window.innerHeight * 0.9;
    if (resizeCallback) {
      resizeCallback();
    }
  }

  (function () {
    window.addEventListener('resize', resize, false);
    resize();
  })();
};
