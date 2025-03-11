import React, { useEffect, useState } from 'react';
import { Phone } from 'lucide-react';
import { NAV_ITEMS, CONTACT_INFO } from '../../constants/navigation';
import { IMAGE_PATHS } from '../../constants';
import { useSettings } from '../../context/SettingsContext';

const Navigation: React.FC = () => {
  const { settings } = useSettings();
  const [logoVersion, setLogoVersion] = useState<number>(Date.now());
  const logoSize = settings.logo_size || 96; // Используем значение из настроек или 96px по умолчанию
  const logoPath = settings.logo_path || IMAGE_PATHS.LOGO; // Используем путь из настроек или из констант
  const logoMargin = settings.logo_margin !== undefined ? settings.logo_margin : -4; // Отступы логотипа из настроек

  // Обновляем версию логотипа при изменении пути
  useEffect(() => {
    if (logoPath) {
      setLogoVersion(Date.now());
    }
  }, [logoPath]);

  // Формируем URL логотипа с параметром версии для предотвращения кэширования
  const logoUrl = logoPath ? `${logoPath}?v=${logoVersion}` : '';

  return (
    <nav className="bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-3 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1 text-white">
            <img 
              src={logoUrl} 
              alt="Кровли38" 
              className="w-auto mix-blend-screen"
              style={{ 
                height: `${logoSize}px`,
                filter: 'brightness(1.1)',
                marginLeft: `${logoMargin}px` // Используем значение отступа из настроек
              }} 
            />
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