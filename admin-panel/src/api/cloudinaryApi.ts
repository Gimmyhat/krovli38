import { API_URL } from '../config';

// Типы для Cloudinary
export interface CloudinaryAsset {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  tags?: string[];
  context?: Record<string, any>;
  alt?: string;
  caption?: string;
}

export interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
}

/**
 * Добавить выбранные изображения из Cloudinary в систему
 */
export const addCloudinaryImages = async (assets: CloudinaryAsset[]) => {
  try {
    const response = await fetch(`${API_URL}/images/cloudinary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ assets }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка сохранения изображений');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка добавления изображений из Cloudinary:', error);
    throw error;
  }
};

/**
 * Получить настройки Cloudinary из API
 */
export const getCloudinaryConfig = async () => {
  try {
    const response = await fetch(`${API_URL}/cloudinary/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось получить настройки Cloudinary');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения настроек Cloudinary:', error);
    throw error;
  }
}; 