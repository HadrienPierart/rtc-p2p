var http = require('http'),
    fs = require('fs'),
    uuid = require('node-uuid');

var server = http.createServer(function (req, res) {
  fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error');
      }

      res.writeHead(200);
      res.end(data);
    });
});

server.listen(8000);

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  var nodeId = uuid.v4();
  socket.join(nodeId);

  socket.on('candidate', function (data) {
    // Notify all nodes about new candidates.
    socket.broadcast.emit('candidate', {
      'from': nodeId,
      'candidate': data.candidate
    });
  });

  socket.on('offer', function (data) {
    io.sockets.in(data.to).emit('offer', {
      'from': nodeId,
      'desc': data.desc
    });
  });

  socket.on('answer', function (data) {
    io.sockets.in(data.to).emit('answer', {
      'from': nodeId,
      'desc': data.desc
    });
  });

  socket.on('close', function () {
    socket.leave(nodeId);
    socket.broadcast.emit('disconnect', {
      'from': nodeId
    });
  });

  socket.broadcast.emit('new', {
    'from': nodeId
  });

  /*
  for (var room in io.sockets.manager.rooms) {
    room = room.substr(1);

    if (room && room != nodeId && io.sockets.clients(room)) {
      socket.emit('candidate', {
        'from': room
      });
    }
  }
  */
});