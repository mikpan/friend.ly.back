var MongoClient = require('mongodb').MongoClient,
    nconf = require('nconf');

var db;

// Initialize connection once
MongoClient.connect(nconf.get('MONGODB_URI'), function(err, database) {
    if(err) throw err;
    db = database;
    db.collection('logs', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'logs' collection doesn't exist.");
        }
    });
});

appendAttribute = function (items, attributeName, attributeValue) {
    console.log ('appendAttribute(itemsCount=' + (items.length ? items.length : '0') + ', [' + attributeName +']=' + attributeValue + ')');
    for (var i=0; items.length && i<items.length; i++) {
        items[i][attributeName] = attributeValue;
    }
};

exports.flush = function(req, res) {
    console.log ('flush(request.body.length=' + req.body.logs.length + ') -- push new logs.');
    appendAttribute(req.body.logs, "browserId", req.body.browserId);
    db.collection('logs', function(err, collection) {
        collection.insert(req.body.logs, {safe:true},
            function(err, result) {
                if (err) {
                    console.log ('==> Error: ' + err);
                    res.jsonp(500, { 'Error': err });
                } else {
                    var itemCount = result.length || 0;
                    console.log ('==> Success: ' + ((itemCount == 1) ? ('Url=' + result[0].url) : ((itemCount) + ' items pushed.')));
                    res.json(200);
                }
            });
    });
};