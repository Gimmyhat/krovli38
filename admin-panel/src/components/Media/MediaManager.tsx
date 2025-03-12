import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Group, Title, Text, 
  Paper, Pagination, Select, TextInput,
  ActionIcon, Divider, Loader
} from '@mantine/core';
import { IconPlus, IconSearch, IconFilterFilled, IconRefresh } from '@tabler/icons-react';
import { mediaService, MediaMetadata } from '../../services/mediaService';
import MediaGallery from './MediaGallery';
import MediaUploader from './MediaUploader';
import { IMAGE_TYPES, SECTIONS } from '../../constants';

interface MediaManagerProps {
  standalone?: boolean;
  onSelect?: (image: MediaMetadata) => void;
  title?: string;
}

// Расширенный интерфейс для результата getImages
interface MediaResult {
  items: MediaMetadata[];
  totalCount: number;
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  standalone = true,
  title = 'Медиа-библиотека'
}) => {
  // Состояние фильтрации и пагинации
  const [options, setOptions] = useState<any>({
    page: 1,
    limit: 12,
    sortBy: 'uploadedAt',
    sortDirection: 'desc'
  });
  
  // Состояние фильтров
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    section: '',
    tags: [] as string[]
  });
  
  // Состояние загрузки и результатов
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<MediaMetadata[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Состояние модального окна загрузки
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Загрузка изображений
  const fetchImages = async () => {
    setLoading(true);
    try {
      // Комбинируем опции и фильтры
      const queryOptions = {
        ...options,
        search: filters.search || undefined,
        type: filters.type || undefined,
        section: filters.section || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined
      };
      
      // Приводим результат к нужному типу
      const result = await mediaService.getImages(queryOptions) as unknown as MediaResult;
      setImages(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(Math.ceil(result.totalCount / options.limit));
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка при изменении опций или фильтров
  useEffect(() => {
    fetchImages();
  }, [options]);
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setOptions({
      ...options,
      page
    });
  };
  
  // Обработчик изменения количества элементов на странице
  const handleLimitChange = (value: string | null) => {
    if (value) {
      setOptions({
        ...options,
        page: 1, // Сбрасываем на первую страницу
        limit: parseInt(value)
      });
    }
  };
  
  // Обработчик изменения порядка сортировки
  const handleSortChange = (value: string | null) => {
    if (value) {
      const [sortBy, sortDirection] = value.split('-');
      setOptions({
        ...options,
        sortBy,
        sortDirection: sortDirection as 'asc' | 'desc'
      });
    }
  };
  
  // Обработчик применения фильтров
  const applyFilters = () => {
    setOptions({
      ...options,
      page: 1 // Сбрасываем на первую страницу
    });
  };
  
  // Обработчик сброса фильтров
  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      section: '',
      tags: []
    });
    
    setOptions({
      ...options,
      page: 1 // Сбрасываем на первую страницу
    });
  };
  
  // Обработчик успешной загрузки
  const handleUploadSuccess = (_uploadedImages: MediaMetadata[]) => {
    // Обновляем список изображений
    fetchImages();
  };
  
  const sortOptions = [
    { value: 'uploadedAt-desc', label: 'Новые сначала' },
    { value: 'uploadedAt-asc', label: 'Старые сначала' },
    { value: 'originalName-asc', label: 'По имени (A-Z)' },
    { value: 'originalName-desc', label: 'По имени (Z-A)' },
    { value: 'size-desc', label: 'По размеру (по убыванию)' },
    { value: 'size-asc', label: 'По размеру (по возрастанию)' }
  ];
  
  const limitOptions = [
    { value: '12', label: '12 на странице' },
    { value: '24', label: '24 на странице' },
    { value: '48', label: '48 на странице' }
  ];
  
  return (
    <Paper p="md" radius="sm" withBorder={standalone}>
      <Group justify="space-between" mb="md">
        <Title order={2}>{title}</Title>
        
        <Group gap="xs">
          <ActionIcon 
            color="blue" 
            variant="light" 
            onClick={() => fetchImages()}
            title="Обновить"
          >
            <IconRefresh size={18} />
          </ActionIcon>
          
          <ActionIcon 
            color="blue" 
            variant="light" 
            onClick={() => setShowFilters(!showFilters)}
            title="Фильтры"
          >
            <IconFilterFilled size={18} />
          </ActionIcon>
          
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => setUploadModalOpen(true)}
          >
            Загрузить
          </Button>
        </Group>
      </Group>
      
      {showFilters && (
        <Box mb="md">
          <Paper p="sm" withBorder>
            <Group justify="space-between" mb="xs">
              <Text fw={500}>Фильтры</Text>
              <Button variant="subtle" size="xs" onClick={resetFilters}>
                Сбросить
              </Button>
            </Group>
            
            <Group gap="md" align="flex-end">
              <TextInput
                label="Поиск"
                placeholder="Поиск по названию"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.currentTarget.value })}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              
              <Select
                label="Тип"
                placeholder="Все типы"
                value={filters.type}
                onChange={(value) => setFilters({ ...filters, type: value || '' })}
                data={[
                  { value: '', label: 'Все типы' },
                  ...IMAGE_TYPES
                ]}
                clearable
                style={{ width: '150px' }}
              />
              
              <Select
                label="Раздел"
                placeholder="Все разделы"
                value={filters.section}
                onChange={(value) => setFilters({ ...filters, section: value || '' })}
                data={[
                  { value: '', label: 'Все разделы' },
                  ...SECTIONS
                ]}
                clearable
                style={{ width: '150px' }}
              />
              
              <Button onClick={applyFilters}>
                Применить
              </Button>
            </Group>
          </Paper>
        </Box>
      )}
      
      {/* Всего изображений и сортировка */}
      <Group justify="space-between" mb="md">
        <Text color="dimmed">
          {loading ? (
            <Loader size="sm" display="inline-block" mr={5} />
          ) : (
            <>Всего изображений: {totalCount}</>
          )}
        </Text>
        
        <Group gap="xs">
          <Select
            value={`${options.sortBy}-${options.sortDirection}`}
            onChange={handleSortChange}
            data={sortOptions}
            size="xs"
          />
          
          <Select
            value={String(options.limit)}
            onChange={handleLimitChange}
            data={limitOptions}
            size="xs"
          />
        </Group>
      </Group>
      
      {/* Галерея */}
      <MediaGallery 
        images={images}
        onRefresh={fetchImages}
        loading={loading}
      />
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <Box mt="md">
          <Divider mb="md" />
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={options.page}
              onChange={handlePageChange}
              withEdges
            />
          </Group>
        </Box>
      )}
      
      {/* Модальное окно загрузки */}
      <MediaUploader
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Paper>
  );
};

export default MediaManager; 