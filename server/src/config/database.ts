import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI не указан в переменных окружения');
    }

    logger.info('Подключение к MongoDB...');
    await mongoose.connect(mongoUri);
    logger.info('MongoDB подключена успешно');
    
    mongoose.connection.on('error', (err) => {
      logger.error(`Ошибка MongoDB:`, { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB отключена');
    });

  } catch (error: any) {
    logger.error('Ошибка подключения к MongoDB:', { 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}; 