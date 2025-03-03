import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import { logger, httpLogger } from './utils/logger';
import requestRoutes from './routes/requests';
import logsRoutes from './routes/logs';
// @ts-ignore - временная заглушка для экспериментальных маршрутов изображений
import imageRoutes from './routes/imageRoutes';
import { initializeAdmin } from './scripts/init';

// Загрузка переменных окружения
dotenv.config();

console.log('Starting server with configuration:', {
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 3000
});

// Подключение к базе данных и инициализация администратора
connectDB()
  .then(async () => {
    console.log('Database connected successfully');
    logger.info('База данных подключена успешно');
    await initializeAdmin();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    logger.error('Ошибка при подключении к базе данных:', { error: err.message, stack: err.stack });
    process.exit(1);
  });

const app = express();
const port = process.env.PORT || 3000;

// Настройка CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger); // Добавляем логирование HTTP запросов

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/images', imageRoutes);

// Базовый маршрут API
app.get('/api', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API Krovli38',
    endpoints: [
      '/api/auth',
      '/api/requests',
      '/api/logs',
      '/api/images'
    ]
  });
});

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  logger.error('Необработанная ошибка:', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  res.status(500).json({ message: 'Что-то пошло не так!' });
});

// Запуск сервера
const portNumber = parseInt(port.toString(), 10);
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`Server is running on port ${portNumber} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Сервер запущен на порту ${portNumber} в режиме ${process.env.NODE_ENV || 'development'}`);
}); 