const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://socket-client-lac.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Middleware to enable CORS
app.use(cors());

// Example GET endpoint
app.get('/', (req, res) => {
  res.send('Socket.io server is running');
});

const clientLocations = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send all existing locations to the newly connected client
  socket.emit('initialLocations', Object.values(clientLocations));

  socket.on('locationUpdate', (location) => {
    console.log('Received location update from:', socket.id, location);

    // Store the client's location
    clientLocations[socket.id] = { ...location, userId: socket.id };

    // Emit the location update to all clients
    io.emit('locationUpdate', clientLocations[socket.id]);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the client's location
    delete clientLocations[socket.id];

    // Emit the updated locations to all clients
    io.emit('removeLocation', socket.id);
  });
});

// Set the port for the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
