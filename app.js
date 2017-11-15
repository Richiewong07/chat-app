var express = require('express');
var app = express();

var ROOMS = {}

var http = require('http').Server(app);
var io = require('socket.io')(http); //serves client automatically for us

app.set('view engine', 'hbs');

app.use('/socket-io',
  express.static('node_modules/socket.io-client/dist'));

//define route handle for homepage
app.get('/', function (request, response) {
  response.render('chat.hbs');
});

//connection event for client
io.on('connection', function(client){
  console.log('A USER CONNECTED');

  //connects to room/groups on backend
  client.on('join-room', function(room){
    client.join(room, function() {
      console.log(client.rooms);
      io.to(room).emit('chat-msg', '**new user joined**');
      console.log(client.id);
    });

      if (ROOMS[room]) {
        ROOMS[room].push(client.id);
      } else {
        ROOMS[room] = [client.id];
      }
      console.log(ROOMS);
      ROOMS[room].forEach(function (id) {
        if (id != client.id) {
          io.to(id).emit('chat-msg', '**an idiot joined**');
        }
      });

    //event for incoming message, gets message object
    client.on('incoming', function(msg){
      console.log(msg);
      io.to(msg.room).emit('chat-msg', msg.msg); //io.to only broadcast to certain room, io.emit broadcast message to everyone
    });
  });


  //disconnection even for client
  client.on('disconnect', function () {
    console.log('A USER DISCONNECTED');
  });
});


//http instead of app.listen
http.listen(8000, function () {
  console.log('Listening on port 8000');
});
