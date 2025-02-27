import axios from 'axios';
import logger from './logger';

// Настраиваем базовый URL для API
axios.defaults.baseURL = '/';

// Добавляем перехватчик для добавления токена к запросам
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    logger.debug('Подготовка запроса', { 
      url: config.url,
      method: config.method,
      hasToken: !!token
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Ошибка при подготовке запроса', { error });
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для обработки ошибок
axios.interceptors.response.use(
  (response) => {
    logger.debug('Успешный ответ', { 
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    logger.error('Ошибка ответа', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    if (error.response?.status === 401 || error.response?.status === 403) {
      // Если получаем 401 или 403, очищаем данные авторизации
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Перенаправляем на страницу входа через window.location,
      // так как у нас нет доступа к navigate из react-router здесь
      window.location.pathname = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 