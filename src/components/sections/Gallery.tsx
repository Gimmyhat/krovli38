import React, { useState, useEffect } from 'react';
import { Camera, ArrowRight } from 'lucide-react';
import Image from '../ui/Image';
import ImageViewer from '../ui/ImageViewer';
import { GalleryItem } from '../../types/common';
import { useSettings } from '../../context/SettingsContext';
import Button from '../ui/Button';
import { API_URL } from '../../config';

// Резервные данные, если API недоступен
const fallbackGalleryItems: GalleryItem[] = [
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

// Интерфейс для элемента галереи из API
interface GalleryItemFromAPI {
  _id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  tags?: string[];
  order: number;
  isActive: boolean;
  projectDate?: string;
  createdAt: string;
  updatedAt: string;
}

const Gallery: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showAll, setShowAll] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  // Получаем настройки из контекста или используем резервные значения
  const galleryTitle = settings.gallery_title || 'Наши работы';
  const galleryDescription = settings.gallery_description || 'Посмотрите примеры наших завершенных проектов по ремонту кровли';
  const showMoreLink = settings.gallery_show_more_link !== false; // По умолчанию true
  const showMoreText = settings.gallery_show_more_text || 'Все проекты';

  // Функция для загрузки элементов галереи из API
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      
      // Используем timeout для обнаружения проблем с соединением
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд таймаут
      
      // Проверка доступности API перед выполнением запроса
      const response = await fetch(`${API_URL}/gallery?isActive=true&sort=order`, {
        signal: controller.signal
      }).catch(error => {
        console.error('Ошибка при соединении с API:', error);
        throw new Error('Не удалось соединиться с сервером');
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        console.warn('API вернул неверный формат данных:', data);
        throw new Error('Неверный формат данных с сервера');
      }
      
      // Преобразуем данные из API в формат GalleryItem
      const items: GalleryItem[] = data.items.map((item: GalleryItemFromAPI) => ({
        id: item._id,
        title: item.title,
        description: item.description || '',
        image: item.image,
        category: item.category || 'general',
        tags: item.tags || [],
        date: item.projectDate ? new Date(item.projectDate).toISOString().split('T')[0] : ''
      }));
      
      console.log('Успешно загружены элементы галереи:', items.length);
      setGalleryItems(items);
      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке элементов галереи:', error);
      // При любой ошибке переходим к резервным данным
      setGalleryItems([]);
      if (!navigator.onLine) {
        setError('Отсутствует подключение к интернету. Показаны резервные данные.');
      } else {
        setError('Не удалось загрузить элементы галереи. Показаны резервные данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Загружаем элементы галереи из API или используем резервные данные
  useEffect(() => {
    // Запускаем получение данных
    fetchGalleryItems();
  }, []);
  
  // Если в API нет элементов или произошла ошибка, используем резервные данные
  const displayItems = galleryItems.length > 0 ? galleryItems : fallbackGalleryItems;
  
  // Ограничиваем количество отображаемых элементов до 4 или показываем все
  const displayedItems = showAll ? displayItems : displayItems.slice(0, 4);

  // Обработчик клика по кнопке "Все проекты"
  const handleViewAllClick = () => {
    setShowAll(true);
  };

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold">{galleryTitle}</h2>
          </div>
          {galleryDescription && (
            <p className="text-gray-600 max-w-2xl mx-auto">{galleryDescription}</p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 mb-8">
            {error}
            <button 
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchGalleryItems();
              }} 
              className="ml-4 text-blue-600 underline"
            >
              Повторить загрузку
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
              {displayedItems.map((item, index) => (
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
                    priority={index <= 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent 
                    flex flex-col justify-end p-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 
                    transition-opacity duration-300">
                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-200 text-sm">{item.description}</p>
                    )}
                    {item.tags && item.tags.length > 0 && (
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
            
            {showMoreLink && !showAll && displayItems.length > 4 && (
              <div className="flex justify-center mt-10">
                <Button 
                  variant="outline" 
                  rightIcon={<ArrowRight size={18} />}
                  onClick={handleViewAllClick}
                >
                  {showMoreText}
                </Button>
              </div>
            )}
            
            {showAll && (
              <div className="flex justify-center mt-10">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(false)}
                >
                  Свернуть
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ImageViewer
        isOpen={selectedIndex !== -1}
        onClose={() => setSelectedIndex(-1)}
        items={displayedItems}
        currentIndex={selectedIndex}
        onNavigate={setSelectedIndex}
      />
    </section>
  );
};

export default Gallery; 