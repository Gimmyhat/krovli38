import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Modal, 
  Title, 
  Text, 
  Button, 
  Group, 
  Grid, 
  Card, 
  Image, 
  Select, 
  TextInput, 
  Pagination,
  Center,
  Loader,
  Flex
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconPhoto } from '@tabler/icons-react';
import { fetchImages, ImageData } from '../../api/imageApi';

interface CloudinaryPickerProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (image: ImageData) => void;
  title?: string;
  filter?: {
    type?: string;
    section?: string;
  };
}

// Расширенный интерфейс для результата fetchImages
interface ImageResponse {
  images: ImageData[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

const CloudinaryPicker: React.FC<CloudinaryPickerProps> = ({
  opened,
  onClose,
  onSelect,
  title = 'Выберите изображение',
  filter = {}
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageType, setImageType] = useState<string | null>(filter.type || null);
  const [section, setSection] = useState<string | null>(filter.section || null);
  
  // Типы изображений для фильтрации
  const IMAGE_TYPES = [
    { value: 'banner', label: 'Баннер' },
    { value: 'gallery', label: 'Галерея' },
    { value: 'logo', label: 'Логотип' },
    { value: 'background', label: 'Фон' },
    { value: 'content', label: 'Контент' },
    { value: 'project', label: 'Проект' }
  ];
  
  // Секции для фильтрации
  const SECTIONS = [
    { value: 'general', label: 'Общие' },
    { value: 'hero', label: 'Главный экран' },
    { value: 'services', label: 'Услуги' },
    { value: 'benefits', label: 'Преимущества' },
    { value: 'gallery', label: 'Галерея' },
    { value: 'contact', label: 'Контакты' },
    { value: 'footer', label: 'Подвал' }
  ];
  
  // Загрузка изображений при открытии модального окна
  useEffect(() => {
    if (opened) {
      loadImages();
    }
  }, [opened, currentPage, imageType, section, searchQuery]);
  
  const loadImages = async () => {
    setLoading(true);
    
    try {
      // Формируем параметры запроса
      const params: Record<string, any> = {
        page: currentPage,
        limit: 12
      };
      
      if (imageType) {
        params.type = imageType;
      }
      
      if (section) {
        params.section = section;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      // Приводим результат к нужному типу
      const data = await fetchImages(params) as unknown as ImageResponse;
      
      setImages(data.images || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить изображения',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Обработчик выбора изображения
  const handleSelect = (image: ImageData) => {
    onSelect(image);
    onClose();
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setImageType(null);
    setSection(null);
    setSearchQuery('');
    setCurrentPage(1);
  };
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>{title}</Title>}
      size="xl"
      padding="lg"
    >
      <Box mb="md">
        <Grid>
          <Grid.Col span={5}>
            <TextInput
              leftSection={<IconSearch size={16} />}
              placeholder="Поиск изображений"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              placeholder="Тип изображения"
              value={imageType}
              onChange={setImageType}
              data={IMAGE_TYPES}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              placeholder="Раздел сайта"
              value={section}
              onChange={setSection}
              data={SECTIONS}
              clearable
              searchable
            />
          </Grid.Col>
          <Grid.Col span={1}>
            <Button 
              variant="subtle" 
              onClick={handleResetFilters}
              fullWidth
              px={0}
            >
              Сброс
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
      
      <Box pos="relative" mih={400}>
        {loading && (
          <Center style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
            <Loader size="lg" />
          </Center>
        )}
        
        {images.length > 0 ? (
          <Grid>
            {images.map((image) => (
              <Grid.Col key={image._id} span={4} py="xs">
                <Card 
                  p="xs" 
                  shadow="sm" 
                  withBorder 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelect(image)}
                >
                  <Card.Section>
                    <Box h={150} pos="relative">
                      <Image
                        src={image.secure_url}
                        alt={image.alt || image.title || 'Изображение'}
                        fit="cover"
                        h={150}
                      />
                    </Box>
                  </Card.Section>
                  
                  <Text size="sm" fw={500} mt="xs" lineClamp={1}>
                    {image.title || 'Без названия'}
                  </Text>
                  
                  <Flex gap={5} wrap="wrap" mt={5}>
                    {image.type && (
                      <Text size="xs" c="blue" fw={500}>
                        {IMAGE_TYPES.find(t => t.value === image.type)?.label || image.type}
                      </Text>
                    )}
                    {image.section && image.section !== 'general' && (
                      <Text size="xs" c="gray">
                        {SECTIONS.find(s => s.value === image.section)?.label || image.section}
                      </Text>
                    )}
                  </Flex>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : !loading ? (
          <Center p="xl">
            <Box ta="center">
              <IconPhoto size={48} color="gray" style={{ opacity: 0.5 }} />
              <Text color="dimmed" mt="md">
                Изображения не найдены
              </Text>
            </Box>
          </Center>
        ) : null}
      </Box>
      
      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination 
            total={totalPages} 
            value={currentPage} 
            onChange={setCurrentPage} 
            withEdges 
          />
        </Group>
      )}
    </Modal>
  );
};

export default CloudinaryPicker; 