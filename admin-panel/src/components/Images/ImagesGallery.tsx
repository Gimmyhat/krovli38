import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Grid, 
  Card, 
  Image, 
  Group, 
  ActionIcon, 
  TextInput, 
  Select, 
  Pagination, 
  Loader, 
  Stack, 
  Title, 
  Badge, 
  Switch,
  MultiSelect,
  Modal,
  Textarea} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconCopy, 
  IconEdit, 
  IconTrash, 
  IconCloudUpload, 
  IconSearch, 
  IconX, 
  IconExternalLink 
} from '@tabler/icons-react';
import { fetchImages, updateImage, deleteImage, ImageData, ImageUpdateData } from '../../api/imageApi';
import CloudinaryMediaLibraryComponent from './CloudinaryMediaLibrary';
import { IMAGE_TYPES, SECTIONS } from '../../constants';
import NativeUploadAdapter from './NativeUploadAdapter';

// Копируем необходимый интерфейс ImageQueryParams, чтобы не зависеть от внешнего модуля
interface ImageQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  section?: string;
  search?: string;
  isActive?: boolean;
  tags?: string[];
  sort?: string;
}

// Имитируем хук useImages для совместимости с существующим кодом
const useImages = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10
  });

  const getImages = useCallback(async (query?: ImageQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchImages(query);
      setImages(result.images || []);
      setPagination(result.pagination || {
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 10
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке изображений');
      return { 
        images: [], 
        pagination: {
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          limit: 10
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    images,
    loading,
    error,
    totalCount: pagination.totalItems,
    pagination,
    getImages
  };
};

interface ImagesGalleryProps {
  refreshTrigger?: number;
}

const ImagesGallery: React.FC<ImagesGalleryProps> = ({ refreshTrigger = 0 }) => {
  // Используем хук useImages для работы с изображениями
  const { images, loading, error, totalCount, pagination, getImages } = useImages();
  
  // Состояния для фильтрации и поиска
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  
  // Состояния для модального окна редактирования
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [editFormData, setEditFormData] = useState<ImageUpdateData>({});
  const [saving, setSaving] = useState(false);
  
  // Состояния для Cloudinary виджетов
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [uploadOpened, setUploadOpened] = useState(false);
  
  // Загрузка изображений
  const loadImages = async () => {
    const params: ImageQueryParams = {
      page: currentPage,
      limit: 12,
      type: typeFilter || undefined,
      section: sectionFilter || undefined,
      search: searchQuery || undefined
    };
    
    await getImages(params);
  };
  
  // Загружаем изображения при монтировании и при изменении фильтров
  useEffect(() => {
    loadImages();
  }, [currentPage, typeFilter, sectionFilter, searchQuery, refreshTrigger]);
  
  // Сброс фильтров
  const handleResetFilters = () => {
    setTypeFilter(null);
    setSectionFilter(null);
    setSearchQuery('');
    setCurrentPage(1);
  };
  
  // Копирование URL изображения
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      notifications.show({
        title: 'URL скопирован',
        message: 'URL изображения скопирован в буфер обмена',
        color: 'green'
      });
    });
  };
  
  // Обработчик удаления изображения
  const handleDeleteImage = async (image: ImageData) => {
    if (!window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      return;
    }
    
    try {
      await deleteImage(image._id);
      await loadImages(); // Перезагружаем список после удаления
      
      notifications.show({
        title: 'Успешно',
        message: 'Изображение удалено',
        color: 'green'
      });
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить изображение. Пожалуйста, попробуйте позже.',
        color: 'red'
      });
    }
  };
  
  // Обработчик обновления изображения
  const handleUpdateImage = async (image: ImageData, data: ImageUpdateData) => {
    setSaving(true);
    
    try {
      await updateImage(image._id, data);
      await loadImages(); // Перезагружаем список после обновления
      
      notifications.show({
        title: 'Успешно',
        message: 'Изображение обновлено',
        color: 'green'
      });
      
      setEditModalOpen(false);
      setCurrentImage(null);
    } catch (error) {
      console.error('Ошибка при обновлении изображения:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить изображение. Пожалуйста, попробуйте позже.',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Обработчик выбора изображения из Cloudinary Media Library
  const handleMediaLibrarySelect = async (selectedImages: ImageData[]) => {
    try {
      notifications.show({
        title: 'Обработка',
        message: 'Добавление выбранных изображений в библиотеку...',
        color: 'blue',
        loading: true
      });
      
      await loadImages(); // Перезагружаем изображения
      
      notifications.show({
        title: 'Успешно',
        message: `Добавлено ${selectedImages.length} изображений`,
        color: 'green'
      });
    } catch (error) {
      console.error('Ошибка при добавлении изображений из Media Library:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось добавить изображения из Media Library',
        color: 'red'
      });
    }
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <Box>
      {/* Фильтры */}
      <Grid mb="md">
        <Grid.Col span={4}>
          <TextInput
            placeholder="Поиск изображений"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            rightSection={
              searchQuery ? (
                <ActionIcon onClick={() => setSearchQuery('')}>
                  <IconX size={16} />
                </ActionIcon>
              ) : (
                <IconSearch size={16} />
              )
            }
          />
        </Grid.Col>
        
        <Grid.Col span={3}>
          <Select
            placeholder="Фильтр по типу"
            value={typeFilter}
            onChange={setTypeFilter}
            data={IMAGE_TYPES}
            clearable
          />
        </Grid.Col>
        
        <Grid.Col span={3}>
          <Select
            placeholder="Фильтр по разделу"
            value={sectionFilter}
            onChange={setSectionFilter}
            data={SECTIONS}
            clearable
          />
        </Grid.Col>
        
        <Grid.Col span={2}>
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            disabled={!typeFilter && !sectionFilter && !searchQuery}
          >
            Сбросить
          </Button>
        </Grid.Col>
      </Grid>
      
      {/* Заголовок и кнопки */}
      <Group justify="space-between" mb="lg">
        <Group>
          <Title order={2}>Изображения</Title>
          
          {totalCount > 0 && (
            <Text size="sm" c="dimmed">
              Всего изображений: {totalCount}
            </Text>
          )}
        </Group>
        
        <Group>
          <Button
            leftSection={<IconCloudUpload size={16} />}
            onClick={() => setMediaLibraryOpen(true)}
          >
            Медиа библиотека
          </Button>
          
          <Button 
            leftSection={<IconCloudUpload size={16} />} 
            onClick={() => setUploadOpened(true)}
          >
            Загрузить изображения
          </Button>
        </Group>
      </Group>
      
      {/* Список изображений */}
      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Loader size="lg" />
        </Box>
      ) : error ? (
        <Box style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text color="red">{error}</Text>
          <Button mt="md" onClick={loadImages}>Повторить загрузку</Button>
        </Box>
      ) : images.length === 0 ? (
        <Box style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text size="lg" fw={500} mb="md">Изображений не найдено</Text>
          <Text color="dimmed" mb="lg">
            {searchQuery || typeFilter || sectionFilter
              ? 'Попробуйте изменить параметры поиска или сбросить фильтры'
              : 'Загрузите изображения, чтобы они появились здесь'}
          </Text>
          <Button 
            variant="outline" 
            leftSection={<IconCloudUpload size={18} />}
            onClick={() => setUploadOpened(true)}
          >
            Загрузить новые изображения
          </Button>
        </Box>
      ) : (
          <Grid>
            {images.map((image: ImageData) => (
              <Grid.Col key={image._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="sm">
                  <Card.Section>
                    <Image
                      src={image.secure_url}
                      alt={image.alt}
                      height={200}
                      fit="contain"
                    />
                  </Card.Section>
                  
                  <Text fw={500} mt="sm" mb={0} lineClamp={1} title={image.title || ''}>
                    {image.title || 'Без названия'}
                  </Text>
                  
                  <Group mt="xs" gap={6}>
                    {image.type && (
                      <Badge size="sm" color="blue">{image.type}</Badge>
                    )}
                    {image.section && (
                      <Badge size="sm" color="green">{image.section}</Badge>
                    )}
                  </Group>
                  
                  <Text size="xs" color="dimmed" mt="xs" mb="sm">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </Text>
                  
                  <Group justify="flex-end" mt="xs">
                    <ActionIcon onClick={() => window.open(image.secure_url, '_blank')}>
                      <IconExternalLink size={18} />
                    </ActionIcon>
                    <ActionIcon onClick={() => handleCopyUrl(image.secure_url)}>
                      <IconCopy size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      onClick={() => {
                        setCurrentImage(image);
                        setEditFormData({
                          alt: image.alt,
                          title: image.title,
                          type: image.type,
                          section: image.section,
                          tags: image.tags,
                          isActive: image.isActive
                        });
                        setEditModalOpen(true);
                      }}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon 
                      color="red" 
                      onClick={() => handleDeleteImage(image)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
        
        {/* Пагинация */}
        {pagination.totalPages > 1 && (
          <Group justify="center" mt="xl">
                <Pagination 
              value={currentPage}
              onChange={handlePageChange}
              total={pagination.totalPages}
            />
          </Group>
        )}
        
        {/* Модальное окно редактирования */}
        <Modal
          opened={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Редактирование изображения"
        >
          {currentImage && (
            <Stack>
              <Image
                src={currentImage.secure_url}
                alt={currentImage.alt}
                height={200}
                fit="contain"
                mb="md"
              />
              
              <TextInput
                label="Название"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({...editFormData, title: e.currentTarget.value})}
              />
              
              <Textarea
                label="Alt текст"
                value={editFormData.alt || ''}
                onChange={(e) => setEditFormData({...editFormData, alt: e.currentTarget.value})}
                autosize
                minRows={2}
              />
              
              <Select
                label="Тип изображения"
                data={IMAGE_TYPES}
                value={editFormData.type || ''}
                onChange={(value) => setEditFormData({...editFormData, type: value || ''})}
                clearable
              />
              
              <Select
                label="Раздел сайта"
                data={SECTIONS}
                value={editFormData.section || ''}
                onChange={(value) => setEditFormData({...editFormData, section: value || ''})}
                clearable
              />
              
              <MultiSelect
                label="Теги"
                data={[]}
                value={editFormData.tags || []}
                onChange={(value) => setEditFormData({...editFormData, tags: value})}
                clearable
                searchable
              />
              
              <Switch
                label="Активно"
                checked={editFormData.isActive === undefined ? true : editFormData.isActive}
                onChange={(e) => setEditFormData({...editFormData, isActive: e.currentTarget.checked})}
                mt="xs"
              />
              
              <Group justify="flex-end" mt="md">
                <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                  Отмена
                </Button>
                <Button 
                  onClick={() => handleUpdateImage(currentImage, editFormData)}
                  loading={saving}
                >
                  Сохранить
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>
        
        {/* Модальное окно Cloudinary Media Library */}
        <CloudinaryMediaLibraryComponent
          opened={mediaLibraryOpen}
          onClose={() => setMediaLibraryOpen(false)}
          onSelect={handleMediaLibrarySelect}
        />
        
        {/* Модальное окно загрузки */}
        <NativeUploadAdapter
          opened={uploadOpened}
          onClose={() => setUploadOpened(false)}
          onUploadSuccess={loadImages}
        />
    </Box>
  );
};

export default ImagesGallery; 