import mongoose from 'mongoose';

// Схема для услуг
const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
});

// Схема для элементов (используется в benefits, types и т.д.)
const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  image: { type: String }
});

// Схема для секций с элементами
const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  items: [itemSchema]
});

// Схема для галереи
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }]
});

// Схема для главного баннера
const heroSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  buttonText: { type: String, required: true },
  image: { type: String, required: true }
});

// Основная схема контента
const contentSchema = new mongoose.Schema({
  services: [serviceSchema],
  benefits: sectionSchema,
  types: sectionSchema,
  gallery: gallerySchema,
  hero: heroSchema
}, { timestamps: true });

// Создаем модель
const Content = mongoose.model('Content', contentSchema);

export default Content; 