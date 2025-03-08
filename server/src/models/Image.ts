import mongoose from 'mongoose';

/**
 * Модель для хранения метаданных изображений
 * Изображения физически хранятся в Cloudinary
 */
const imageSchema = new mongoose.Schema({
  // Cloudinary информация
  public_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  secure_url: { 
    type: String, 
    required: true 
  },
  
  // Метаданные для отображения
  type: { 
    type: String, 
    enum: ['banner', 'gallery', 'logo', 'background', 'content', 'project'],
    required: true 
  },
  alt: { 
    type: String, 
    default: '' 
  },
  title: { 
    type: String, 
    default: '' 
  },
  description: {
    type: String,
    default: ''
  },
  section: { 
    type: String, 
    default: 'general' 
  },
  
  // Технические детали
  width: { 
    type: Number 
  },
  height: { 
    type: Number 
  },
  format: { 
    type: String 
  },
  size: {
    type: Number
  },
  
  // Организация и фильтрация
  tags: [{ 
    type: String 
  }],
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Связи с другими коллекциями (если нужно)
  relatedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  }
}, { 
  timestamps: true 
});

// Индексы для более эффективных запросов
imageSchema.index({ type: 1 });
imageSchema.index({ section: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ isActive: 1 });
imageSchema.index({ order: 1 });

const Image = mongoose.model('Image', imageSchema);

export default Image; 