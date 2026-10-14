import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import config from './config/index.js';
import connectDB from './config/db.js';
import { setSocketIO } from './services/notification.service.js';

const server = http.createServer(app);

// Socket.IO Setup for real-time notifications
const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin === '*' ? '*' : [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
});

setSocketIO(io);

io.on('connection', (socket) => {
  // Join user room for targeted notifications
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

const startServer = async () => {
  try {
    await connectDB();

    server.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`  InternHub AI API Server running on port ${config.port}`);
      console.log(`  Environment: ${config.env}`);
      console.log(`  Health Check: http://localhost:${config.port}/api/v1/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]:', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});
