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

// Debug socket connections
io.engine.on("connection_error", (err) => {
  console.log('Socket.IO connection error:', err.req, err.code, err.message, err.context);
});

app.locals.io = io;

// Handle new Socket.IO connections
io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    // Log all rooms the socket is in
    console.log('Initial rooms:', Array.from(socket.rooms));

    // Join the global updates room
    socket.on('joinGlobalRoom', () => {
        socket.join('globalUpdates');
        console.log('🌐 Socket joined global room:', socket.id);
        console.log('Current rooms for socket:', Array.from(socket.rooms));
        // Emit test event to verify connection
        socket.emit('globalRoomJoined', { message: 'Successfully joined global room' });
    });

    // Join individual product room
    socket.on('joinRoom', (productId) => {
        socket.join(productId);
        console.log('🎯 Socket joined product room:', socket.id, 'Product:', productId);
        console.log('Current rooms for socket:', Array.from(socket.rooms));
        // Emit test event to verify connection
        socket.emit('roomJoined', { productId, message: 'Successfully joined product room' });
    });

    socket.on('leaveRoom', (productId) => {
        socket.leave(productId);
        console.log('🚪 Socket left room:', socket.id, 'Product:', productId);
        console.log('Remaining rooms:', Array.from(socket.rooms));
    });

    // Debug incoming events
    socket.onAny((event, ...args) => {
        console.log('📨 Received event:', event, 'with args:', args);
    });

    // Handle bid updates
    socket.on('placeBid', async ({ productId, amount, userId }) => {
        try {
            console.log('🎯 Handling bid placement:', { productId, amount, userId });
            
            // Standardize the payload format
            const bidPayload = {
                productId,
                currentBid: Number(amount),
                bidder: userId
            };
            
            // Emit to specific product room
            socket.to(productId).emit('bidPlaced', bidPayload);
            
            // Also emit to global updates room
            io.to('globalUpdates').emit('globalBidUpdate', bidPayload);
            
            console.log('✅ Bid events emitted:', bidPayload);
        } catch (error) {
            console.error('Error handling bid:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
        console.log('Rooms at disconnect:', Array.from(socket.rooms));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
