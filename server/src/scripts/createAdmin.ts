import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Подключение к базе данных
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/krovli38';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Проверяем, существует ли уже администратор
    const existingAdmin = await User.findOne({ email: 'admin@krovli38.ru' });
    if (existingAdmin) {
      console.log('Администратор уже существует');
      process.exit(0);
    }

    // Создаем нового администратора
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    const admin = await User.create({
      email: 'admin@krovli38.ru',
      password: hashedPassword,
      name: 'Администратор',
      role: 'admin'
    });

    console.log('Администратор успешно создан:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  }
};

createAdmin(); 