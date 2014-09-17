#!/bin/bash

# output license
echo  "/*"
cat LICENSE
echo  "*/"

# output body
echo -n "var Flann = (function() {\n
  var Module = this;";

cat bin/flann.js

cat <<EOF

  return this;
}).call({});

if ((typeof module !== 'undefined') && ('exports' in module)) {
  module.exports = Flann;
}
EOF

