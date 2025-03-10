import mongoose from 'mongoose';

/**
 * Модель для хранения настроек сайта
 * Все настраиваемые элементы дизайна и контента хранятся здесь
 */
const siteSettingsSchema = new mongoose.Schema({
  // Идентификатор настройки (уникальный ключ)
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Название настройки (для отображения в админке)
  name: { 
    type: String, 
    required: true 
  },
  
  // Тип настройки - определяет способ отображения в админке
  type: { 
    type: String, 
    enum: ['text', 'textarea', 'number', 'boolean', 'color', 'image', 'select', 'json'],
    required: true 
  },
  
  // Группа настроек (для организации в админке)
  group: { 
    type: String, 
    required: true,
    enum: ['general', 'hero', 'services', 'benefits', 'gallery', 'contact', 'footer', 'colors', 'typography']
  },
  
  // Значение настройки (может быть разных типов)
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  
  // Значение по умолчанию
  defaultValue: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Дополнительные настройки для поля (например, варианты для select)
  options: { 
    type: mongoose.Schema.Types.Mixed 
  },
  
  // Порядок отображения в админке
  order: { 
    type: Number, 
    default: 0 
  },
  
  // Описание настройки
  description: { 
    type: String 
  }
}, { 
  timestamps: true 
});

// Индексы для более эффективных запросов
siteSettingsSchema.index({ key: 1 });
siteSettingsSchema.index({ group: 1 });
siteSettingsSchema.index({ order: 1 });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings; 