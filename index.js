var express = require('express'),
    nconf = require('nconf');


nconf.argv().env(); // consider commandline arguments and environment variables, respectively.
nconf.defaults({ // provide default values for settings not provided above.
    PORT: 3000,
    MONGODB_URI: 'mongodb://heroku_app34252694:5m5hrb6s14e0vu784vb018bh5i@ds047581.mongolab.com:47581/heroku_app34252694'
});

history = require('./routes/history');
logs = require('./routes/logs');


var app = express();

app.configure(function () {
    app.use(express.bodyParser());
});
app.get('/history/count', history.countAll);
app.get('/history/:id/reports', history.findByBrowser);
app.get('/history/:id', history.findById);
app.get('/history', history.findAll);
app.post('/history/', history.push);
app.get('/history/remove/all', history.removeAll);
app.get('/history/latest/:id/:since', history.getLatestStamp);
app.get('/history/latest/:id', history.getLatestStamp);
app.get('/history/all/property/:property', history.getAllProperties);

app.post('/logs/', logs.flush);


app.listen(nconf.get('PORT'));
console.log('Listening on port ' + nconf.get('PORT') + '...');