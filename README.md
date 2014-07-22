flann.js
========

This is flann.js, a port of C++ FLANN library to JavaScript.

[FLANN][1] is a C++ library written by
Marius Muja and David G. Lowe.

Ported by Anton Grbin using [emscripten][2].


Examples
--------

In `examples/shell-examples/` one can find few examples of usage in Node.

`examples/web-examples/` shows how this library can be used on web.

Plane example
-------------

Plane example generates 100 random pivot points in plane and assigns random color to each of them.

Autotuned index is built based on those pivot points.

Afterwards, new random points are generated and they are colored with color of nearest pivot point as returned by Flann index.

This example is visible on [gh-pages][3].

[1]: http://www.cs.ubc.ca/research/flann/
[2]: http://emscripten.org/
[3]: http://agrbin.github.io/flann.js/plane/
