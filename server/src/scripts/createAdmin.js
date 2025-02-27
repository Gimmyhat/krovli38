import mongoose from 'mongoose';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin';

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const existingAdmin = await User.findOne({ email: 'admin@krovli38.ru' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    const admin = new User({
      email: 'admin@krovli38.ru',
      password: hashedPassword,
      role: 'admin',
      name: 'Administrator'
    });
    
    await admin.save();
    
    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin(); 