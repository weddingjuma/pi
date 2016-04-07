var configDB;
var configs = false;
var localMainDB;
var syncingRemote = false;

new PouchDB('config', function(err, db) {
  configDB = db;
});

new PouchDB('localMainDB', function(err, db) {
  localMainDB = db;
});

toolbox.router.get('/db/main/_all_docs', function(request, values, options) {
  logDebug('request for all docs:', request.url);
  return couchDBResponse(request, values, options, function(request) {
    var options = getDBOptions(request.url);
    logDebug('allDocs PouchDB:', options);
    return localMainDB.allDocs(options);
  });
});
toolbox.router.get('/db/main/_design/:design_doc/_view/:view', function(request, values, options) {
  logDebug('request for view:', request.url);
  return couchDBResponse(request, values, options, function(request) {
    var options = getDBOptions(request.url);
    var mapReduce = values.design_doc + '/' + values.view;
    logDebug('queryPouchDB:', mapReduce, options);
    return localMainDB.query(mapReduce, options);
  });
});

toolbox.router.post('/db/main/_bulk_docs', function(request, values, options) {
  logDebug('request for bulk docs:', request.url);
  var pouchRequest = request.clone();
  return couchDBResponse(request, values, options, function() {
    logDebug('couch failed, trying pouch request:', request.url);
    return pouchRequest.json().then(function(jsonRequest) {
      logDebug('got bulk docs, jsonRequest is:', jsonRequest);
      return localMainDB.bulkDocs(jsonRequest);
    }).catch(function(err) {
      logDebug('err getting json: ', err);
    });
  });
});

function setupRemoteSync() {
  if (!syncingRemote) {
    var pouchOptions = {
      ajax: {
        headers: {},
        timeout: 30000
      }
    };
    if (configs.config_consumer_secret && configs.config_token_secret &&
        configs.config_consumer_key && configs.config_oauth_token) {
      pouchOptions.ajax.headers['x-oauth-consumer-secret'] = configs.config_consumer_secret;
      pouchOptions.ajax.headers['x-oauth-consumer-key'] = configs.config_consumer_key;
      pouchOptions.ajax.headers['x-oauth-token-secret'] = configs.config_token_secret;
      pouchOptions.ajax.headers['x-oauth-token'] = configs.config_oauth_token;
    }
    var remoteURL = self.location.protocol + '//' + self.location.host + '/db/main';
    new PouchDB(remoteURL, pouchOptions, function(err, db) {
      syncingRemote = localMainDB.sync(db, {
        live: true,
        retry: true
      }).on('change', function(info) {
        logDebug('local sync change', info);
      }).on('paused', function() {
        logDebug('local sync paused');
        // replication paused (e.g. user went offline)
      }).on('active', function() {
        logDebug('local sync active');
        // replicate resumed (e.g. user went back online)
      }).on('denied', function(info) {
        logDebug('local sync denied:', info);
        // a document failed to replicate, e.g. due to permissions
      }).on('complete', function(info) {
        logDebug('local sync complete:', info);
        // handle complete
      }).on('error', function(err) {
        logDebug('local sync error:', err);
      });
    });
  }
}

function setupConfigs() {
  return new Promise(function(resolve, reject) {
    if (configs) {
      resolve();
    } else {
      configDB.allDocs({
        include_docs: true
      }).then((result) => {
        configs = {};
        result.rows.forEach((row) => {
          configs[row.id] = row.doc.value;
        });
        resolve();
      }, reject);
    }
  });
}

function couchDBResponse(request, values, options, pouchDBFn) {
  setupConfigs().then(setupRemoteSync);
  logDebug('Looking for couchdb response for:', request.url);
  return new Promise(function(resolve, reject) {
    var startTime = performance.now();
    toolbox.networkOnly(request, values, options).then(function(response) {
      if (response) {
        var elapsedTime = performance.now() - startTime;
        resolve(response);
        logPerformance(elapsedTime, request.url);
      } else {
        logDebug('Network first returned no response, get data from local pouch db.');
        runPouchFn(pouchDBFn, request, resolve, reject);
      }
    }).catch(function(err) {
      logDebug('Network first returned err, get data from local pouch db:', err);
      runPouchFn(pouchDBFn, request, resolve, reject);
    });
  });
}

function convertPouchToResponse(pouchResponse) {
  return new Response(JSON.stringify(pouchResponse), {
    status: 200,
    statusText: 'OK'
  });
}

function getDBOptions(url) {
  var returnParams = {};
  if (url.indexOf('?') > 0) {
    var urlParams = url.split('?'),
    params = decodeURIComponent(urlParams[1]).split('&'),
    paramParts,
    i;
    for (i = 0; i < params.length; i++) {
      paramParts = params[i].split('=');
      returnParams[paramParts[0]] = JSON.parse(paramParts[1]);
    }
  }
  return returnParams;
}

function logPerformance(elapsedTime, requestUrl) {
  if (configs.config_log_metrics && configs.current_user) {
    var now = Date.now();
    var timingId = 'timing_' + configs.current_user.toLowerCase() + '_' + now;
    localMainDB.put({
      _id: timingId,
      elapsed: elapsedTime,
      url: requestUrl
    });
  }
}

function runPouchFn(pouchDBFn, request, resolve, reject) {
  pouchDBFn(request).then(function(response) {
    resolve(convertPouchToResponse(response));
  }).catch(function(err) {
    logDebug('POUCH error is:', err);
    reject(err);
  });
}
