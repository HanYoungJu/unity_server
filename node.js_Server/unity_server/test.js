var express = require('express');
var app = express();
var path = require('path');
server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8080;
app.get('/users', (req, res) => {
   console.log('who get in here/users');  
});
server.listen(port,() => {
  console.log('Server listening at port %d', port);
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
	console.log('one user connected');
	socket.on('Msg',function(data){
		socket.emit('MsgRes', data);
		console.log(data);
	});
});
