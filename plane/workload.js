var ex = ex || {};

/**
 * callback is function with one positive parameter N and it's execution time
 * is corelated positively with N.
 * second parameter 'done' is called with result when function is complete.
 *
 * the goal of this class is to iterativelly choose such N such that wrapped
 * function duration tends to be targetDuration
 *
 * class is tested on fucntions bellow (in comment) for targetDurations between
 * 10 and 100.
 */
ex.WorkLoad = function (callback, targetDuration) {
  var N = 1,
    theta = 0.01,
    lastSgn = 0,
    kSgnChangePenalty = 0.9,
    kMaxOffset = 50,
    DEBUG = 0,
    lastDuration = 1;

  function clock() {
    return (new Date()).getTime();
  }

  function sgn(x) {
    return x > 0 ? 1 : -1;
  }

  this.getCurrentQps = function () {
    return N / lastDuration * 1000;
  };

  this.invoke = function (done) {
    var start = clock();
    callback(N, function () {
      var duration = clock() - start,
        offset = targetDuration - duration; 
      if (lastSgn && duration > 10 && sgn(duration) != lastSgn) {
        theta *= kSgnChangePenalty;
      }
      lastSgn = sgn(duration);
      if (Math.abs(offset) > kMaxOffset) {
        offset = sgn(offset) * kMaxOffset;
      }
      N = Math.ceil(N * Math.exp(theta * offset));
      if (DEBUG) {
        console.log("current duration: " + duration,
                    "current N: " + N);
      }
      if (done) {
        done.apply(null, arguments);
      }
      lastDuration = duration;
    });
  };
};


/*
function e1(N, done) {
  for (var i = 0; i < Math.exp(N); ++i);
  done();
}

function p1(N, done) {
  for (var i = 0; i < N; ++i);
  done();
}

function p2(N, done) {
  for (var i = 0; i < N; ++i)
    for (var j = 0;j < N; ++j);
  done();
}

function p4(N, done) {
  for (var i = 0; i < N; ++i)
    for (var j = 0;j < N; ++j)
      for (var k = 0;k < N; ++k)
        for (var l = 0;l < N; ++l);
  done();
}

var e = new ex.WorkLoad(p4, 30);
for (var i = 0; i < 10000; ++i) {
  e.invoke();
}
*/
