import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const checkAdmin = async () => {
  try {
    // Подключение к базе данных
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:admin_password@localhost:27017/krovli38?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Проверяем существующего администратора
    const admin = await User.findOne({ email: 'admin@krovli38.ru' }).select('+password');
    if (!admin) {
      console.log('Администратор не найден');
      process.exit(1);
    }

    console.log('Администратор найден:', {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      hasPassword: !!admin.password
    });

    // Обновляем пароль администратора
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('Пароль администратора обновлен');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
};

checkAdmin(); 