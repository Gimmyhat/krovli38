import React, { useState } from 'react';
import Image from '../ui/Image';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ContactForm from './ContactForm';

const Hero: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="relative h-[600px]">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero-bg.jpg"
          alt="Flat roof repair"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 pt-32">
        <h1 className="text-5xl font-bold text-white mb-6">
          Профессиональный ремонт<br />плоской кровли
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl">
          Выполняем полный комплекс работ по ремонту и обслуживанию плоских кровель МКД. 
          Гарантируем качество и надежность на долгие годы.
        </p>
        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          Получить консультацию
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