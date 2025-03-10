import React, { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const MetaTags: React.FC = () => {
  const { settings, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading) return;

    // Устанавливаем заголовок страницы
    document.title = settings.site_name || 'Кровли38 - Ремонт плоской кровли в Иркутске';

    // Устанавливаем мета-описание
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content', 
        settings.site_description || 'Профессиональный ремонт плоской кровли в Иркутске. Качественные услуги по ремонту и обслуживанию кровли МКД.'
      );
    }

    // Устанавливаем ключевые слова
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute(
        'content', 
        settings.site_keywords || 'ремонт кровли, плоская кровля, кровельные работы, Иркутск, ремонт крыши'
      );
    }
  }, [settings, isLoading]);

  // Компонент не рендерит видимый контент
  return null;
};

export default MetaTags; 