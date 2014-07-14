#!/bin/bash

# output license
echo  "/*"
cat LICENSE
echo  "*/"

# output body
echo "var Flann = (function() {
  var Module = this;";

cat bin/flann.js

echo "
  return this;
}).call({});";
