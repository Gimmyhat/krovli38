import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import logger from '../utils/logger';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Проверка аутентификации при загрузке
  const checkAuth = useCallback(() => {
    logger.debug('Проверка аутентификации');
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Получаем данные пользователя из localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          logger.info('Пользователь аутентифицирован', { userId: parsedUser.id });
        } catch (e) {
          logger.error('Ошибка при парсинге данных пользователя', { error: e });
          // Если данные повреждены, очищаем localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } else {
      logger.debug('Пользователь не аутентифицирован');
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      logger.info('Попытка входа', { email });
      const response = await axios.post<AuthResponse>('http://localhost:3000/api/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { token, data: { user } } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      logger.info('Вход выполнен успешно', { userId: user.id });
      return true;
    } catch (error) {
      logger.error('Ошибка при входе', { error });
      return false;
    }
  };

  const logout = () => {
    logger.info('Выход из системы', { userId: user?.id });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    // Перенаправляем на страницу входа
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth,
  };
}; 