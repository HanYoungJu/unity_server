// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 8080;
var insertModule = require("./dbinsertMany");
var deleteModule = require("./dbdelete");
//안녕 
var jArray = new Array();
let cursor=null;
var Client = require('mongodb').MongoClient;

app.get('/users', (req, res) => {
   console.log('who get in here/users');
  Client.connect('mongodb://localhost:27017/mongodb_tut',function(error, db){
	if(error){
		console.log(error)
	}else{
		const db1 = db.db('mongodb_tut');
	cursor = db1.collection('example').find();
	cursor.each(function(err,doc){
		if(err){
			console.log(err);
		}else{
			if(doc != null){
				console.log(doc);
				jArray.push(doc);
			}
		}

	});
	db.close();

	}  

	});
	res.json(jArray);
	jArray=[];

});


server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;
console.log('one user connected'+socket.id);
  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;

   insertModule.insertmongo(socket.username);

    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
	deleteModule.deletemongo(socket.username);
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
