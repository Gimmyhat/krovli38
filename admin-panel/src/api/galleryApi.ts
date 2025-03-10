import { API_URL } from '../config';

/**
 * Интерфейс для элемента галереи
 */
export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  tags?: string[];
  order: number;
  isActive: boolean;
  projectDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс для создания/обновления элемента галереи
 */
export interface GalleryItemData {
  title: string;
  description?: string;
  image: string;
  category?: string;
  tags?: string[];
  order?: number;
  isActive?: boolean;
  projectDate?: string;
}

/**
 * Интерфейс для пагинации
 */
export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Интерфейс для ответа с элементами галереи
 */
export interface GalleryResponse {
  items: GalleryItem[];
  pagination: PaginationData;
}

/**
 * Получить все элементы галереи с пагинацией и фильтрацией
 */
export const fetchGalleryItems = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  isActive?: boolean;
  sort?: string;
}): Promise<GalleryResponse> => {
  try {
    // Формируем строку запроса
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.tag) queryParams.append('tag', params.tag);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    const response = await fetch(`${API_URL}/gallery${queryString}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении элементов галереи:', error);
    throw error;
  }
};

/**
 * Получить элемент галереи по ID
 */
export const fetchGalleryItemById = async (id: string): Promise<GalleryItem> => {
  try {
    const response = await fetch(`${API_URL}/gallery/${id}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении элемента галереи:', error);
    throw error;
  }
};

/**
 * Создать новый элемент галереи
 */
export const createGalleryItem = async (data: GalleryItemData): Promise<GalleryItem> => {
  try {
    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании элемента галереи:', error);
    throw error;
  }
};

/**
 * Обновить элемент галереи
 */
export const updateGalleryItem = async (id: string, data: Partial<GalleryItemData>): Promise<GalleryItem> => {
  try {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении элемента галереи:', error);
    throw error;
  }
};

/**
 * Удалить элемент галереи
 */
export const deleteGalleryItem = async (id: string): Promise<{ message: string; id: string }> => {
  try {
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при удалении элемента галереи:', error);
    throw error;
  }
};

/**
 * Обновить порядок элементов галереи
 */
export const updateGalleryItemsOrder = async (items: { id: string; order: number }[]): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_URL}/gallery/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ items })
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении порядка элементов галереи:', error);
    throw error;
  }
}; 