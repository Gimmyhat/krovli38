import { Service, SiteContent } from '../types/content';
import { API } from '../constants';

// Получение всего контента сайта
export const fetchSiteContent = async (): Promise<SiteContent> => {
  try {
    const response = await fetch(`${API.BASE_URL}/content`);
    if (!response.ok) {
      throw new Error('Ошибка при получении контента');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении контента:', error);
    throw error;
  }
};

// Обновление услуги
export const updateService = async (serviceId: string, serviceData: Partial<Service>): Promise<Service> => {
  try {
    const response = await fetch(`${API.BASE_URL}/content/services/${serviceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при обновлении услуги');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при обновлении услуги:', error);
    throw error;
  }
};

// Обновление секции контента
export const updateContentSection = async (sectionName: string, sectionData: any): Promise<any> => {
  try {
    const response = await fetch(`${API.BASE_URL}/content/${sectionName}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sectionData),
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка при обновлении секции ${sectionName}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Ошибка при обновлении секции ${sectionName}:`, error);
    throw error;
  }
}; 