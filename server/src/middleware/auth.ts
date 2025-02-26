import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// Расширяем интерфейс Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware для проверки JWT токена
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn('Отсутствует заголовок авторизации', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ message: 'Отсутствует токен авторизации' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    logger.warn('Неверный формат токена', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ message: 'Неверный формат токена' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    
    logger.debug('Успешная аутентификация пользователя', { 
      userId: (decoded as any).id,
      path: req.path 
    });
    
    next();
  } catch (error) {
    logger.error('Ошибка при проверке токена', { 
      error, 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(403).json({ message: 'Недействительный или истекший токен' });
  }
};

// Middleware для проверки роли администратора
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    logger.warn('Попытка доступа без аутентификации', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ message: 'Требуется аутентификация' });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Попытка доступа без прав администратора', { 
      userId: req.user.id, 
      userRole: req.user.role,
      ip: req.ip, 
      path: req.path 
    });
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора' });
  }

  next();
}; 