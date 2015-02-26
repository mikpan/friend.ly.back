var MongoClient = require('mongodb').MongoClient,
    nconf = require('nconf');

var db;

// Initialize connection once
MongoClient.connect(nconf.get('MONGODB_URI'), function(err, database) {
  if(err) throw err;
  db = database;
  db.collection('history', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'history' collection doesn't exist. Creating it with sample data...");
        }
  });
});

// Utility function - get client IP address from request object TODO: move to utility module
getIp = function (request) {
        return (request.headers['x-forwarded-for'] || '').split(',')[0]
                || request.connection.remoteAddress;
};
 
exports.findById = function(req, res) {
    var id = parseInt(req.params['id']);
    console.log('findById(' + id + ') -- get history item by its local ID. Return first one, if several.');
    db.collection('history', function(err, collection) {
        collection.findOne({'id': id}, function(err, item) {
            console.log('==> Found item: ' + item);
            res.jsonp(item);
        });
    });
};

exports.findByBrowser = function(req, res) {
    console.log('findByBrowserId(' + browserId + ') -- get history item by its browser ID.');
    db.collection('history', function(err, collection) {
        collection.find({'chromeId': browserId}).toArray(function(err, items) {
            console.log(items);
            res.jsonp(items);
        });
    });
};

exports.removeAll = function(req, res) {
    console.log('removeAll() -- remove all items from "history" collection.');
    db.collection('history', function(err, collection) {
            collection.remove({}, function(err, items) {
                if (err) {
                    console.error("Error. Could not remove items: " + items);
					res.jsonp(500, { "Error": "Could not remove items" });
                } else {
					console.log("==> Number of items removed: " + items);
					res.jsonp('Number of items removed: ' + items);
				}
            });
    });
};

exports.getLatestStamp = function(req, res) {
    var browserId = req.params.id;
	var sinceStamp = (req.params.since ? parseFloat(req.params.since) : 0);
    console.log('getLatestStamp(browserId=' + browserId + ', ip=' + getIp(req) + ', sinceStamp=' + sinceStamp + ') -- get the latest update after the specified time stamp for the specified browser.' );
    db.collection('history', function(err, collection) {
        if (err) {
			console.error("==> Error. Cannot access collection. " + JSON.stringify(items[0]));
		}
		collection.find( {'chromeId': browserId, 'stamp': {'$gte' : (sinceStamp)} } ).sort({'stamp':-1}).limit(1).toArray(function(err, items) {
			res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            if (items && items.length>0) {
                if (!items[0].stamp) {
                    console.error("==> Error. Stamp property not defined for: " + JSON.stringify(items[0]));
                }
                console.log('==> Result. Last stamp: ' + new Date(items[0].stamp).toLocaleString());
                res.jsonp({stamp:items[0].stamp});
            } else {
                console.warn("==> Warn. Stamp is not set for browser#: " + browserId + '. Return 1970/01/01.');
                res.jsonp({stamp:0});
            }
        });
    });
};

exports.getAllProperties = function(req, res) {
    var property = req.params.property;
	console.log('getAllProperties(' + property + ') -- show distinct property values');
    db.collection('history', function(err, collection) {
        collection.distinct(property, function(err, items) {
            console.log('==> ' + ((items && items.length) ? items.length : 0) + ' distinct property values found.');
            res.jsonp(items);
        });
    });
};


exports.findAll = function(req, res) {
    var name = req.query["name"];
    console.log('findAll(' + name + ') -- find all history items for the given title page name.');
    db.collection('history', function(err, collection) {
        if (name) {
            collection.find({"title": new RegExp(name, "i")}).toArray(function(err, items) {
				console.log('==> ' + ((items && items.length) ? items.length : 0) + ' items found.');
                res.jsonp(items);
            });
        } else {
            collection.find().toArray(function(err, items) {
				console.log('==> ' + ((items && items.length) ? items.length : 0) + ' items found.');
                res.jsonp(items);
            });
        }
    });
};

exports.countAll = function(req, res) {
    console.log('countAll() -- count all history items.');
    db.collection('history', function(err, collection) {
        collection.count({}, function(err, numberOfItems) {
            console.log ("==> Result: " + numberOfItems + " items.");
            res.jsonp(numberOfItems);
        });
    });
};

appendAttribute = function (items, attributeName, attributeValue) {
    console.log ('appendAttribute(itemsCount=' + (items.length ? items.length : '0') + ', [' + attributeName +']=' + attributeValue + ')');
    for (var i=0; items.length && i<items.length; i++) {
        items[i][attributeName] = attributeValue;
    }
};

exports.push = function(req, res) {
	console.log ('push(request.body.length=' + req.body.length + ') -- push new history items.');
    appendAttribute(req.body, "ip", getIp(req));
	db.collection('history', function(err, collection) {
		collection.insert(req.body, {safe:true}, 
		function(err, result) {
                if (err) {
					console.log ('==> Error: ' + err);
					res.jsonp(500, { 'Error': err });
				} else {
					var itemCount = result.length || 0;
					console.log ('==> Success: ' + ((itemCount == 1) ? ('Url=' + result[0].url) : ((itemCount) + ' items pushed.')));
					res.jsonp(200);
				}
		});
    });
};
