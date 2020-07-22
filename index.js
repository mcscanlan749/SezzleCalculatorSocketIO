const express = require("express");
const http = require("http");
const app = express();
const path = require('path');
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);
const cors = require("cors");

//const router = require('./router');

const PORT = process.env.PORT || 5000;

app.use(cors());
//app.use(router);
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'socket-app/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/socket-app/build/index.html'));
});


io.on("connection", socket => {
	socket.emit("your id", socket.id);
	socket.on("send message", body => {
		io.emit("message", body)
	})
})

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));