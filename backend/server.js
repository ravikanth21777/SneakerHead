const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const http = require('http');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

const server = http.createServer(app);

const {Server} = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.locals.io = io;

// Handle new Socket.IO connections:
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // When a client “joins” a product’s room:
  socket.on('joinProductRoom', (productId) => {
    socket.join(productId);
    console.log(`Socket ${socket.id} joined room ${productId}`);
  });

   // (Optional) You can listen to other real-time events here…

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
