import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import { logger, httpLogger } from './utils/logger';
import requestRoutes from './routes/requests';
import logsRoutes from './routes/logs';

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB().catch(err => {
  logger.error('Ошибка при подключении к базе данных:', { error: err.message, stack: err.stack });
  process.exit(1);
});

const app = express();
const port = process.env.PORT || 5000;

// Настройка CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger); // Добавляем логирование HTTP запросов

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/logs', logsRoutes);

// Базовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.json({ message: 'API сервер работает' });
});

// Обработка ошибок
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
app.listen(port, () => {
  logger.info(`Сервер запущен на порту ${port}`);
}); 