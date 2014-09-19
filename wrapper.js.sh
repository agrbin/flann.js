#!/bin/bash

# output license
echo  "/*"
cat LICENSE
echo  "*/"

# output body
cat <<EOF
// fix browserify poor shim for process.
if (typeof process !== 'undefined' && !('platform' in process)) {
  (function () {
    var write, output;
    write = write || (typeof console === 'undefined' ? null :
                      console.log.bind(console));
    write = write || (typeof print === 'undefined' ? null : print);
    write = write || function () {};
    output = { write: write };
    process.platform = 'maybe-browserify';
    if (!('stderr' in process)) process.stderr = output;
    if (!('stdout' in process)) process.stdout = output;
  }());
}

var Flann = (function() {
  var Module = this;
EOF

# output module code.
cat bin/flann.js

# output tail
cat <<EOF

  return this;
}).call({});

if ((typeof module !== 'undefined') && ('exports' in module)) {
  module.exports = Flann;
}
EOF

