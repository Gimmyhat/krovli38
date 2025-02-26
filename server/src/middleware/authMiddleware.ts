import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

interface JwtPayload {
  id: string;
}

// Расширяем интерфейс Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Получаем токен из заголовка
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ message: 'Пожалуйста, войдите в систему' });
      return;
    }

    try {
      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      // Получаем пользователя
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        res.status(401).json({ message: 'Токен больше не действителен' });
        return;
      }

      // Добавляем пользователя к запросу
      req.user = currentUser;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Неверный токен' });
      return;
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
}; 