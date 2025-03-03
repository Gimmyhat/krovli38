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

// Получение списка всех изображений
export const fetchImages = async (): Promise<ImageData[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/images`, {
      withCredentials: true
    });
    return data.images;
  } catch (error) {
    console.error('Ошибка при получении изображений:', error);
    throw error;
  }
};

// Получение конкретного изображения по ID
export const fetchImageById = async (id: string): Promise<ImageData> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/images/${id}`, {
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
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    const { data } = await axios.post(`${API_URL}/api/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
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

    const { data } = await axios.post(`${API_URL}/api/images/upload/multiple`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
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
    const { data } = await axios.put(`${API_URL}/api/images/${id}`, updateData, {
      withCredentials: true
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
    const { data } = await axios.delete(`${API_URL}/api/images/${id}`, {
      withCredentials: true
    });
    return data;
  } catch (error) {
    console.error(`Ошибка при удалении изображения с ID ${id}:`, error);
    throw error;
  }
}; 