const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const setupSocket = (io) => {
  // Authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, jwtSecret);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join shop room for real-time updates
    socket.on('queue:join-room', (shopId) => {
      socket.join(`shop:${shopId}`);
      console.log(`User ${socket.userId} joined room shop:${shopId}`);
    });

    socket.on('queue:leave-room', (shopId) => {
      socket.leave(`shop:${shopId}`);
    });

    // Shop owner broadcasts queue position updates
    socket.on('queue:position-update', (data) => {
      io.to(`shop:${data.shopId}`).emit('queue:position-update', data);
    });

    // Alert user their turn is approaching
    socket.on('queue:alert-approaching', (data) => {
      io.to(`shop:${data.shopId}`).emit('queue:alert-approaching', {
        userId: data.userId,
        ticketNumber: data.ticketNumber,
        message: 'Your turn is approaching! Please be ready.',
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = setupSocket;
