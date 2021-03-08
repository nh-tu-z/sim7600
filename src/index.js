const express = require('express')
const handlebars = require('express-handlebars')
const path = require('path')
const app = express()
const httpServer = require('http').createServer(app)
const io = require('socket.io')(httpServer)
const port = 8000
const route = require('./routes/index.js')
const db = require('./config/db/index.js')
//
const net = require('net')
// const host = '10.186.160.40'
// const portSIM = 7700
//const socketSIM = net.createConnection(port, host) 

/* config body-praiser cho middleware */
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())

/* Connect to mongoDB */
db.connect()

/* Config static files */
app.use(express.static(path.join(__dirname,'public')))

/* Set views path */
app.set('views', path.join(__dirname,'resource','views'))

// /*Template Engine: handlebars*/ 
app.engine('hbs', handlebars(
  {extname: ".hbs"}
))
app.set('view engine', 'hbs')

/* Route Init */
route(app)

/* Run App */
httpServer.listen(port, () => {
  console.log(`HTTP Server listening at http://localhost:${port}`)
})

/* Socket */
io.on('connection', (socket) => {
  console.log(`${socket.id} connected!!!`)

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected!!!`)
  })

  socket.on('Client-to-Server', (data) => {
    console.log(`${socket.id} said ${data}`)
    io.sockets.emit('Server-echo',`echo ${data}`)
  })
})

// socketSIM.on('connect', (connect) => {
//   console.log('connection established')
//   socket.setEncoding('ascii')
// })


// var net = require('net');
// var http = require('http');
// const { ReadStream } = require('fs');
// const { start } = require('repl');

// var host =  '127.0.0.1';
// var port = 8080;
// var server = net.createServer(function (stream) {
// stream.setEncoding('utf8');
// //
// stream.write('Hello World!\r\n');
//    stream.pipe(stream);
//    console.log(stream.address())

//    //
// stream.on('data', function (data) { 
//     // var comm = JSON.parse(data); 
//     // if (comm.action == "Join_Request"  && comm.gameId =="game1") // join request getting from client
//     // {
//     //     var reply0 = new Object();
//     //     reply0.message = "WaitRoom";
//     //     stream.write(JSON.stringify(reply0) + "\0");   

//     // }
//     console.log('connection established 11')
// });

// stream.on('disconnect', function() {
// });
// stream.on('close', function () {
// console.log("Close");
// }); 
// stream.on('error', function () { 
// console.log("Error");
// }); 
// stream.on('connect', function () { 
//   console.log("connection established");
//   }); 

// });  

// server.listen(port, host, () => {
//   console.log(`Server listening at http://localhost:${port}`)
// });

// var http = require('http')
// var net = require('net')
// var dgram = require('dgram')
// var httpService = http.createServer(function(req, res){
//   req.getActualServerAddress();
// });
// httpService.listen(8000);

// var netService = net.createServer(function(socket) {
//   socket.getActualServerAddress();
// });
// netService.listen(8001);

// var udpService = dgram.createSocket("udp4");
// udpService.on("message", function (msg, rinfo){
//   rinfo.getActualServerAddress();
// });
// udpService.bind(8002);
