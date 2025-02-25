import React from 'react';
import { Phone, Building2 } from 'lucide-react';

const Navigation: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-white">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold">РемонтКровли</span>
          </div>
          <div className="flex items-center space-x-8 text-white">
            <a href="#services" className="hover:text-gray-300">Услуги</a>
            <a href="#types" className="hover:text-gray-300">Виды работ</a>
            <a href="#benefits" className="hover:text-gray-300">Преимущества</a>
            <a href="#gallery" className="hover:text-gray-300">Галерея</a>
            <a href="#contact" className="hover:text-gray-300">Контакты</a>
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>+7 (XXX) XXX-XX-XX</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 