import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      logger.info('Начало процесса входа', { email });
      
      const response = await axios.post<AuthResponse>('/api/auth/login', {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      logger.debug('Получен ответ от сервера', { 
        status: response.status,
        hasToken: !!response.data.token,
        hasUser: !!response.data.data?.user 
      });

      const { token, data: { user } } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      logger.info('Вход выполнен успешно', { userId: user.id });
      
      // Перенаправляем на dashboard после успешного входа
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
      return true;
    } catch (error) {
      logger.error('Ошибка при входе', { 
        error,
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response?.data : null
      });
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
    navigate('/login');
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