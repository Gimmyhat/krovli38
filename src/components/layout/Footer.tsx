import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { settings, isLoading } = useSettings();

  // Если настройки еще загружаются, показываем заглушку
  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="h-6 bg-gray-800 w-64 mx-auto rounded animate-pulse"></div>
        </div>
      </footer>
    );
  }

  // Используем настройки из контекста с запасными значениями
  const footerText = settings.footer_text || `© ${currentYear} РемонтКровли. Все права защищены.`;
  const footerBgColor = settings.footer_background || '#111827'; // gray-900
  const footerTextColor = settings.footer_text_color || '#9CA3AF'; // gray-400

  return (
    <footer 
      style={{ 
        backgroundColor: footerBgColor, 
        color: footerTextColor 
      }} 
      className="py-8"
    >
      <div className="container mx-auto px-6 text-center">
        <p>{footerText.replace('{year}', currentYear.toString())}</p>
      </div>
    </footer>
  );
};

export default Footer; 