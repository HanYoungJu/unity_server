var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

// global variables for the server
var playerSpawnPoints = [];
var clients = [];

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
			};
			// in your current game, we need to tell you about the other players.
			socket.emit('other player connected', playerConnected);
		}
	});

	socket.on('play', function(data) {
		console.log(currentPlayer.name+' recv: play: '+JSON.stringify(data));
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
		}
		var randomSpawnPoint = playerSpawnPoints[Math.floor(Math.random() * playerSpawnPoints.length)];
		currentPlayer = {
			name:data.name,
			position: randomSpawnPoint.position,
			rotation: randomSpawnPoint.rotation,
			health: 100
		};
		clients.push(currentPlayer);
		// in your current game, tell you that you have joined
		console.log(currentPlayer.name+' emit: play: '+JSON.stringify(currentPlayer));
		socket.emit('play', currentPlayer);
		// in your current game, we need to tell the other players about you.
		socket.broadcast.emit('other player connected', currentPlayer);
	});

	socket.on('player move', function(data) {
		currentPlayer.position = data.position;
		socket.broadcast.emit('player move', currentPlayer);
	});

	socket.on('player turn', function(data) {
		currentPlayer.rotation = data.rotation;
		socket.broadcast.emit('player turn', currentPlayer);
	});

	socket.on('player shoot', function() {
		var data = {
			name: currentPlayer.name
		};
		console.log(currentPlayer.name+' bcst: shoot: '+JSON.stringify(data));
		socket.broadcast.emit('player shoot', data);
	});
	socket.on('newMsg', function(data) {
		console.log('recv: Msg: '+JSON.stringify(data));
		socket.broadcast.emit('newMsg', data);
	});
	socket.on('animation', function(data) {
		//console.log('Animation '+JSON.stringify(data));
		socket.broadcast.emit('animation', data);
	});

	socket.on('health', function(data) {
		console.log(currentPlayer.name+' recv: health: '+JSON.stringify(data));
		// only change the health once, we can do this by checking the originating player
		if(data.from === currentPlayer.name) {
			var indexDamaged = 0;
			if(!data.isEnemy) {
				clients = clients.map(function(client, index) {
					if(client.name === data.name) {
						indexDamaged = index;
						client.health -= data.healthChange;
					}
					return client;
				});
			} else {
				enemies = enemies.map(function(enemy, index) {
					if(enemy.name === data.name) {
						indexDamaged = index;
						enemy.health -= data.healthChange;
					}
					return enemy;
				});
			}

			var response = {
				name: (!data.isEnemy) ? clients[indexDamaged].name : enemies[indexDamaged].name,
				health: (!data.isEnemy) ? clients[indexDamaged].health : enemies[indexDamaged].health
			};
			console.log(currentPlayer.name+' bcst: health: '+JSON.stringify(response));
			socket.emit('health', response);
			socket.broadcast.emit('health', response);
		}
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

function guid() {
	function s4() {
		return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
