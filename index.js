var express = require('express'),
    history = require('./routes/history');
	

var app = express();

app.configure(function(){
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


var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port + '...');
