import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

type DbStatus = {
  [key in mongoose.ConnectionStates]: string;
};

const dbStatus: DbStatus = {
  [mongoose.ConnectionStates.disconnected]: 'disconnected',
  [mongoose.ConnectionStates.connected]: 'connected',
  [mongoose.ConnectionStates.connecting]: 'connecting',
  [mongoose.ConnectionStates.disconnecting]: 'disconnecting',
  [mongoose.ConnectionStates.uninitialized]: 'uninitialized',
};

router.get('/', async (req, res) => {
  try {
    // Проверяем подключение к MongoDB
    const dbState = mongoose.connection.readyState;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: dbStatus[dbState],
      uptime: process.uptime(),
    });
  } catch (error: unknown) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 