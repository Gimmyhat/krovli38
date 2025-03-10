import mongoose from 'mongoose';

/**
 * Модель для хранения элементов галереи
 */
const galleryItemSchema = new mongoose.Schema({
  // Заголовок элемента галереи
  title: { 
    type: String, 
    required: true 
  },
  
  // Описание элемента галереи
  description: { 
    type: String 
  },
  
  // URL изображения
  image: { 
    type: String, 
    required: true 
  },
  
  // Категория элемента галереи
  category: { 
    type: String,
    default: 'general'
  },
  
  // Теги для фильтрации
  tags: [{ 
    type: String 
  }],
  
  // Порядок отображения
  order: { 
    type: Number, 
    default: 0 
  },
  
  // Активен ли элемент (отображается ли на сайте)
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Дата проекта (для сортировки и фильтрации)
  projectDate: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Индексы для более эффективных запросов
galleryItemSchema.index({ category: 1, order: 1 });
galleryItemSchema.index({ tags: 1 });
galleryItemSchema.index({ isActive: 1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

export default GalleryItem; 