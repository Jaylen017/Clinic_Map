import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import clinicRoutes from './routes/clinic.routes';
import bookingRoutes from './routes/booking.routes';
import authRoutes from './routes/auth.routes';
import { setupSocketIO } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.IO first (before routes that might use it)
setupSocketIO(io);

// Routes (pass io instance to routes that need it)
app.use('/api/clinic', clinicRoutes);
app.use('/api', bookingRoutes);
app.use('/api', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Export io for use in other modules
export { io };

