import React, { useState } from 'react';
import {
  Box, Group, Text, Paper, Image, Modal, Stack, 
  Button, Badge, ActionIcon, Menu, TextInput, Loader, SimpleGrid} from '@mantine/core';
import { IconPhoto, IconEdit, IconTrash, IconCopy, IconDotsVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mediaService, MediaMetadata } from '../../services/mediaService';

interface MediaGalleryProps {
  images?: MediaMetadata[];
  onRefresh: () => void;
  loading?: boolean;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ 
  images = [], 
  onRefresh,
  loading = false 
}) => {
  // Состояние для модальных окон редактирования и удаления
  const [selectedImage, setSelectedImage] = useState<MediaMetadata | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    alt: '',
    type: '',
    section: '',
    tags: [] as string[]
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Обработчик изменения поля в форме редактирования
  const handleEditFormChange = (field: string, value: any) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };
  
  // Обработчик сохранения изменений
  const handleSaveEdit = async () => {
    if (!selectedImage) return;
    
    setIsUpdating(true);
    
    try {
      await mediaService.updateImage(selectedImage.id, {
        title: editForm.title,
        alt: editForm.alt,
        type: editForm.type || undefined,
        section: editForm.section || undefined,
        tags: editForm.tags.length > 0 ? editForm.tags : undefined
      });
      
      notifications.show({
        title: 'Успешно',
        message: 'Информация об изображении обновлена',
        color: 'green'
      });
      
      // Обновляем список изображений
      onRefresh();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Ошибка при обновлении изображения:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить информацию об изображении',
        color: 'red'
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Обработчик удаления изображения
  const handleDelete = async () => {
    if (!selectedImage) return;
    
    setIsDeleting(true);
    
    try {
      await mediaService.deleteImage(selectedImage.id);
      
      notifications.show({
        title: 'Успешно',
        message: 'Изображение успешно удалено',
        color: 'green'
      });
      
      // Обновляем список изображений
      onRefresh();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить изображение',
        color: 'red'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Копирование URL изображения в буфер обмена
  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      notifications.show({
        title: 'Скопировано',
        message: 'URL изображения скопирован в буфер обмена',
        color: 'blue'
      });
    });
  };
  
  // Отображение пустой галереи
  if (!loading && images.length === 0) {
    return (
      <Box style={{ textAlign: 'center', padding: '40px 0' }}>
        <IconPhoto size={48} style={{ opacity: 0.3, marginBottom: 20 }} />
        <Text size="lg" fw={500} color="dimmed">
          Нет доступных изображений
        </Text>
        <Text size="sm" color="dimmed" mb={20}>
          Загрузите изображения, чтобы они отобразились здесь
        </Text>
        <Button onClick={onRefresh}>Обновить</Button>
      </Box>
    );
  }
  
  return (
    <div>
      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
          <Loader size="lg" />
        </Box>
      ) : (
        <SimpleGrid cols={4}>
          {images.map((image) => (
            <Paper key={image.id} p="xs" withBorder>
              <Box style={{ position: 'relative' }}>
                <Image
                  src={image.urls?.thumbnail || `/uploads/${image.thumbnailName}`}
                  height={160}
                  alt={image.alt || image.originalName}
                  style={{ 
                    position: 'relative',
                    '&:hover .media-image-overlay': {
                      opacity: 1,
                    }
                  }}
                />
                
                <Box 
                  className="media-image-overlay"
                  style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    background: 'rgba(0,0,0,0.5)', 
                    opacity: 0, 
                    transition: 'opacity 0.2s', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}
                >
                  <Button 
                    variant="white" 
                    size="compact"
                    onClick={() => window.open(image.urls?.original || `/uploads/${image.fileName}`, '_blank')}
                  >
                    Просмотр
                  </Button>
                </Box>
              </Box>
              
              <Box mt="sm" mb="xs">
                <Group justify="space-between" align="flex-start">
                  <Text fw={500} size="sm" lineClamp={1}>
                    {image.title || image.originalName}
                  </Text>
                  <Menu shadow="md" position="bottom-end">
                    <Menu.Target>
                      <ActionIcon>
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    
                    <Menu.Dropdown>
                      <Menu.Item 
                        leftSection={<IconEdit size={14} />} 
                        onClick={() => {
                          setSelectedImage(image);
                          setEditModalOpen(true);
                          setEditForm({
                            title: image.title || '',
                            alt: image.alt || '',
                            type: image.type || '',
                            section: image.section || '',
                            tags: image.tags || []
                          });
                        }}
                      >
                        Редактировать
                      </Menu.Item>
                      <Menu.Item 
                        leftSection={<IconCopy size={14} />} 
                        onClick={() => copyImageUrl(image.urls?.original || `/uploads/${image.fileName}`)}
                      >
                        Копировать URL
                      </Menu.Item>
                      <Menu.Item 
                        color="red" 
                        leftSection={<IconTrash size={14} />} 
                        onClick={() => {
                          setSelectedImage(image);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Удалить
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                
                <Text size="sm" color="dimmed">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </Text>
              </Box>
              
              {image.tags && image.tags.length > 0 && (
                <Group gap={4} mt="xs">
                  {image.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} size="sm">{tag}</Badge>
                  ))}
                  {image.tags.length > 3 && (
                    <Badge size="sm">+{image.tags.length - 3}</Badge>
                  )}
                </Group>
              )}
            </Paper>
          ))}
        </SimpleGrid>
      )}
      
      {/* Модальное окно редактирования */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Редактирование изображения"
        size="md"
      >
        {selectedImage && (
          <Stack gap="md">
            <Image
              src={selectedImage.urls?.thumbnail || `/uploads/${selectedImage.thumbnailName}`}
              height={200}
              fit="contain"
              mb="sm"
              style={{ borderRadius: '4px' }}
              mx="auto"
            />
            
            <TextInput
              label="Название"
              value={editForm.title}
              onChange={(e) => handleEditFormChange('title', e.currentTarget.value)}
              placeholder="Введите название изображения"
            />
            
            <TextInput
              label="Alt текст"
              value={editForm.alt}
              onChange={(e) => handleEditFormChange('alt', e.currentTarget.value)}
              placeholder="Текст для случаев, когда изображение не загружается"
            />
            
            <TextInput
              label="Тип"
              value={editForm.type}
              onChange={(e) => handleEditFormChange('type', e.currentTarget.value)}
              placeholder="Например: баннер, фон, галерея"
            />
            
            <TextInput
              label="Раздел сайта"
              value={editForm.section}
              onChange={(e) => handleEditFormChange('section', e.currentTarget.value)}
              placeholder="Например: главная, контакты, услуги"
            />
            
            <TextInput
              label="Теги (через запятую)"
              value={editForm.tags.join(', ')}
              onChange={(e) => handleEditFormChange('tags', e.currentTarget.value.split(',').map(tag => tag.trim()).filter(Boolean))}
              placeholder="Например: новое, акция, популярное"
            />
            
            <Group justify="right" mt="md">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveEdit} loading={isUpdating}>
                Сохранить
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
      
      {/* Модальное окно подтверждения удаления */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Удаление изображения"
        size="sm"
      >
        <Text>
          Вы действительно хотите удалить изображение "{selectedImage?.title || selectedImage?.originalName}"?
          Это действие невозможно отменить.
        </Text>
        
        <Group justify="right" mt="lg">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Отмена
          </Button>
          <Button color="red" onClick={handleDelete} loading={isDeleting}>
            Удалить
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

export default MediaGallery; 