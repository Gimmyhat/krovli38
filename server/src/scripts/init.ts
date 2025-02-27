import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const initializeAdmin = async () => {
  try {
    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: 'admin@krovli38.ru' });
    if (existingAdmin) {
      logger.info('Администратор уже существует');
      return;
    }

    // Создаем нового администратора
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    const admin = await User.create({
      email: 'admin@krovli38.ru',
      password: hashedPassword,
      name: 'Администратор',
      role: 'admin'
    });

    logger.info('Администратор успешно создан:', { email: admin.email });
  } catch (error) {
    logger.error('Ошибка при создании администратора:', { error });
  }
}; 