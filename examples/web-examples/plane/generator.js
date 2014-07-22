var ex = ex || {};

ex.generator = function (dimension) {
  var dimZeroes = [],
    that = this;

  function nZeroes(n) {
    return Array.apply(null, new Array(n))
      .map(function () { return 0; });
  }

  this.randomColor = function () {
    return '#' + Math.random().toString().substr(2, 3);
  };

  this.randomPoint = function () {
    return dimZeroes.map(Math.random);
  };

  this.generateDataset = function (n) {
    var narr = nZeroes(n);
    return {
      pts : narr.map(that.randomPoint),
      colors : narr.map(that.randomColor)
    };
  };

  this.generateQuery = function (n) {
    return nZeroes(n).map(that.randomPoint);
  };

  (function () {
    dimZeroes = nZeroes(dimension);
  })();
};


/*testing
  var g = new ex.generator(3);
  console.log( g.randomColor() );
  console.log( g.generateDataset(5) );
  console.log( g.generateQuery(5) );
*/
