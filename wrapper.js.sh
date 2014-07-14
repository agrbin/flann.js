#!/bin/bash

echo  "
var Flann = (function() {
  var Module = this;
";

cat bin/flann.js

echo "
  return this;
}).call({});
";
