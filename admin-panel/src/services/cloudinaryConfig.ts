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
    CLOUD_NAME,
    API_KEY, 
    options
  });
  
  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    uploadPreset: UPLOAD_PRESET,
    multiple: options.multiple ?? true,
    maxFiles: options.maxFiles ?? 10,
    resourceType: 'auto',
    sources: ['local', 'url', 'camera'],
    showUploadMoreButton: true,
    autoMinimize: false,
    language: 'ru',
    text: {
      ru: {
        menu: {
          files: 'Мои файлы',
          web: 'URL адрес',
          camera: 'Камера',
          dropbox: 'Dropbox',
          facebook: 'Facebook',
          instagram: 'Instagram'
        },
        local: {
          browse: 'Выбрать',
          dd_title_single: 'Перетащите файл сюда',
          dd_title_multi: 'Перетащите файлы сюда',
          drop_title_single: 'Отпустите для загрузки',
          drop_title_multiple: 'Отпустите для загрузки'
        }
      }
    },
    styles: {
      palette: {
        window: "#FFFFFF",
        windowBorder: "#90A0B3",
        tabIcon: "#0094C7",
        menuIcons: "#5A616A",
        textDark: "#000000",
        textLight: "#FFFFFF",
        link: "#0078FF",
        action: "#FF620C",
        inactiveTabIcon: "#0E2F5A",
        error: "#F44235",
        inProgress: "#0078FF",
        complete: "#20B832",
        sourceBg: "#E4EBF1"
      }
    },
    // Добавляем параметры для контроля загрузки
    queueOptions: {
      maxConcurrentUploads: 2, // Ограничиваем количество одновременных загрузок
      maxUploads: options.maxFiles ?? 10
    },
    // Увеличиваем интервал между запросами
    queueDuration: options.queueDuration ?? 2000, // 2 секунды между загрузками
    // Добавляем экспоненциальную задержку
    retrySettings: {
      maxRetries: 3,
      minTimeout: 1000,
      maxTimeout: 10000,
      factor: 2 // Экспоненциальное увеличение задержки
    },
    // Папка для организации файлов
    folder: options.folder,
    // Теги для организации и фильтрации
    tags: options.tags,
    // Добавляем полифилл для crypto.randomUUID внутри
    preBoot: function() {
      if (typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') {
        console.log('Применяем полифилл для crypto.randomUUID внутри Cloudinary виджета');
        // Используем приведение типов для обхода проверки TypeScript
        if (typeof window.crypto === 'undefined') (window as any).crypto = {};
        
        if (typeof window.crypto.getRandomValues !== 'function') {
          // Используем приведение типов для обхода проверки TypeScript
          (window as any).crypto.getRandomValues = function(array: ArrayBufferView | null) {
            if (!array) return array;
            
            // Безопасное получение длины массива
            const len = array.byteLength || 0;
            // Обрабатываем массив как Uint8Array
            const uint8Array = new Uint8Array(array.buffer, array.byteOffset, len);
            
            for (let i = 0; i < len; i++) {
              uint8Array[i] = Math.floor(Math.random() * 256);
            }
            return array;
          };
        }
        
        if (typeof window.crypto.randomUUID !== 'function') {
          // Используем приведение типов для обхода проверки TypeScript
          (window as any).crypto.randomUUID = function(): string {
            const hexDigits = '0123456789abcdef';
            let uuid = '';
            
            for (let i = 0; i < 36; i++) {
              if (i === 8 || i === 13 || i === 18 || i === 23) {
                uuid += '-';
              } else if (i === 14) {
                uuid += '4';
              } else if (i === 19) {
                uuid += hexDigits.charAt(Math.floor(Math.random() * 4) + 8);
              } else {
                uuid += hexDigits.charAt(Math.floor(Math.random() * 16));
              }
            }
            return uuid;
          };
        }
      }
    }
  };
};

export default {
  CLOUD_NAME,
  API_KEY,
  UPLOAD_PRESET,
  getMediaLibraryConfig,
  getUploadWidgetConfig
}; 