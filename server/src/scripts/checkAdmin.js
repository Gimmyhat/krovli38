import mongoose from 'mongoose';
import { User } from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin';

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const admin = await User.findOne({ email: 'admin@krovli38.ru' });
    
    if (!admin) {
      console.error('Admin user not found');
      process.exit(1);
    }
    
    console.log('Admin user exists');
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin:', error);
    process.exit(1);
  }
}

checkAdmin(); 