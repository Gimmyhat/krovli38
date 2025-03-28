import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import { logger, httpLogger, logRequest } from './utils/logger';
import requestRoutes from './routes/requests';
import logsRoutes from './routes/logs';
// @ts-ignore - временная заглушка для экспериментальных маршрутов изображений
import imageRoutes from './routes/imageRoutes';
// @ts-ignore - временная заглушка для экспериментальных маршрутов настроек
import settingsRoutes from './routes/settings';
// @ts-ignore - временная заглушка для маршрутов галереи
import galleryRoutes from './routes/galleryRoutes';
// Маршруты для работы с контентом
import contentRoutes from './routes/contentRoutes';
import healthRouter from './routes/health';
import { initializeAdmin } from './scripts/init';
import cloudinaryConfig from './config/cloudinary';
import { SERVER, DATABASE } from './constants';
import { ensureAllSettings, ensureSetting } from './utils/ensureSettings';

// Загрузка переменных окружения
dotenv.config();

console.log('Starting server with configuration:', {
  mongoUri: DATABASE.URI,
  nodeEnv: SERVER.NODE_ENV,
  port: SERVER.PORT
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
const port = SERVER.PORT;

// Настройка CORS
app.use(cors({
  origin: SERVER.CORS_ORIGIN, // Используем значение из констант
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger); // Добавляем логирование HTTP запросов
app.use(logRequest);

// Маршруты
app.use('/api/health', healthRouter);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/content', contentRoutes);

// Базовый маршрут API
app.get('/api', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API Krovli38',
    endpoints: [
      '/api/auth',
      '/api/requests',
      '/api/logs',
      '/api/images',
      '/api/settings',
      '/api/gallery',
      '/api/content'
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

// Обеспечиваем наличие Upload Preset для Cloudinary
const setupCloudinary = async () => {
  try {
    console.log('Инициализация Cloudinary...');
    
    // Проверяем настройки Cloudinary
    console.log('Настройки Cloudinary:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлен' : 'Не установлен',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });
    
    // Проверяем подключение к Cloudinary
    try {
      console.log('Проверка подключения к Cloudinary...');
      const pingResult = await cloudinaryConfig.v2.api.ping();
      console.log('Подключение к Cloudinary успешно:', pingResult);
      
      // Проверяем и создаем Upload Preset
      const preset = await cloudinaryConfig.ensureUploadPreset();
      console.log('Cloudinary Upload Preset настроен успешно:', preset.name);
    } catch (cloudinaryError) {
      console.error('Ошибка при подключении к Cloudinary:', cloudinaryError);
      logger.error('Ошибка подключения к Cloudinary:', { error: cloudinaryError });
    }
  } catch (error) {
    console.error('Ошибка при настройке Cloudinary Upload Preset:', error);
    logger.error('Cloudinary Upload Preset ошибка:', { error });
  }
};

// Функция для инициализации настроек сайта
const setupSettings = async () => {
  try {
    // Проверяем наличие настройки размера логотипа
    await ensureSetting('logo_size');
    console.log('Настройка размера логотипа проверена и обновлена при необходимости');
    
    // Проверяем наличие других новых настроек
    await ensureAllSettings();
    console.log('Все настройки сайта проверены и обновлены при необходимости');
  } catch (error) {
    console.error('Ошибка при инициализации настроек:', error);
    logger.error('Ошибка инициализации настроек:', { error });
  }
};

// Запуск сервера
const portNumber = parseInt(port.toString(), 10);
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`Server is running on port ${portNumber} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Сервер запущен на порту ${portNumber} в режиме ${process.env.NODE_ENV || 'development'}`);
  
  // Инициализируем настройки сайта и Cloudinary
  setupSettings();
  setupCloudinary();
}); 