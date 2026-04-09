import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversations.js';
import userRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import { setupSocketHandlers } from './socket/handlers.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.io
setupSocketHandlers(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   Chat App Server                                        ║
║   Running on http://localhost:${PORT}                      ║
║                                                          ║
║   API Endpoints:                                         ║
║   - POST /api/auth/register                              ║
║   - POST /api/auth/login                                 ║
║   - GET  /api/conversations                              ║
║   - GET  /api/users                                      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export { io };
