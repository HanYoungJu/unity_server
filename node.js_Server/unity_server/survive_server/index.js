var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);

// global variables for the server
var playerSpawnPoints = [];
var clients = [];
var idNumber = 0;
var startTime;
var duration = 33.5;

app.get('/', function(req, res) {
	res.send('hey you got back get "/"');
});

io.on('connection', function(socket) {
	
	var currentPlayer = {};
	currentPlayer.name = 'unknown';

	socket.on('player connect', function() {
		console.log(currentPlayer.name+' recv: player connect');
		for(var i =0; i<clients.length;i++) {
			var playerConnected = {
				name:clients[i].name,
				position:clients[i].position,
				rotation:clients[i].position,
				health:clients[i].health
			}
			// in your current game, we need to tell you about the other players.
			socket.emit('other player connected', playerConnected);
		}
	});

	socket.on('play', function(data) {
        console.log(String(idNumber)+' recv: play: '+JSON.stringify(data));
		// if this is the first person to join the game init the enemies
		if(clients.length === 0) {
			playerSpawnPoints = [];
			data.playerSpawnPoints.forEach(function(_playerSpawnPoint) {
				var playerSpawnPoint = {
					position: _playerSpawnPoint.position,
					rotation: _playerSpawnPoint.rotation
				};
				playerSpawnPoints.push(playerSpawnPoint);
            });
            startTime = new Date();
		}
		var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
		currentPlayer = {
			name:String(idNumber),
			position: randomSpawnPoint.position,
            rotation: randomSpawnPoint.rotation
        };
        idNumber++;
		clients.push(currentPlayer);
		// in your current game, tell you that you have joined
        console.log(currentPlayer.name + ' emit: play: ' + JSON.stringify(currentPlayer));
        var time = {
            time: remainTime()
        }
        console.log(time);
        io.sockets.emit("time", time);
		socket.emit('play', currentPlayer);
		// in your current game, we need to tell the other players about you.
		socket.broadcast.emit('other player connected', currentPlayer);
    });

    socket.on('gameRestart', function () {
        startTime = new Date();
        var time = {
            time: remainTime()
        }
        console.log("restart");
        io.sockets.emit('gameRestart', time);
    });

	socket.on('playerAction', function(data) {
        currentPlayer.position = data.position;
        currentPlayer.rotation = data.rotation;
        var action = {
            name: currentPlayer.name,
            position: currentPlayer.position,
            rotation: currentPlayer.rotation,
            move: data.move,
            jump: data.jump,
            crouch: data.crouch,
            kick: data.kick
        }
		socket.broadcast.emit('player action', action);
	});
	
	socket.on('disconnect', function() {
		console.log(currentPlayer.name+' recv: disconnect '+currentPlayer.name);
		socket.broadcast.emit('other player disconnected', currentPlayer);
		socket.emit('other player disconnected', currentPlayer);
		console.log(currentPlayer.name+' bcst: other player disconnected '+JSON.stringify(currentPlayer));
		for(var i=0; i<clients.length; i++) {
			if(clients[i].name === currentPlayer.name) {
				clients.splice(i,1);
			}
		}
	});

});

console.log('--- server is running ...');

function remainTime() {
    return duration - (new Date() - startTime)*0.001;
}

function guid() {
	function s4() {
		return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
