import axios from 'axios';
import { API_URL } from '../config';

export interface ImageData {
  _id: string;
  public_id: string;
  url: string;
  secure_url: string;
  type: string;
  alt: string;
  title: string;
  section: string;
  width: number;
  height: number;
  format: string;
  tags: string[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageUpdateData {
  alt?: string;
  title?: string;
  type?: string;
  section?: string;
  tags?: string[];
  order?: number;
  isActive?: boolean;
}

export interface PaginationData {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export interface ImagesResponse {
  images: ImageData[];
  pagination: PaginationData;
}

// Получение списка всех изображений с поддержкой пагинации и фильтрации
export const fetchImages = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  section?: string;
  search?: string;
  isActive?: boolean;
  tags?: string[];
  sort?: string;
}): Promise<ImagesResponse> => {
  try {
    const { data } = await axios.get(`${API_URL}/images`, {
      params,
      withCredentials: true
    });
    return data;
  } catch (error) {
    console.error('Ошибка при получении изображений:', error);
    throw error;
  }
};

// Получение конкретного изображения по ID
export const fetchImageById = async (id: string): Promise<ImageData> => {
  try {
    const { data } = await axios.get(`${API_URL}/images/${id}`, {
      withCredentials: true
    });
    return data.image;
  } catch (error) {
    console.error(`Ошибка при получении изображения с ID ${id}:`, error);
    throw error;
  }
};

// Загрузка одного изображения
export const uploadSingleImage = async (
  file: File, 
  metadata: {
    type?: string;
    alt?: string;
    title?: string;
    section?: string;
    tags?: string[];
  }
): Promise<ImageData> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    // Добавляем метаданные
    if (metadata.type) formData.append('type', metadata.type);
    if (metadata.alt) formData.append('alt', metadata.alt);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.section) formData.append('section', metadata.section);
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', metadata.tags.join(','));
    }

    const token = localStorage.getItem('token');

    const { data } = await axios.post(`${API_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return data.image;
  } catch (error) {
    console.error('Ошибка при загрузке изображения:', error);
    throw error;
  }
};

// Загрузка нескольких изображений
export const uploadMultipleImages = async (
  files: File[], 
  metadata: {
    type?: string;
    section?: string;
    tags?: string[];
  }
): Promise<ImageData[]> => {
  try {
    const formData = new FormData();
    
    // Добавляем файлы
    files.forEach(file => {
      formData.append('images', file);
    });
    
    // Добавляем метаданные
    if (metadata.type) formData.append('type', metadata.type);
    if (metadata.section) formData.append('section', metadata.section);
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    const token = localStorage.getItem('token');

    const { data } = await axios.post(`${API_URL}/images/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return data.images;
  } catch (error) {
    console.error('Ошибка при загрузке изображений:', error);
    throw error;
  }
};

// Обновление метаданных изображения
export const updateImage = async (id: string, updateData: ImageUpdateData): Promise<ImageData> => {
  try {
    const token = localStorage.getItem('token');

    const { data } = await axios.put(`${API_URL}/images/${id}`, updateData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return data.image;
  } catch (error) {
    console.error(`Ошибка при обновлении изображения с ID ${id}:`, error);
    throw error;
  }
};

// Удаление изображения
export const deleteImage = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const token = localStorage.getItem('token');

    const { data } = await axios.delete(`${API_URL}/images/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return data;
  } catch (error) {
    console.error(`Ошибка при удалении изображения с ID ${id}:`, error);
    throw error;
  }
};

// Интерфейс для метаданных при создании изображения из Cloudinary
export interface CloudinaryImageData {
  public_id: string;
  type?: string;
  alt?: string;
  title?: string;
  section?: string;
  tags?: string[];
}

// Утилита для сдерживания запросов (rate limiting)
const apiRateLimiter = {
  lastRequestTime: 0,
  minInterval: 1500, // минимальный интервал между запросами (мс)
  queue: [] as (() => void)[],
  processing: false,

  // Выполнить запрос с соблюдением интервала
  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // Добавляем запрос в очередь
      this.queue.push(() => {
        fn().then(resolve).catch(reject);
      });
      
      // Запускаем обработку очереди, если она не запущена
      if (!this.processing) {
        this.processQueue();
      }
    });
  },

  // Обработка очереди запросов
  async processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    
    // Вычисляем, сколько нужно подождать до следующего запроса
    const now = Date.now();
    const timeToWait = Math.max(0, this.lastRequestTime + this.minInterval - now);
    
    if (timeToWait > 0) {
      await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    
    // Выполняем следующий запрос
    const nextRequest = this.queue.shift();
    if (nextRequest) {
      this.lastRequestTime = Date.now();
      nextRequest();
    }
    
    // Продолжаем обработку очереди
    setTimeout(() => this.processQueue(), 50);
  }
};

// Функция для выполнения запроса с повторными попытками
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null;
  let delayMs = 1000; // начальная задержка перед повторной попыткой
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Выполняем запрос через rate limiter
      return await apiRateLimiter.throttle(async () => {
        const response = await fetch(url, options);
        
        // Если получен статус 429, делаем повторную попытку
        if (response.status === 429) {
          // Извлекаем Retry-After заголовок, если он есть
          const retryAfter = response.headers.get('Retry-After');
          const retryDelayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : delayMs;
          
          console.warn(`Получен статус 429 (Too Many Requests), повторная попытка через ${retryDelayMs}ms`);
          throw new Error('Rate limit exceeded (429)');
        }
        
        return response;
      });
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        console.log(`Попытка ${attempt + 1} не удалась, повтор через ${delayMs}ms`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Экспоненциальная задержка
      }
    }
  }
  
  throw lastError || new Error('Все попытки запроса завершились неудачно');
}

// Создание записи изображения на основе публичного ID из Cloudinary
export const createImageFromCloudinary = async (data: CloudinaryImageData): Promise<ImageData> => {
  try {
    const token = localStorage.getItem('token');
    
    // Используем fetchWithRetry для выполнения запроса с повторными попытками
    const response = await fetchWithRetry(`${API_URL}/images/cloudinary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(data)
    }, 3); // 3 попытки максимум
    
    // Улучшенная обработка ошибок сервера
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Ошибка сервера: ${response.status}`;
      
      try {
        // Пытаемся распарсить JSON-ответ, если он есть
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        // Если не удалось распарсить, используем текст ответа
        errorMessage = errorText || errorMessage;
      }
      
      console.error(`Ошибка API (${response.status}): ${errorMessage}`);
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании изображения из Cloudinary:', error);
    throw error;
  }
};

interface ImportLocalImagesResult {
  message: string;
  results: {
    success: number;
    skipped: number;
    error: number;
    total: number;
  };
}

// Импорт локальных изображений в Cloudinary
export const importLocalImages = async (
  directories?: string[]
): Promise<ImportLocalImagesResult> => {
  try {
    const token = localStorage.getItem('token');
    
    const { data } = await axios.post(`${API_URL}/images/import-local`, 
      { directories },
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }
    );
    
    return data;
  } catch (error) {
    console.error('Ошибка при импорте локальных изображений:', error);
    throw error;
  }
}; 