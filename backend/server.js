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

const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
});

app.locals.io = io;

// Handle new Socket.IO connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinRoom', (productId) => {
        socket.join(productId);
        console.log(`Socket ${socket.id} joined room ${productId}`);
    });

    socket.on('leaveRoom', (productId) => {
        socket.leave(productId);
        console.log(`Socket ${socket.id} left room ${productId}`);
    });

    // Handle bid updates
    socket.on('placeBid', async ({ productId, amount, userId }) => {
        try {
            socket.to(productId).emit('bidPlaced', { productId, amount, userId });
        } catch (error) {
            console.error('Error handling bid:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
