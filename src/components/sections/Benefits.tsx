import React from 'react';
import { Users, Clock, Shield, Hammer } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefitItems: Benefit[] = [
  {
    icon: <Users className="h-8 w-8 text-blue-600" />,
    title: 'Опытные специалисты',
    description: 'Команда профессионалов с многолетним опытом'
  },
  {
    icon: <Clock className="h-8 w-8 text-blue-600" />,
    title: 'Быстрое реагирование',
    description: 'Выезд специалиста в течение 24 часов'
  },
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: 'Гарантия качества',
    description: 'Предоставляем гарантию на все виды работ'
  },
  {
    icon: <Hammer className="h-8 w-8 text-blue-600" />,
    title: 'Современные технологии',
    description: 'Используем передовые материалы и оборудование'
  }
];

const Benefits: React.FC = () => {
  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefitItems.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits; 