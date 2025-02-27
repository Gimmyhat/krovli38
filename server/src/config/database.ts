import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async () => {
  try {
    logger.info('Подключение к MongoDB...');
    console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/krovli38', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('MongoDB подключена успешно');
    console.log('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => {
      logger.error(`Ошибка MongoDB:`, { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB отключена');
    });

  } catch (err) {
    logger.error('Ошибка подключения к MongoDB:', err);
    console.error('MongoDB connection error:', err);
    throw err;
  }
}; 