import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import healthRouter from './routes/health';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.use('/api/health', healthRouter);

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

export default app; 