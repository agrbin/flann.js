/**
 * This is a worker that performs FLANN operations in a background thread.
 *
 * Communication interface is simple:
 *
 *  Each message is an array whose first element is a string containing type of
 *  the request - 'init', 'query' or 'save'.
 *
 *  switch (type of request)
 *    'init':
 *      second parameter is dataset array or JSON URL.
 *      third parameter is serialized index URL.
 *      fourth parameter is options object for building index.
 *
 *      - if only dataset is given, autotuned index will be built.
 *      - if dataset and options are given, index with that options will be
 *      built.
 *      - if only index is given, index will be deserialized if serialized
 *      index already contains dataset (eg. if it is saved with
 *      save_dataset=true option)
 *      - if dataset and index is given, index will be deserialized and dataset
 *      will be used as dataset.
 *
 *    'query':
 *      second parameter is query point or array of query points
 *      third parameter is number of neighbors to retrieve
 *
 *    'save':
 *      returns serialized version of index.
 *
 * Example of usage:
 *
 * build an index based on given dataset:
 * w.postMessage( ['init', [ [0,0], [5,5], [10,10] ]] );
 *  
 * deserialize an index from index-URL with given dataset:
 * w.postMessage( ['init', [ [0,0], [5,5], [10,10] ], 'index-URL'] );
 *
 * deserialize an index from index-URL without given dataset:
 * w.postMessage( ['init', undefined, 'index-URL'] );
 *
 * build an index based on dataset URL
 * w.postMessage( ['init', 'dataset-URL'] );
 *
 * deserialize index based on indxe-URL and dataset-URL
 * w.postMessage( ['init', 'dataset-URL', 'index-URL'] );
 *
 * dump serialized form of index
 * w.postMessage( ['save'] );
 *
 * w.postMessage( ['query', [2, 2] );
 * w.postMessage( ['query', [2, 2], 3 );
 * w.postMessage( ['query', [[1,1], [2, 2] );
 * w.postMessage( ['query', [[1,1], [2, 2]], 3 );
 */

importScripts('flann.js');

var fw = {index: null};

onmessage = function (e) {
  var args = e.data, type, result;
  try {
    fw.requestIsValid(args);
    type = args.shift();
    if ((result = fw[type].apply(null, args))) {
      postMessage(["result", result]);
    }
  } catch (err) {
    fw.sendError(err);
  }
};

fw.init = function (dataset, index, options) {
  if (fw.index !== null) {
    fw.index.destroy();
  }
  if (typeof dataset === 'string') {
    dataset = downloadNow(dataset, 'json', fw.sendError);
    if (dataset === null) return;
  }
  if (typeof index === 'string') {
    index = downloadNow(index, 'arraybuffer', fw.sendEror);
    if (index === null) return;
  }
  if (index) {
    fw.index = Flann.fromSerialized(dataset, index);
  } else {
    fw.index = Flann.fromDataset(dataset, options);
  }
  if (!fw.index.hasOwnProperty('getSize')) {
    fw.sendError("index failed to built from unknown reason");
    return null;
  }
  return fw.index.getSize();
};

fw.query = function (query, nn) {
  var result;
  fw.queryIsValid(query);
  if (query[0] instanceof Array) {
    return fw.index.multiQuery(query, nn);
  } else {
    return fw.index.query(query, nn);
  }
};

fw.save = function () {
  if (fw.index === null) {
    throw "send 'init' request prior to save.";
  }
  return fw.index.serialize();
}

fw.sendError = function (msg) {
  postMessage(["error", msg.toString()]);
};

fw.requestIsValid = function (msg) {
  var validTypes = {init:1, save:1, query:1};
  if (!(msg instanceof Array)) {
    throw "request should be array";
  }
  if (typeof msg[0] !== 'string') {
    throw "first element in request should be string";
  }
  if (!validTypes.hasOwnProperty(msg[0])) {
    throw "first element should be 'init', 'save' or 'query'";
  }
};

fw.queryIsValid = function (q) {
  if (fw.index === null) {
    throw "send 'init' request prior to queries.";
  }
  if (!(q instanceof Array)) {
    throw "query should be an array, <" + typeof q + "> given.";
  }
};

// this function does synchronous download.
// if error occurs, err callback will be invoked and null returned.
// result is returned.
// interface is not in JavaScript spirit,
// but it may make sense in this worker.
function downloadNow(url, type, err) {
  var xhr, result = null;

  function createXMLHTTPObject() {
    var XMLHttpFactories = [
        function () {return new XMLHttpRequest()},
        function () {return new ActiveXObject("Msxml2.XMLHTTP")},
        function () {return new ActiveXObject("Msxml3.XMLHTTP")},
        function () {return new ActiveXObject("Microsoft.XMLHTTP")}
      ], xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; ++i) {
      try {
        xmlhttp = XMLHttpFactories[i]();
      } catch (e) {
        continue;
      }
      break;
    }
    return xmlhttp;
  }

  if (!(xhr = createXMLHTTPObject())) {
    return err ("can't create xml request object");
  }
  xhr.onload = function (e) {
    if (this.status === 200) {
      if ((result = this.response) === null) {
        err ("failed to parse response to " + type);
      }
    } else {
      err ("status is not 200, it's " + this.status);
    }
  };
  xhr.onerror = err;
  xhr.responseType = type;
  xhr.open('GET', url, false);
  xhr.send();
  return result;
}
