import React, { useEffect, useState, useCallback } from 'react';
import { Phone } from 'lucide-react';
import { NAV_ITEMS, CONTACT_INFO } from '../../constants/navigation';
import { IMAGE_PATHS } from '../../constants';
import { useSettings } from '../../context/SettingsContext';

const Navigation: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const [logoVersion, setLogoVersion] = useState<number>(Date.now());
  const [logoError, setLogoError] = useState<boolean>(false);
  const logoSize = settings.logo_size || 96; // Используем значение из настроек или 96px по умолчанию
  const logoPath = settings.logo_path || IMAGE_PATHS.LOGO; // Используем путь из настроек или из констант
  const logoMargin = settings.logo_margin !== undefined ? settings.logo_margin : -4; // Отступы логотипа из настроек

  // Функция для принудительного обновления версии логотипа
  const refreshLogo = useCallback(() => {
    setLogoVersion(Date.now());
    setLogoError(false);
  }, []);

  // Обновляем версию логотипа при изменении пути
  useEffect(() => {
    if (logoPath) {
      refreshLogo();
    }
  }, [logoPath, refreshLogo]);

  // Периодическое обновление версии логотипа (каждую минуту)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshLogo();
    }, 60 * 1000); // 1 минута
    
    return () => clearInterval(intervalId);
  }, [refreshLogo]);

  // Формируем URL логотипа с параметром версии для предотвращения кэширования
  const logoUrl = logoPath ? `${logoPath}?v=${logoVersion}` : '';

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    console.warn('Ошибка загрузки логотипа:', logoPath);
    setLogoError(true);
    
    // Принудительно обновляем настройки через 2 секунды
    setTimeout(() => {
      refreshSettings();
    }, 2000);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-white">
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt="Кровли38" 
                className="w-auto mix-blend-screen"
                style={{ 
                  height: `${logoSize}px`,
                  filter: 'brightness(1.1)',
                  marginLeft: `${logoMargin}px` // Используем значение отступа из настроек
                }} 
                onError={handleImageError}
                onLoad={() => setLogoError(false)}
              />
            ) : (
              // Запасной текст вместо логотипа
              <div 
                style={{ 
                  height: `${logoSize}px`,
                  marginLeft: `${logoMargin}px`
                }}
                className="flex items-center justify-center"
              >
                <span className="text-2xl font-bold">К38</span>
              </div>
            )}
            <span className="text-2xl font-bold">КровляПро</span>
          </div>
          <div className="flex items-center space-x-6 text-white">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="hover:text-gray-300"
              >
                {item.label}
              </a>
            ))}
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>{CONTACT_INFO.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 