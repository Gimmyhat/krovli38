/**
 * API для работы с контентом сайта
 */

// Интерфейсы для типов данных
export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  image: string;
}

export interface SiteContent {
  services: Service[];
  benefits: {
    id: string;
    name: string;
    title: string;
    items: any[];
  };
  types: {
    id: string;
    name: string;
    title: string;
    items: any[];
  };
  gallery: {
    title: string;
    description?: string;
    images: string[];
  };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
  };
}

// Базовый URL API
const API_URL = '/api';

/**
 * Получение всего контента сайта
 */
export const fetchSiteContent = async (): Promise<SiteContent> => {
  try {
    const response = await fetch(`${API_URL}/content`);
    
    if (!response.ok) {
      throw new Error('Ошибка при получении контента');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении контента:', error);
    throw error;
  }
};

/**
 * Получение данных об услугах
 */
export const fetchServices = async (): Promise<Service[]> => {
  try {
    const content = await fetchSiteContent();
    return content.services;
  } catch (error) {
    console.error('Ошибка при получении услуг:', error);
    throw error;
  }
}; 