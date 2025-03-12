import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Button, 
  Group, 
  Grid, 
  Card, 
  Image, 
  Badge, 
  ActionIcon, 
  Modal, 
  TextInput,
  Select,
  LoadingOverlay,
  Alert,
  Menu,
  Pagination,
  Paper,
  Flex,
  Center,
  Tooltip
} from '@mantine/core';
import { 
  IconPencil, 
  IconTrash, 
  IconSearch, 
  IconRefresh,
  IconDotsVertical,
  IconAlertCircle,
  IconPhoto,
  IconCloudUpload
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { fetchImages, updateImage, deleteImage, ImageData, ImageUpdateData } from '../../api/imageApi';
import CloudinaryMediaLibraryComponent from './CloudinaryMediaLibrary';
import CloudinaryUploadWidgetComponent from './CloudinaryUploadWidget';
import { IMAGE_TYPES, SECTIONS } from '../../services/cloudinaryConfig';

interface ImagesGalleryProps {
  refreshTrigger?: number;
}

const ImagesGallery: React.FC<ImagesGalleryProps> = ({ refreshTrigger = 0 }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для фильтрации и поиска
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Состояния для модального окна редактирования
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [editFormData, setEditFormData] = useState<ImageUpdateData>({});
  const [saving, setSaving] = useState(false);
  
  // Состояния для Cloudinary виджетов
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [uploadWidgetOpen, setUploadWidgetOpen] = useState(false);
  
  // Загрузка изображений
  const loadImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit: 12,
        type: typeFilter || undefined,
        section: sectionFilter || undefined,
        search: searchQuery || undefined
      };
      
      const response = await fetchImages(params);
      
      // Добавляем проверки на undefined
      setImages(response?.images || []);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalItems(response?.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      setError('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.');
      // Устанавливаем пустые значения при ошибке
      setImages([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
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
        message: 'Не удалось удалить изображение',
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
    } catch (error) {
      console.error('Ошибка при обновлении изображения:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить изображение',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Обработчик выбора изображения из Cloudinary Media Library
  const handleMediaLibrarySelect = async (selectedImages: ImageData[]) => {
    try {
      setLoading(true);
      
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
        message: 'Не удалось добавить изображения',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {/* Верхняя панель с кнопками */}
      <Paper shadow="xs" p="md" mb="md">
        <Group>
          <Button 
            leftSection={<IconCloudUpload size={16} />} 
            onClick={() => setUploadWidgetOpen(true)}
          >
            Загрузить изображения
          </Button>
          
          <Button 
            leftSection={<IconPhoto size={16} />} 
            variant="light"
            onClick={() => setMediaLibraryOpen(true)}
          >
            Библиотека Cloudinary
          </Button>
          
          <Button 
            leftSection={<IconRefresh size={16} />} 
            variant="subtle"
            onClick={loadImages}
          >
            Обновить
          </Button>
          
          {totalItems > 0 && (
            <Text size="sm" c="dimmed">
              Всего изображений: {totalItems}
            </Text>
          )}
        </Group>
      </Paper>
      
      {/* Фильтры */}
      <Paper shadow="xs" p="md" mb="md">
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <TextInput
              placeholder="Поиск изображений"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
              placeholder="Тип изображения"
                value={typeFilter}
                onChange={setTypeFilter}
              data={IMAGE_TYPES}
                clearable
              />
            </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 3 }}>
              <Select
              placeholder="Раздел"
                value={sectionFilter}
                onChange={setSectionFilter}
              data={SECTIONS}
                clearable
              />
            </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 2 }}>
            <Button 
              variant="light" 
              onClick={handleResetFilters}
              fullWidth
            >
              Сбросить
            </Button>
            </Grid.Col>
          </Grid>
        </Paper>
      
      {/* Список изображений */}
      <Box pos="relative" mih={400}>
        <LoadingOverlay visible={loading} />
        
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}
        
        {!loading && !error && images.length === 0 ? (
          <Center py={50}>
            <Box ta="center">
              <IconPhoto size={48} color="gray" style={{ opacity: 0.5 }} />
              <Text c="dimmed" mt="md">
            Изображения не найдены
          </Text>
        </Box>
          </Center>
      ) : (
          <Grid>
            {images.map((image) => (
              <Grid.Col key={image._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card shadow="sm" padding="sm">
                  <Card.Section>
                      <Image
                        src={image.secure_url}
                      height={200}
                      alt={image.alt || 'Image'}
                        fit="cover"
                    />
                  </Card.Section>
                  
                  <Text mt="sm" fw={500} lineClamp={1}>
                    {image.title || 'Без названия'}
                  </Text>
                  
                  <Flex gap={5} wrap="wrap" mt={5}>
                    {image.type && (
                      <Badge size="sm" variant="light">
                        {IMAGE_TYPES.find(t => t.value === image.type)?.label || image.type}
                      </Badge>
                    )}
                    {image.section && (
                      <Badge size="sm" variant="outline">
                        {SECTIONS.find(s => s.value === image.section)?.label || image.section}
                        </Badge>
                    )}
                  </Flex>
                  
                  <Group mt="md" justify="space-between">
                    <Tooltip label="Копировать URL">
                      <Button 
                        variant="light" 
                        size="xs"
                        onClick={() => handleCopyUrl(image.secure_url)}
                      >
                        Копировать URL
                      </Button>
                    </Tooltip>
                    
                    <Menu shadow="md" width={200}>
                          <Menu.Target>
                        <ActionIcon variant="subtle">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            <Menu.Item 
                          leftSection={<IconPencil size={14} />}
                          onClick={() => {
                            setCurrentImage(image);
                            setEditFormData({
                              title: image.title,
                              alt: image.alt,
                              type: image.type,
                              section: image.section
                            });
                            setEditModalOpen(true);
                          }}
                            >
                              Редактировать
                            </Menu.Item>
                            <Menu.Item 
                          leftSection={<IconTrash size={14} />}
                              color="red" 
                          onClick={() => handleDeleteImage(image)}
                            >
                              Удалить
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Box>
          
      {/* Пагинация */}
      {totalPages > 1 && (
        <Group justify="center" mt="xl">
              <Pagination 
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
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
          <Box>
                <Image
                  src={currentImage.secure_url}
              alt={currentImage.alt || 'Preview'}
              fit="contain"
              h={200}
              mb="md"
            />
            
                <TextInput
              label="Название"
              placeholder="Введите название изображения"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  mb="sm"
                />
                
            <TextInput
              label="Alt текст"
                  placeholder="Введите альтернативный текст"
                  value={editFormData.alt || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, alt: e.target.value })}
                  mb="sm"
                />
                
                <Select
              label="Тип"
              placeholder="Выберите тип изображения"
                  data={IMAGE_TYPES}
                  value={editFormData.type || ''}
                  onChange={(value) => setEditFormData({ ...editFormData, type: value || undefined })}
              mb="sm"
                  clearable
                />
                
                <Select
              label="Раздел"
                  placeholder="Выберите раздел"
                  data={SECTIONS}
                  value={editFormData.section || ''}
                  onChange={(value) => setEditFormData({ ...editFormData, section: value || undefined })}
              mb="lg"
                  clearable
            />
            
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setEditModalOpen(false)}>
                Отмена
              </Button>
              <Button 
                onClick={() => handleUpdateImage(currentImage, editFormData)}
                loading={saving}
              >
                Сохранить
              </Button>
            </Group>
          </Box>
        )}
      </Modal>
      
      {/* Модальное окно Cloudinary Media Library */}
      <CloudinaryMediaLibraryComponent
        opened={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
        onSelect={handleMediaLibrarySelect}
        multiple={true}
        maxFiles={10}
        filterOptions={{
          type: typeFilter || undefined,
          section: sectionFilter || undefined
        }}
      />
      
      {/* Модальное окно Cloudinary Upload Widget */}
      <CloudinaryUploadWidgetComponent
        opened={uploadWidgetOpen}
        onClose={() => setUploadWidgetOpen(false)}
        onUploadSuccess={loadImages}
        multiple={true}
        maxFiles={10}
      />
    </Box>
  );
};

export default ImagesGallery; 