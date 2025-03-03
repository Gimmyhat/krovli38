import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  Grid, 
  Card, 
  Image, 
  Badge, 
  ActionIcon, 
  Tooltip, 
  Modal, 
  TextInput,
  Select,
  MultiSelect,
  Textarea,
  Switch,
  LoadingOverlay,
  Alert,
  Menu,
  Pagination,
  Paper,
  Flex
} from '@mantine/core';
import { 
  IconPencil, 
  IconTrash, 
  IconDownload, 
  IconFilter, 
  IconSearch, 
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconX,
  IconDotsVertical,
  IconAlertCircle,
  IconCopy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { fetchImages, updateImage, deleteImage, ImageData, ImageUpdateData } from '../../api/imageApi';

// Типы изображений для выбора (те же, что в ImageUploader)
const IMAGE_TYPES = [
  { value: 'banner', label: 'Баннер' },
  { value: 'gallery', label: 'Галерея' },
  { value: 'product', label: 'Продукт' },
  { value: 'category', label: 'Категория' },
  { value: 'icon', label: 'Иконка' },
  { value: 'logo', label: 'Логотип' },
];

// Разделы сайта для выбора (те же, что в ImageUploader)
const SECTIONS = [
  { value: 'home', label: 'Главная' },
  { value: 'catalog', label: 'Каталог' },
  { value: 'portfolio', label: 'Портфолио' },
  { value: 'about', label: 'О нас' },
  { value: 'contacts', label: 'Контакты' },
];

// Доступные теги (те же, что в ImageUploader)
const AVAILABLE_TAGS = [
  { value: 'featured', label: 'Главное' },
  { value: 'new', label: 'Новое' },
  { value: 'promo', label: 'Промо' },
  { value: 'background', label: 'Фон' },
  { value: 'small', label: 'Маленькое' },
  { value: 'large', label: 'Большое' },
];

interface ImagesGalleryProps {
  refreshTrigger?: number; // Props для обновления галереи извне
}

const ImagesGallery: React.FC<ImagesGalleryProps> = ({ refreshTrigger = 0 }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для фильтрации и поиска
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для модалки редактирования
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [editFormData, setEditFormData] = useState<ImageUpdateData>({});
  const [editLoading, setEditLoading] = useState(false);
  
  // Состояния для модалки удаления
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Состояния для модалки детального просмотра
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Состояние для пагинации
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 12;
  
  // Получение списка изображений
  const fetchImagesList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchImages();
      setImages(data);
    } catch (err) {
      console.error('Ошибка при получении списка изображений:', err);
      setError('Не удалось загрузить список изображений. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем изображения при монтировании компонента и при изменении refreshTrigger
  useEffect(() => {
    fetchImagesList();
  }, [refreshTrigger]);
  
  // Копирование URL изображения
  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      notifications.show({
        title: 'Скопировано',
        message: 'URL изображения скопирован в буфер обмена',
        color: 'green',
      });
    });
  };
  
  // Открытие модального окна редактирования
  const openEditModal = (image: ImageData) => {
    setCurrentImage(image);
    setEditFormData({
      alt: image.alt,
      title: image.title,
      type: image.type,
      section: image.section,
      tags: image.tags,
      order: image.order,
      isActive: image.isActive
    });
    setEditModalOpen(true);
  };
  
  // Открытие модального окна удаления
  const openDeleteModal = (image: ImageData) => {
    setCurrentImage(image);
    setDeleteModalOpen(true);
  };
  
  // Открытие модального окна просмотра
  const openViewModal = (image: ImageData) => {
    setCurrentImage(image);
    setViewModalOpen(true);
  };
  
  // Обновление данных изображения
  const handleUpdateImage = async () => {
    if (!currentImage) return;
    
    setEditLoading(true);
    
    try {
      const updatedImage = await updateImage(currentImage._id, editFormData);
      
      // Обновляем список изображений
      setImages(prevImages => 
        prevImages.map(img => img._id === updatedImage._id ? updatedImage : img)
      );
      
      notifications.show({
        title: 'Успешно',
        message: 'Данные изображения обновлены',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      
      setEditModalOpen(false);
    } catch (err) {
      console.error('Ошибка при обновлении изображения:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить данные изображения',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setEditLoading(false);
    }
  };
  
  // Удаление изображения
  const handleDeleteImage = async () => {
    if (!currentImage) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteImage(currentImage._id);
      
      // Удаляем изображение из списка
      setImages(prevImages => prevImages.filter(img => img._id !== currentImage._id));
      
      notifications.show({
        title: 'Успешно',
        message: 'Изображение удалено',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
      
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Ошибка при удалении изображения:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить изображение',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Быстрое переключение активности изображения
  const toggleImageActive = async (image: ImageData) => {
    try {
      const updatedImage = await updateImage(image._id, {
        isActive: !image.isActive
      });
      
      // Обновляем список изображений
      setImages(prevImages => 
        prevImages.map(img => img._id === updatedImage._id ? updatedImage : img)
      );
      
      notifications.show({
        title: 'Успешно',
        message: `Изображение ${updatedImage.isActive ? 'активировано' : 'деактивировано'}`,
        color: 'green',
        icon: <IconCheck size={18} />,
      });
    } catch (err) {
      console.error('Ошибка при изменении статуса изображения:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось изменить статус изображения',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    }
  };
  
  // Фильтрация изображений
  const filteredImages = images
    .filter(image => {
      // Фильтр по типу
      if (typeFilter && image.type !== typeFilter) return false;
      
      // Фильтр по разделу
      if (sectionFilter && image.section !== sectionFilter) return false;
      
      // Поиск по названию, alt-тексту и тегам
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          image.title.toLowerCase().includes(query) ||
          image.alt.toLowerCase().includes(query) ||
          image.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Сортировка по порядку и дате создания
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  
  // Пагинация
  const paginatedImages = filteredImages.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );
  
  // Обработчик сброса фильтров
  const resetFilters = () => {
    setTypeFilter(null);
    setSectionFilter(null);
    setSearchQuery('');
  };
  
  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} />
      
      {error && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Ошибка" 
          color="red" 
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Box mb="md">
        <Group position="apart">
          <Title order={3}>Галерея изображений</Title>
          <Button variant="outline" leftIcon={<IconRefresh size={16} />} onClick={fetchImagesList}>
            Обновить
          </Button>
        </Group>
        
        <Text color="dimmed" size="sm" mb="md">
          Всего изображений: {images.length} | Отображается: {filteredImages.length}
        </Text>
        
        <Paper p="md" withBorder mb="md">
          <Grid>
            <Grid.Col span={4}>
              <Select
                label="Фильтр по типу"
                placeholder="Все типы"
                data={IMAGE_TYPES}
                value={typeFilter}
                onChange={setTypeFilter}
                clearable
                icon={<IconFilter size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={4}>
              <Select
                label="Фильтр по разделу"
                placeholder="Все разделы"
                data={SECTIONS}
                value={sectionFilter}
                onChange={setSectionFilter}
                clearable
                icon={<IconFilter size={16} />}
              />
            </Grid.Col>
            
            <Grid.Col span={4}>
              <TextInput
                label="Поиск"
                placeholder="Введите запрос..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                icon={<IconSearch size={16} />}
                rightSection={
                  searchQuery && (
                    <ActionIcon size="sm" onClick={() => setSearchQuery('')}>
                      <IconX size={16} />
                    </ActionIcon>
                  )
                }
              />
            </Grid.Col>
          </Grid>
          
          {(typeFilter || sectionFilter || searchQuery) && (
            <Group position="right" mt="sm">
              <Button 
                variant="subtle" 
                compact 
                onClick={resetFilters}
              >
                Сбросить фильтры
              </Button>
            </Group>
          )}
        </Paper>
      </Box>
      
      {!loading && filteredImages.length === 0 ? (
        <Box ta="center" py="xl">
          <Text size="lg" weight={500} color="dimmed">
            Изображения не найдены
          </Text>
          <Text size="sm" color="dimmed" mt="xs">
            Попробуйте изменить параметры фильтрации или загрузить новые изображения.
          </Text>
        </Box>
      ) : (
        <>
          <Grid>
            {paginatedImages.map((image) => (
              <Grid.Col key={image._id} xs={12} sm={6} md={4} lg={3}>
                <Card shadow="sm" p="xs" radius="md" withBorder>
                  <Card.Section>
                    <Box pos="relative">
                      <Image
                        src={image.secure_url}
                        height={160}
                        fit="cover"
                        withPlaceholder
                        styles={{ image: { cursor: 'pointer' } }}
                        onClick={() => openViewModal(image)}
                      />
                      
                      <Group position="apart" spacing={0} style={{ position: 'absolute', top: 5, width: '100%', padding: '0 5px' }}>
                        <Badge size="sm" color={image.isActive ? 'green' : 'gray'}>
                          {image.isActive ? 'Активно' : 'Отключено'}
                        </Badge>
                        
                        <Menu position="bottom-end" shadow="md">
                          <Menu.Target>
                            <ActionIcon variant="light">
                              <IconDotsVertical size={16} />
                            </ActionIcon>
                          </Menu.Target>
                          
                          <Menu.Dropdown>
                            <Menu.Item 
                              icon={<IconEye size={16} />} 
                              onClick={() => openViewModal(image)}
                            >
                              Просмотр
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconPencil size={16} />} 
                              onClick={() => openEditModal(image)}
                            >
                              Редактировать
                            </Menu.Item>
                            <Menu.Item 
                              icon={<IconCopy size={16} />} 
                              onClick={() => copyImageUrl(image.secure_url)}
                            >
                              Копировать URL
                            </Menu.Item>
                            <Menu.Item 
                              icon={image.isActive ? <IconEyeOff size={16} /> : <IconEye size={16} />} 
                              onClick={() => toggleImageActive(image)}
                            >
                              {image.isActive ? 'Деактивировать' : 'Активировать'}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item 
                              color="red" 
                              icon={<IconTrash size={16} />} 
                              onClick={() => openDeleteModal(image)}
                            >
                              Удалить
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Box>
                  </Card.Section>
                  
                  <Box mt="xs">
                    <Text weight={500} lineClamp={1}>
                      {image.title || 'Без названия'}
                    </Text>
                    
                    <Text size="xs" color="dimmed" lineClamp={1}>
                      {image.alt || 'Без описания'}
                    </Text>
                    
                    <Flex gap="xs" mt="xs" wrap="wrap">
                      {image.type && (
                        <Badge size="xs" variant="light">
                          {IMAGE_TYPES.find(t => t.value === image.type)?.label || image.type}
                        </Badge>
                      )}
                      
                      {image.section && (
                        <Badge size="xs" variant="light">
                          {SECTIONS.find(s => s.value === image.section)?.label || image.section}
                        </Badge>
                      )}
                    </Flex>
                    
                    <Text size="xs" color="dimmed" mt="xs">
                      {image.width}×{image.height} • {image.format.toUpperCase()}
                    </Text>
                  </Box>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
          
          {filteredImages.length > itemsPerPage && (
            <Flex justify="center" mt="lg">
              <Pagination 
                total={Math.ceil(filteredImages.length / itemsPerPage)} 
                page={activePage} 
                onChange={setActivePage} 
              />
            </Flex>
          )}
        </>
      )}
      
      {/* Модальное окно для редактирования */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Редактирование изображения"
        size="lg"
      >
        {currentImage && (
          <Box pos="relative">
            <LoadingOverlay visible={editLoading} />
            
            <Grid>
              <Grid.Col span={4}>
                <Image
                  src={currentImage.secure_url}
                  radius="md"
                  withPlaceholder
                  caption={`${currentImage.width}×${currentImage.height} • ${currentImage.format.toUpperCase()}`}
                />
              </Grid.Col>
              
              <Grid.Col span={8}>
                <TextInput
                  label="Заголовок"
                  placeholder="Введите заголовок"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  mb="sm"
                />
                
                <Textarea
                  label="Alt текст (для SEO)"
                  placeholder="Введите альтернативный текст"
                  value={editFormData.alt || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, alt: e.target.value })}
                  mb="sm"
                  autosize
                  minRows={2}
                  maxRows={4}
                />
                
                <Select
                  label="Тип изображения"
                  placeholder="Выберите тип"
                  data={IMAGE_TYPES}
                  value={editFormData.type || ''}
                  onChange={(value) => setEditFormData({ ...editFormData, type: value || undefined })}
                  clearable
                  mb="sm"
                />
                
                <Select
                  label="Раздел сайта"
                  placeholder="Выберите раздел"
                  data={SECTIONS}
                  value={editFormData.section || ''}
                  onChange={(value) => setEditFormData({ ...editFormData, section: value || undefined })}
                  clearable
                  mb="sm"
                />
                
                <MultiSelect
                  label="Теги"
                  placeholder="Выберите теги"
                  data={AVAILABLE_TAGS}
                  value={editFormData.tags || []}
                  onChange={(value) => setEditFormData({ ...editFormData, tags: value })}
                  searchable
                  clearable
                  mb="sm"
                />
                
                <Group grow mb="sm">
                  <TextInput
                    label="Порядок отображения"
                    placeholder="0"
                    type="number"
                    value={editFormData.order?.toString() || ''}
                    onChange={(e) => setEditFormData({ 
                      ...editFormData, 
                      order: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                  />
                  
                  <Switch
                    label="Активно"
                    checked={editFormData.isActive === undefined ? true : editFormData.isActive}
                    onChange={(e) => setEditFormData({ 
                      ...editFormData, 
                      isActive: e.currentTarget.checked 
                    })}
                    mt="lg"
                  />
                </Group>
              </Grid.Col>
            </Grid>
            
            <Group position="right" mt="lg">
              <Button variant="default" onClick={() => setEditModalOpen(false)}>
                Отмена
              </Button>
              <Button color="blue" onClick={handleUpdateImage}>
                Сохранить
              </Button>
            </Group>
          </Box>
        )}
      </Modal>
      
      {/* Модальное окно для удаления */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Удаление изображения"
        size="sm"
      >
        <Box pos="relative">
          <LoadingOverlay visible={deleteLoading} />
          
          <Text>
            Вы действительно хотите удалить это изображение? Данное действие нельзя отменить.
          </Text>
          
          {currentImage && (
            <Image
              src={currentImage.secure_url}
              height={150}
              fit="contain"
              withPlaceholder
              mt="md"
              mb="md"
              style={{ maxWidth: '100%' }}
            />
          )}
          
          <Group position="right" mt="lg">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button color="red" onClick={handleDeleteImage}>
              Удалить
            </Button>
          </Group>
        </Box>
      </Modal>
      
      {/* Модальное окно для просмотра */}
      <Modal
        opened={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={currentImage?.title || 'Просмотр изображения'}
        size="lg"
      >
        {currentImage && (
          <>
            <Image
              src={currentImage.secure_url}
              radius="md"
              withPlaceholder
              my="md"
              style={{ maxWidth: '100%' }}
            />
            
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" weight={500}>Alt текст:</Text>
                <Text size="sm" mb="xs">{currentImage.alt || '—'}</Text>
                
                <Text size="sm" weight={500}>Тип:</Text>
                <Text size="sm" mb="xs">
                  {IMAGE_TYPES.find(t => t.value === currentImage.type)?.label || currentImage.type || '—'}
                </Text>
                
                <Text size="sm" weight={500}>Раздел:</Text>
                <Text size="sm" mb="xs">
                  {SECTIONS.find(s => s.value === currentImage.section)?.label || currentImage.section || '—'}
                </Text>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Text size="sm" weight={500}>Размер:</Text>
                <Text size="sm" mb="xs">{currentImage.width}×{currentImage.height} ({currentImage.format.toUpperCase()})</Text>
                
                <Text size="sm" weight={500}>Статус:</Text>
                <Text size="sm" mb="xs">
                  <Badge size="sm" color={currentImage.isActive ? 'green' : 'gray'}>
                    {currentImage.isActive ? 'Активно' : 'Отключено'}
                  </Badge>
                </Text>
                
                <Text size="sm" weight={500}>Теги:</Text>
                <Group spacing="xs" mb="xs">
                  {currentImage.tags.length > 0 ? (
                    currentImage.tags.map((tag, index) => (
                      <Badge key={index} size="xs">{tag}</Badge>
                    ))
                  ) : (
                    <Text size="sm">—</Text>
                  )}
                </Group>
              </Grid.Col>
            </Grid>
            
            <Group position="apart" mt="lg">
              <Group>
                <Button 
                  variant="light" 
                  leftIcon={<IconCopy size={16} />} 
                  onClick={() => copyImageUrl(currentImage.secure_url)}
                >
                  Копировать URL
                </Button>
                
                <Button
                  component="a"
                  href={currentImage.secure_url}
                  target="_blank"
                  variant="light"
                  leftIcon={<IconDownload size={16} />}
                  download
                >
                  Скачать
                </Button>
              </Group>
              
              <Button 
                color="blue" 
                leftIcon={<IconPencil size={16} />} 
                onClick={() => {
                  setViewModalOpen(false);
                  openEditModal(currentImage);
                }}
              >
                Редактировать
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </Box>
  );
};

export default ImagesGallery; 