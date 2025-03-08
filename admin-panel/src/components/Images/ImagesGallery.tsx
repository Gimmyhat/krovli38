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
  Modal, 
  TextInput,
  Switch,
  LoadingOverlay,
  Alert,
  Stack,
  Paper
} from '@mantine/core';
import { 
  IconPencil, 
  IconTrash, 
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconAlertCircle,
  IconCopy} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { fetchImages, updateImage, deleteImage, ImageData, ImageUpdateData } from '../../api/imageApi';

// Типы и пропсы
interface ImagesGalleryProps {
  refreshTrigger?: number; // Props для обновления галереи извне
}

// Упрощенная версия компонента
const ImagesGallery: React.FC<ImagesGalleryProps> = ({ refreshTrigger = 0 }) => {
  // Основные состояния
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модальных окон
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const [editFormData, setEditFormData] = useState<ImageUpdateData>({});
  const [editLoading, setEditLoading] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  
  // Загрузка изображений при монтировании и при изменении refreshTrigger
  useEffect(() => {
    fetchImagesList();
  }, [refreshTrigger]);
  
  // Функция для получения списка изображений
  const fetchImagesList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchImages();
      console.log('Полученные данные изображений:', data);
      
      // Безопасная установка данных
      if (data && Array.isArray(data)) {
        setImages(data);
        console.log('Успешно установлены изображения:', data.length);
      } else {
        console.warn('API вернул неожиданный формат данных:', data);
        setImages([]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке изображений:', err);
      setError('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Копирование URL изображения в буфер обмена
  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        notifications.show({
          title: 'Скопировано',
          message: 'URL изображения скопирован в буфер обмена',
          color: 'green',
        });
      })
      .catch(err => {
        console.error('Ошибка при копировании URL:', err);
      });
  };
  
  // Открытие модального окна редактирования
  const openEditModal = (image: ImageData) => {
    if (!image) return;
    
    setCurrentImage(image);
    setEditFormData({
      type: image.type,
      title: image.title,
      alt: image.alt,
      section: image.section,
      tags: image.tags,
      order: image.order,
      isActive: image.isActive
    });
    setEditModalOpen(true);
  };
  
  // Открытие модального окна удаления
  const openDeleteModal = (image: ImageData) => {
    if (!image) return;
    
    setCurrentImage(image);
    setDeleteModalOpen(true);
  };
  
  // Открытие модального окна просмотра
  const openViewModal = (image: ImageData) => {
    if (!image) return;
    
    setCurrentImage(image);
    setViewModalOpen(true);
  };
  
  // Обработчик обновления изображения
  const handleUpdateImage = async () => {
    if (!currentImage) return;
    
    setEditLoading(true);
    
    try {
      const updatedImage = await updateImage(currentImage._id, editFormData);
      
      if (updatedImage) {
        // Обновляем изображение в списке
        setImages(prevImages => 
          prevImages.map(img => 
            img._id === updatedImage._id ? updatedImage : img
          )
        );
        
        setEditModalOpen(false);
        
        notifications.show({
          title: 'Успешно',
          message: 'Изображение обновлено',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        throw new Error('Не удалось обновить изображение: сервер вернул пустой ответ');
      }
    } catch (err) {
      console.error('Ошибка при обновлении изображения:', err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить изображение',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setEditLoading(false);
    }
  };
  
  // Обработчик удаления изображения
  const handleDeleteImage = async () => {
    if (!currentImage) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteImage(currentImage._id);
      
      // Удаляем изображение из списка
      setImages(prevImages => 
        prevImages.filter(img => img._id !== currentImage._id)
      );
      
      setDeleteModalOpen(false);
      
      notifications.show({
        title: 'Успешно',
        message: 'Изображение удалено',
        color: 'green',
        icon: <IconCheck size={18} />,
      });
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
  
  // Переключение статуса активности изображения
  const toggleImageActive = async (image: ImageData) => {
    try {
      const updatedImage = await updateImage(image._id, {
        isActive: !image.isActive
      });
      
      if (updatedImage) {
        // Обновляем изображение в списке
        setImages(prevImages => 
          prevImages.map(img => 
            img._id === updatedImage._id ? updatedImage : img
          )
        );
        
        notifications.show({
          title: 'Успешно',
          message: `Изображение ${updatedImage.isActive ? 'активировано' : 'деактивировано'}`,
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        throw new Error('Не удалось обновить статус изображения: сервер вернул пустой ответ');
      }
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

  // Рендер элемента сетки
  const renderImageCard = (image: ImageData) => {
    if (!image) return null;
    
    return (
      <Card key={image._id} shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Box pos="relative">
            <Image
              src={image.url}
              alt={image.alt || image.title || 'Изображение'}
              fit="cover"
              height={200}
            />
            <Box
              pos="absolute"
              top={10}
              right={10}
              style={{ zIndex: 2 }}
            >
              <ActionIcon
                color={image.isActive ? 'green' : 'red'}
                variant="light"
                onClick={() => toggleImageActive(image)}
                title={image.isActive ? 'Деактивировать' : 'Активировать'}
              >
                {image.isActive ? <IconEye size={16} /> : <IconEyeOff size={16} />}
              </ActionIcon>
            </Box>
          </Box>
        </Card.Section>

        <Box mt="md" mb="xs">
          <Text fw={500}>{image.title || 'Без названия'}</Text>
          <Group mt={5}>
            {image.type && (
              <Badge color="blue" variant="light">
                {image.type}
              </Badge>
            )}
            {image.section && (
              <Badge color="teal" variant="light">
                {image.section}
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" mt={5} lineClamp={2}>
            {image.alt || 'Нет описания'}
          </Text>
        </Box>

        <Group mt="md">
          <Button 
            variant="outline" 
            size="xs" 
            onClick={() => openViewModal(image)} 
            leftSection={<IconEye size={14} />}
          >
            Просмотр
          </Button>
          <Button 
            variant="outline" 
            size="xs" 
            onClick={() => openEditModal(image)} 
            leftSection={<IconPencil size={14} />}
          >
            Изменить
          </Button>
          <Button 
            color="red" 
            variant="outline" 
            size="xs" 
            onClick={() => openDeleteModal(image)} 
            leftSection={<IconTrash size={14} />}
          >
            Удалить
          </Button>
        </Group>
      </Card>
    );
  };

  return (
    <Box>
      <Group justify="space-between" mb="md">
        <Title order={2}>Управление изображениями</Title>
        <Button 
          variant="outline" 
          onClick={fetchImagesList} 
          leftSection={<IconRefresh size={14} />}
          loading={loading}
        >
          Обновить
        </Button>
      </Group>

      {/* Основное содержимое */}
      <Paper shadow="xs" p="md" withBorder>
        <LoadingOverlay visible={loading} />

        {error && (
          <Alert color="red" title="Ошибка" withCloseButton={false} mb="md">
            {error}
          </Alert>
        )}

        {!loading && images.length === 0 && !error && (
          <Alert color="blue" title="Информация" withCloseButton={false} mb="md">
            Изображения не найдены. Загрузите первое изображение, используя форму выше.
          </Alert>
        )}

        {!loading && images.length > 0 && (
          <Grid>
            {images.map(image => (
              <Grid.Col key={image._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                {renderImageCard(image)}
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Модальное окно просмотра */}
      <Modal opened={viewModalOpen} onClose={() => setViewModalOpen(false)} size="lg" title="Просмотр изображения">
        {currentImage && (
          <Stack>
            <Image
              src={currentImage.url}
              alt={currentImage.alt || currentImage.title || 'Изображение'}
              fit="contain"
              height={400}
            />
            <Group justify="space-between">
              <Text fw={500}>{currentImage.title || 'Без названия'}</Text>
              <Button 
                variant="outline" 
                size="xs" 
                onClick={() => copyImageUrl(currentImage.url)} 
                leftSection={<IconCopy size={14} />}
              >
                Копировать URL
              </Button>
            </Group>
            <Text size="sm">{currentImage.alt || 'Нет описания'}</Text>
            <Group>
              {currentImage.type && (
                <Badge color="blue" variant="light">
                  Тип: {currentImage.type}
                </Badge>
              )}
              {currentImage.section && (
                <Badge color="teal" variant="light">
                  Раздел: {currentImage.section}
                </Badge>
              )}
              {Array.isArray(currentImage.tags) && currentImage.tags.length > 0 && (
                <Badge color="grape" variant="light">
                  Теги: {currentImage.tags.join(', ')}
                </Badge>
              )}
            </Group>
            <Group>
              <Text size="xs">Размеры: {currentImage.width}x{currentImage.height}</Text>
              <Text size="xs">Формат: {currentImage.format}</Text>
              <Text size="xs">Создано: {new Date(currentImage.createdAt).toLocaleString()}</Text>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Модальное окно редактирования */}
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Редактирование изображения">
        {currentImage && (
          <Stack>
            <Image
              src={currentImage.url}
              alt={currentImage.alt || currentImage.title || 'Изображение'}
              fit="contain"
              height={200}
            />
            
            <TextInput
              label="Заголовок"
              value={editFormData.title || ''}
              onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
            />
            
            <TextInput
              label="Alt текст (для SEO)"
              value={editFormData.alt || ''}
              onChange={(e) => setEditFormData({...editFormData, alt: e.target.value})}
            />
            
            <TextInput
              label="Тип"
              value={editFormData.type || ''}
              onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
            />
            
            <TextInput
              label="Раздел"
              value={editFormData.section || ''}
              onChange={(e) => setEditFormData({...editFormData, section: e.target.value})}
            />
            
            <TextInput
              label="Теги (через запятую)"
              value={Array.isArray(editFormData.tags) ? editFormData.tags.join(', ') : ''}
              onChange={(e) => setEditFormData({
                ...editFormData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
            />
            
            <Switch
              label="Активно"
              checked={editFormData.isActive}
              onChange={(e) => setEditFormData({...editFormData, isActive: e.currentTarget.checked})}
            />
            
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>Отмена</Button>
              <Button onClick={handleUpdateImage} loading={editLoading}>Сохранить</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Модальное окно удаления */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Удаление изображения">
        {currentImage && (
          <Stack>
            <Text>Вы уверены, что хотите удалить изображение "{currentImage.title || 'Без названия'}"?</Text>
            <Text size="sm" c="dimmed">Это действие нельзя отменить.</Text>
            
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Отмена</Button>
              <Button color="red" onClick={handleDeleteImage} loading={deleteLoading}>Удалить</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
};

export default ImagesGallery; 