import { API_URL } from '../constants';

export interface MediaMetadata {
  id: string;
  originalName: string;
  fileName: string;
  thumbnailName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt?: string;
  title?: string;
  type?: string;
  tags?: string[];
  section?: string;
  uploadedAt: string;
  updatedAt?: string;
  urls?: {
    original: string;
    thumbnail: string;
  };
}

export interface MediaOptions {
  alt?: string;
  title?: string;
  type?: string;
  tags?: string[];
  section?: string;
}

/**
 * Сервис для работы с медиафайлами через API
 */
class MediaService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = `${API_URL}/media`;
  }

  /**
   * Загрузка изображения
   */
  async uploadImage(formData: FormData): Promise<MediaMetadata> {
    try {
      const response = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при загрузке изображения');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Ошибка загрузки изображения:', error);
      throw new Error(error.message || 'Ошибка при загрузке изображения');
    }
  }

  /**
   * Получение списка всех изображений
   */
  async getImages(options?: any): Promise<MediaMetadata[]> {
    try {
      // Преобразуем объект параметров в строку запроса
      const queryParams = options ? new URLSearchParams(
        Object.entries(options)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, typeof value === 'object' ? JSON.stringify(value) : String(value)])
      ).toString() : '';
      
      const url = `${this.apiUrl}/list${queryParams ? `?${queryParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при получении списка изображений');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Ошибка получения списка изображений:', error);
      throw new Error(error.message || 'Ошибка при получении списка изображений');
    }
  }

  /**
   * Получение изображения по ID
   */
  async getImageById(id: string): Promise<MediaMetadata> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Ошибка при получении изображения с ID ${id}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error(`Ошибка получения изображения с ID ${id}:`, error);
      throw new Error(error.message || 'Ошибка при получении изображения');
    }
  }

  /**
   * Обновление метаданных изображения
   */
  async updateImage(id: string, updates: Partial<MediaMetadata>): Promise<MediaMetadata> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Ошибка при обновлении изображения с ID ${id}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error(`Ошибка обновления изображения с ID ${id}:`, error);
      throw new Error(error.message || 'Ошибка при обновлении изображения');
    }
  }

  /**
   * Удаление изображения
   */
  async deleteImage(id: string): Promise<{ success: boolean; id: string }> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Ошибка при удалении изображения с ID ${id}`);
      }

      const result = await response.json();
      return { success: true, id: result.data.id };
    } catch (error: any) {
      console.error(`Ошибка удаления изображения с ID ${id}:`, error);
      throw new Error(error.message || 'Ошибка при удалении изображения');
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const mediaService = new MediaService(); 