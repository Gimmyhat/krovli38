import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { DATABASE } from '../constants';

export const connectDB = async (): Promise<void> => {
  try {
    logger.info('Подключение к MongoDB...');
    
    // Используем URI из переменных окружения или константы
    // Проверяем обе переменные MONGO_URI и MONGODB_URI для совместимости
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || DATABASE.URI;
    
    console.log('Connecting to MongoDB with URI:', mongoUri);
    
    await mongoose.connect(mongoUri);
    
    logger.info('MongoDB подключена успешно');
    
    mongoose.connection.on('error', (err) => {
      logger.error(`Ошибка MongoDB:`, { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB отключена');
    });

  } catch (err: any) {
    logger.error('Ошибка подключения к MongoDB:', err);
    console.error('MongoDB connection error:', err);
    throw err;
  }
}; 