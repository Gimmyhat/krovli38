import { useState, useEffect } from 'react';
import { Service, SiteContent } from '../types/content';
import { fetchSiteContent, updateService } from '../api/contentApi';
import { useLogger } from './useLogger';

export const useContentSync = () => {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger({ module: 'ContentSync' });

  // Загрузка контента
  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSiteContent();
      setContent(data);
      logger.info('Контент успешно загружен');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      logger.error('Ошибка при загрузке контента', { error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Обновление услуги
  const updateServiceItem = async (serviceId: string, serviceData: Partial<Service>) => {
    try {
      setLoading(true);
      const updatedService = await updateService(serviceId, serviceData);
      
      // Обновляем локальное состояние
      if (content) {
        const updatedServices = content.services.map(s => 
          s.id === serviceId ? { ...s, ...updatedService } : s
        );
        setContent({ ...content, services: updatedServices });
      }
      
      logger.info('Услуга успешно обновлена', { serviceId });
      return updatedService;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      logger.error('Ошибка при обновлении услуги', { serviceId, error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Загружаем контент при монтировании компонента
  useEffect(() => {
    loadContent().catch(err => {
      logger.error('Ошибка при начальной загрузке контента', { error: err.message });
    });
  }, []);

  return {
    content,
    loading,
    error,
    loadContent,
    updateServiceItem
  };
}; 