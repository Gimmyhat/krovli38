import React from 'react';
import { Camera } from 'lucide-react';
import Image from '../ui/Image';

interface GalleryItem {
  image: string;
  title: string;
}

const galleryItems: GalleryItem[] = [
  {
    image: '/images/gallery/gallery-1.jpg',
    title: 'Ремонт кровли жилого дома'
  },
  {
    image: '/images/gallery/gallery-2.jpg',
    title: 'Диагностика протечек'
  },
  {
    image: '/images/gallery/gallery-3.jpg',
    title: 'Укладка гидроизоляции'
  },
  {
    image: '/images/gallery/gallery-4.jpg',
    title: 'Ремонт примыканий'
  },
  {
    image: '/images/gallery/gallery-5.jpg',
    title: 'Устройство водостока'
  },
  {
    image: '/images/gallery/gallery-6.jpg',
    title: 'Комплексный ремонт'
  }
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center mb-12">
          <Camera className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold">Наши работы</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg">
              <Image
                src={item.image}
                alt={item.title}
                className="w-full h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <p className="text-white p-6 font-semibold">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery; 