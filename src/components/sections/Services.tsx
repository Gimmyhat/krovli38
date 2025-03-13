import React, { useState, useEffect } from 'react';
import { Shield, PenTool as Tool, CheckCircle } from 'lucide-react';
import Image from '../ui/Image';
import { fetchServices, Service as ServiceType } from '../../api/contentApi';

// Функция для получения иконки по имени
const getIconByName = (iconName: string): React.ReactNode => {
  switch (iconName) {
    case 'Shield':
      return <Shield className="h-12 w-12 text-blue-600" />;
    case 'Tool':
      return <Tool className="h-12 w-12 text-blue-600" />;
    case 'CheckCircle':
      return <CheckCircle className="h-12 w-12 text-blue-600" />;
    default:
      return <Shield className="h-12 w-12 text-blue-600" />;
  }
};

// Резервные данные на случай ошибки загрузки
const fallbackServices = [
  {
    id: '1',
    icon: 'Shield',
    title: 'Диагностика кровли',
    description: 'Профессиональное обследование и выявление проблем',
    image: '/images/services/service-1.jpg'
  },
  {
    id: '2',
    icon: 'Tool',
    title: 'Ремонт кровли',
    description: 'Качественный ремонт с использованием современных материалов',
    image: '/images/services/service-2.jpg'
  },
  {
    id: '3',
    icon: 'CheckCircle',
    title: 'Обслуживание',
    description: 'Регулярное обслуживание и профилактика протечек',
    image: '/images/services/service-3.jpg'
  }
];

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const data = await fetchServices();
        if (data && data.length > 0) {
          setServices(data);
        }
      } catch (err) {
        console.error('Ошибка при загрузке услуг:', err);
        setError('Не удалось загрузить данные об услугах');
        // Используем резервные данные в случае ошибки
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Наши услуги</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 relative">
                <Image 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {getIconByName(service.icon)}
                  <h3 className="text-xl font-semibold ml-3">{service.title}</h3>
                </div>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 