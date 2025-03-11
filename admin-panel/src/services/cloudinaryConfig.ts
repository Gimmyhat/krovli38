/**
 * Конфигурация Cloudinary для использования в компонентах
 */
import { IMAGE_CONFIG, SETTINGS_GROUPS } from '../constants';

// Настройки из переменных окружения
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Типы для опций
interface MediaLibraryOptions {
  multiple?: boolean;
  maxFiles?: number;
  [key: string]: any;
}

interface UploadWidgetOptions {
  multiple?: boolean;
  maxFiles?: number;
  tags?: string[];
  [key: string]: any;
}

// Проверка переменных окружения
if (!CLOUD_NAME || !API_KEY || !UPLOAD_PRESET) {
  console.error('Отсутствуют необходимые переменные окружения для Cloudinary!', {
    CLOUD_NAME,
    API_KEY,
    UPLOAD_PRESET
  });
}

// Экспорт настроек для совместимости с существующим кодом
export const CLOUDINARY_CLOUD_NAME = CLOUD_NAME;
export const CLOUDINARY_API_KEY = API_KEY;
export const CLOUDINARY_UPLOAD_PRESET = UPLOAD_PRESET;

// Логирование настроек при запуске (в dev режиме)
if (import.meta.env.DEV) {
  console.log('Cloudinary config:', {
    CLOUD_NAME: IMAGE_CONFIG.CLOUD_NAME,
    API_KEY: IMAGE_CONFIG.API_KEY,
    UPLOAD_PRESET: IMAGE_CONFIG.UPLOAD_PRESET
  });
}

/**
 * Источники для загрузки файлов в Upload Widget
 */
export const UPLOAD_SOURCES = [
  'local',
  'url',
  'camera',
  'google_drive',
  'dropbox',
  'facebook',
  'instagram',
  'shutterstock'
];

/**
 * Типы изображений для использования в UI
 */
export const IMAGE_TYPES = [
  { value: 'banner', label: 'Баннер' },
  { value: 'gallery', label: 'Галерея' },
  { value: 'logo', label: 'Логотип' },
  { value: 'background', label: 'Фон' },
  { value: 'content', label: 'Контент' },
  { value: 'project', label: 'Проект' }
];

/**
 * Разделы сайта для использования в UI
 */
export const SECTIONS = SETTINGS_GROUPS.map(group => ({
  value: group.value,
  label: group.label
}));

/**
 * Доступные теги для изображений
 */
export const AVAILABLE_TAGS = [
  { value: 'featured', label: 'Главное' },
  { value: 'new', label: 'Новое' },
  { value: 'background', label: 'Фон' },
  { value: 'small', label: 'Маленькое' },
  { value: 'large', label: 'Большое' }
];

/**
 * Получить конфигурацию для Media Library
 */
export const getMediaLibraryConfig = (options: MediaLibraryOptions = {}) => {
  console.log('Инициализация Media Library с параметрами:', {
    cloud_name: CLOUD_NAME,
    api_key: API_KEY
  });
  
  // Возвращаем конфигурацию с базовыми настройками
  return {
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    multiple: options.multiple ?? false,
    remove_header: true,
    max_files: options.maxFiles ?? 10,
    insert_caption: 'Выбрать',
    default_transformations: [],
    ...options,
  };
};

/**
 * Получить конфигурацию для Upload Widget
 */
export const getUploadWidgetConfig = (options: UploadWidgetOptions = {}) => {
  console.log('Инициализация Upload Widget с параметрами:', {
    cloudName: CLOUD_NAME,
    uploadPreset: UPLOAD_PRESET
  });
  
  // Возвращаем конфигурацию с базовыми настройками
  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    uploadPreset: UPLOAD_PRESET,
    multiple: options.multiple ?? true,
    maxFiles: options.maxFiles ?? 10,
    sources: ['local', 'url', 'camera'],
    showUploadMoreButton: true,
    tags: options.tags ?? [],
    resourceType: 'image',
    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'],
    maxFileSize: 5000000, // 5 MB
    queueDuration: 1000, // Очередь загрузки с задержкой для предотвращения 429
    ...options,
  };
};

export default {
  CLOUD_NAME,
  API_KEY,
  UPLOAD_PRESET,
  getMediaLibraryConfig,
  getUploadWidgetConfig
}; 