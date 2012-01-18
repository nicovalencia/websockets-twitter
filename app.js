var app = require('http').createServer(handler)
, $ = require('jquery')
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(80);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    }
  );
}

io.sockets.on('connection', function (socket) {

  var query = '';
  var interval = 10000;
  var updateData = function () {
    $.ajax({
      url: 'http://search.twitter.com/search.json?rpp=1&q='+query,
      dataType: 'jsonp',
      success: function(response){
        socket.emit('twitter_feed', response.results);
        setTimeout( updateData, interval );
      },
      error: function(){ console.log('\n-----> Error getting data from Twitter...\n'); }
    });
  };

  updateData();

  socket.on('change_query', function (client_query) {
    console.log('\n-----> CLIENT: Changing query to: '+client_query+'\n');
    query = client_query;
  });

  socket.on('change_interval', function (client_interval) {
    console.log('\n-----> CLIENT: Changing interval to: '+client_interval+'\n');
    interval = client_interval * 1000;
  });

});

