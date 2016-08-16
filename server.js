var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
require("./models/models");
var Symbols = mongoose.model('Symbols')
var routes = require('./routes/routes');



mongoose.connect('mongodb://'+process.env.USER+':'+process.env.PW+'@ds145365.mlab.com:45365/stockgraph');

app.use(morgan('dev'));

//receive encoded body info from client
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

app.use('/api', routes);

io.on('connection', function(socket){
  socket.on('delete_series', function(index){
    io.emit('delete_series', index);
  });
  
  socket.on('add_series', function(index){
    io.emit('add_series', index);
    
  });
});

var port = process.env.PORT || 3000;

http.listen(port, function(){
    console.log("I am living!! On port: " + port);
})