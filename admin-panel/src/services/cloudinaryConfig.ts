/**
 * Конфигурация Cloudinary для использования в компонентах
 */
import { IMAGE_CONFIG, SETTINGS_GROUPS } from '../constants';

// Настройки из переменных окружения
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'krovli38_preset';

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
 * Основная конфигурация для Media Library
 */
export const getMediaLibraryConfig = (options = {}) => {
  return {
    cloud_name: IMAGE_CONFIG.CLOUD_NAME,
    api_key: IMAGE_CONFIG.API_KEY,
    multiple: false,
    remove_header: false,
    max_files: 1,
    insert_caption: 'Выбрать',
    default_transformations: [],
    ...options
  };
};

/**
 * Конфигурация для Upload Widget
 */
export const getUploadWidgetConfig = (options = {}) => {
  return {
    cloudName: IMAGE_CONFIG.CLOUD_NAME,
    apiKey: IMAGE_CONFIG.API_KEY,
    uploadPreset: IMAGE_CONFIG.UPLOAD_PRESET,
    sources: UPLOAD_SOURCES,
    multiple: true,
    folder: 'krovli38',
    resourceType: 'image',
    clientAllowedFormats: IMAGE_CONFIG.ACCEPTED_TYPES.map(type => type.replace('.', '')),
    maxImageFileSize: IMAGE_CONFIG.MAX_SIZE,
    maxVideoFileSize: IMAGE_CONFIG.MAX_SIZE * 10, // 10 times larger for videos
    language: 'ru',
    styles: {
      palette: {
        window: '#FFFFFF',
        windowBorder: '#90A0B3',
        tabIcon: '#0078FF',
        menuIcons: '#5A616A',
        textDark: '#000000',
        textLight: '#FFFFFF',
        link: '#0078FF',
        action: '#FF620C',
        inactiveTabIcon: '#0E2F5A',
        error: '#F44235',
        inProgress: '#0078FF',
        complete: '#20B832',
        sourceBg: '#E4EBF1'
      },
      fonts: {
        default: null,
        "sans-serif": {
          url: null,
          active: true
        }
      }
    },
    ...options
  };
};

export default {
  CLOUD_NAME: IMAGE_CONFIG.CLOUD_NAME,
  API_KEY: IMAGE_CONFIG.API_KEY,
  UPLOAD_PRESET: IMAGE_CONFIG.UPLOAD_PRESET,
  getMediaLibraryConfig,
  getUploadWidgetConfig
}; 