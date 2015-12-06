var mongo = require('mongodb').MongoClient,
	port = process.env.PORT || 8080,
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	config = reqquire('config'),
	client = require('socket.io').listen(http).sockets;


app.get('/css/style.css', function(req, res){
  	res.sendfile('html/css/style.css');
});

app.get('/js/script.js', function(req, res){
  	res.sendfile('html/js/script.js');
});

app.get('/', function(req, res){
  	res.sendfile('html/index.html');
});

http.listen(port, function() {
    console.log('Listening on port %d', port);
});

var escape = function(html){
	var escapedHtml = html.replace(/&/g, '&amp;')
                  .replace(/>/g, '&gt;')
                  .replace(/</g, '&lt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
    return escapedHtml;              
};

mongo.connect(config.mongo, function(err, db){
	if(err) 
		console.log('Connection to mongohq failed!');
	client.on('connection', function(socket){

		var col = db.collection('messages');
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
			socket.emit('output', res);
		});

		socket.on('input', function(data){
			var name = escape(data.name),
				message = escape(data.message),
				date = data.date;
				whitespacePattern = /^\s*$/;

			if(whitespacePattern.test(name) || whitespacePattern.test(message)){
				console.log('Required field/s empty!');
			}
			else{
				col.insert({name:name, message:message, date:date}, function(){
					console.log('Inserted!');
					client.emit('output', [data]);
				});
			}
		});
	});
});
