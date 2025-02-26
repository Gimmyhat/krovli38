import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// Генерация JWT токена
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET не установлен');
  }
  
  return jwt.sign(
    { id: userId },
    secret,
    { expiresIn: '7d' } // Используем фиксированное значение для упрощения
  );
};

// Регистрация нового администратора
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      return;
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создание нового пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'admin'
    }) as IUser;

    // Генерация токена
    const token = generateToken(user._id.toString());

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при регистрации пользователя'
    });
  }
};

// Вход в систему
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Проверка наличия email и пароля
    if (!email || !password) {
      res.status(400).json({ message: 'Пожалуйста, укажите email и пароль' });
      return;
    }

    // Поиск пользователя и включение поля password
    const user = await User.findOne({ email }).select('+password') as IUser | null;
    if (!user) {
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    // Проверка пароля
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Неверный email или пароль' });
      return;
    }

    // Генерация токена
    const token = generateToken(user._id.toString());

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при входе в систему'
    });
  }
}; 