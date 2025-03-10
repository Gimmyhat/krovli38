import React, { useState } from 'react';
import Image from '../ui/Image';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ContactForm from './ContactForm';
import { useSettings } from '../../context/SettingsContext';

const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { settings, isLoading } = useSettings();

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Если настройки еще загружаются, показываем заглушку
  if (isLoading) {
    return (
      <header className="relative h-[600px] bg-gray-200 animate-pulse">
        <div className="relative z-10 container mx-auto px-6 pt-32">
          <div className="h-12 bg-gray-300 mb-6 w-1/2 rounded"></div>
          <div className="h-6 bg-gray-300 mb-2 w-full max-w-2xl rounded"></div>
          <div className="h-6 bg-gray-300 mb-8 w-4/5 max-w-2xl rounded"></div>
          <div className="h-12 bg-gray-300 w-48 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="relative h-[600px]">
      <div className="absolute inset-0">
        <Image
          src={settings.hero_background || "/images/hero/hero-bg.jpg"}
          alt="Flat roof repair"
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 bg-black" 
          style={{ opacity: (settings.hero_overlay_opacity || 50) / 100 }}
        ></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 pt-32">
        <h1 className="text-5xl font-bold text-white mb-6">
          {settings.hero_title || "Профессиональный ремонт плоской кровли"}
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl">
          {settings.hero_subtitle || "Выполняем полный комплекс работ по ремонту и обслуживанию плоских кровель МКД. Гарантируем качество и надежность на долгие годы."}
        </p>
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          {settings.hero_button_text || "Получить консультацию"}
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Получить консультацию"
      >
        <ContactForm onSuccess={handleCloseModal} />
      </Modal>
    </header>
  );
};

export default Hero; 