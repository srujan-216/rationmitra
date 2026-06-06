const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { port, nodeEnv, corsOrigin } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./socket');

// Route imports
const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const inventoryRoutes = require('./routes/inventory');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const shopRoutes = require('./routes/shop');
const faceRoutes = require('./routes/face');
const mlRoutes = require('./routes/ml');
const notificationRoutes = require('./routes/notification');
const rationCardRoutes = require('./routes/rationCard');
const distributionRoutes = require('./routes/distribution');
const grievanceRoutes = require('./routes/grievance');
const allocationRoutes = require('./routes/allocation');
const officerDashboardRoutes = require('./routes/officerDashboard');

// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
});

// Make io accessible in controllers
app.set('io', io);

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ration-cards', rationCardRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/officer-dashboard', officerDashboardRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: nodeEnv, timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Socket.io setup
setupSocket(io);

// Start server
const start = async () => {
  await connectDB();
  server.listen(port, () => {
    console.log(`RationMitra server running on port ${port} [${nodeEnv}]`);
  });
};

start();
