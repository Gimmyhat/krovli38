import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import Image from '../ui/Image';
import ImageViewer from '../ui/ImageViewer';
import { GalleryItem } from '../../types/common';

const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Ремонт кровли жилого дома',
    description: 'Полная замена кровельного покрытия с использованием современных материалов',
    image: '/images/gallery/gallery-1.jpg',
    category: 'repair',
    tags: ['ремонт', 'жилой дом', 'замена покрытия'],
    date: '2024-02'
  },
  {
    id: '2',
    title: 'Диагностика протечек',
    description: 'Профессиональное обследование и выявление причин протечек',
    image: '/images/gallery/gallery-2.jpg',
    category: 'diagnostics',
    tags: ['диагностика', 'протечки', 'обследование'],
    date: '2024-01'
  },
  {
    id: '3',
    title: 'Укладка гидроизоляции',
    description: 'Монтаж современных гидроизоляционных материалов',
    image: '/images/gallery/gallery-3.jpg',
    category: 'waterproofing',
    tags: ['гидроизоляция', 'монтаж', 'материалы'],
    date: '2024-01'
  },
  {
    id: '4',
    title: 'Ремонт примыканий',
    description: 'Восстановление герметичности узлов примыкания',
    image: '/images/gallery/gallery-4.jpg',
    category: 'repair',
    tags: ['примыкания', 'герметизация', 'ремонт'],
    date: '2023-12'
  },
  {
    id: '5',
    title: 'Устройство водостока',
    description: 'Монтаж современной системы водоотведения',
    image: '/images/gallery/gallery-5.jpg',
    category: 'installation',
    tags: ['водосток', 'монтаж', 'водоотведение'],
    date: '2023-12'
  },
  {
    id: '6',
    title: 'Комплексный ремонт',
    description: 'Полный комплекс работ по восстановлению кровли',
    image: '/images/gallery/gallery-6.jpg',
    category: 'repair',
    tags: ['комплексный ремонт', 'восстановление', 'кровля'],
    date: '2023-11'
  }
];

const Gallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center mb-12">
          <Camera className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold">Наши работы</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="relative group overflow-hidden rounded-lg shadow-lg h-[300px] cursor-pointer"
              onClick={() => setSelectedIndex(index)}
              role="button"
              tabIndex={0}
              aria-label={`Открыть ${item.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedIndex(index);
                }
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                className="w-full h-full"
                objectFit="cover"
                priority={parseInt(item.id) <= 3}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                flex flex-col justify-end p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 
                transition-opacity duration-300">
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-200 text-sm">{item.description}</p>
                )}
                {item.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="text-xs bg-blue-600/80 text-white px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageViewer
        isOpen={selectedIndex !== -1}
        onClose={() => setSelectedIndex(-1)}
        items={galleryItems}
        currentIndex={selectedIndex}
        onNavigate={setSelectedIndex}
      />
    </section>
  );
};

export default Gallery; 