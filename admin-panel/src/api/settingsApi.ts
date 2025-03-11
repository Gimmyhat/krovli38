import { API_URL } from '../config';

/**
 * Интерфейс для данных настройки сайта
 */
export interface SiteSettingData {
  _id: string;
  key: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'color' | 'image' | 'select' | 'json';
  group: string;
  value: any;
  defaultValue?: any;
  options?: any;
  order: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Интерфейс для обновления настройки
 */
export interface SiteSettingUpdateData {
  value: any;
}

/**
 * Получить все настройки сайта
 */
export const fetchSettings = async (group?: string): Promise<SiteSettingData[]> => {
  try {
    const queryParams = group ? `?group=${group}` : '';
    const response = await fetch(`${API_URL}/settings${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    throw error;
  }
};

/**
 * Получить настройку по ключу
 */
export const fetchSettingByKey = async (key: string): Promise<SiteSettingData> => {
  try {
    const response = await fetch(`${API_URL}/settings/${key}`);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении настройки:', error);
    throw error;
  }
};

/**
 * Обновить настройку
 */
export const updateSetting = async (key: string, data: SiteSettingUpdateData): Promise<SiteSettingData> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Требуется авторизация');
    }
    
    const response = await fetch(`${API_URL}/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении настройки:', error);
    throw error;
  }
};

/**
 * Обновить группу настроек
 */
export const updateSettingsGroup = async (group: string, data: Record<string, any>): Promise<SiteSettingData[]> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Требуется авторизация');
    }
    
    const response = await fetch(`${API_URL}/settings/group/${group}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении группы настроек:', error);
    throw error;
  }
};

/**
 * Сбросить настройки к значениям по умолчанию
 */
export const resetSettings = async (group?: string): Promise<{ message: string }> => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Требуется авторизация');
    }
    
    const queryParams = group ? `?group=${group}` : '';
    const response = await fetch(`${API_URL}/settings/reset${queryParams}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при сбросе настроек:', error);
    throw error;
  }
}; 