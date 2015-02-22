var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    db;

var mongoClient = new MongoClient(new Server('149.210.145.186', 27017));
mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db("historydb");
    db.collection('history', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'history' collection doesn't exist. Creating it with sample data...");
        }
    });
});

exports.push = function(req, res) {
    console.log ("Subscribing new client.");
	mongo.db.collection('subscription', function(err, collection) {
		collection.insert(req.body, {safe:true},
		function(err, result) {
				if (err) {
					console.log ("Error. " + err);
					res.jsonp(500, { "error": err });
				} else {
					console.log ("No errors. Result: " + result);
					res.jsonp(200);
				}
		});
    });
}