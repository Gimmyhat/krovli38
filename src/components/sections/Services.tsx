import React from 'react';
import { Shield, PenTool as Tool, CheckCircle } from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const services: Service[] = [
  {
    icon: <Shield className="h-12 w-12 text-blue-600" />,
    title: 'Диагностика кровли',
    description: 'Профессиональное обследование и выявление проблем',
    image: 'https://images.unsplash.com/photo-1632153575100-70e16fec8af8?auto=format&fit=crop&q=80'
  },
  {
    icon: <Tool className="h-12 w-12 text-blue-600" />,
    title: 'Ремонт кровли',
    description: 'Качественный ремонт с использованием современных материалов',
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80'
  },
  {
    icon: <CheckCircle className="h-12 w-12 text-blue-600" />,
    title: 'Обслуживание',
    description: 'Регулярное обслуживание и профилактика протечек',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80'
  }
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Наши услуги</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {service.icon}
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