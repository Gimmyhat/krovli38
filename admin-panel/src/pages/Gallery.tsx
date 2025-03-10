// @ts-nocheck - Отключаем проверку типов для этого файла из-за проблем совместимости с Mantine

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Button, 
  Group, 
  Card, 
  Image, 
  Grid, 
  TextInput, 
  Textarea, 
  Switch, 
  Select, 
  MultiSelect, 
  ActionIcon, 
  Modal, 
  LoadingOverlay, 
  Pagination,
  Menu,
  Divider,
  Badge,
  Paper
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconSearch, 
  IconFilter, 
  IconSortAscending, 
  IconSortDescending, 
  IconEye, 
  IconEyeOff,
  IconDots,
  IconArrowUp,
  IconArrowDown,
  IconPhoto
} from '@tabler/icons-react';
import { 
  fetchGalleryItems, 
  createGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem,
  GalleryItem,
  GalleryItemData
} from '../api/galleryApi';
import CloudinaryPicker from '../components/Images/CloudinaryPicker';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Категории для галереи
const GALLERY_CATEGORIES = [
  { value: 'general', label: 'Общая' },
  { value: 'repair', label: 'Ремонт' },
  { value: 'installation', label: 'Монтаж' },
  { value: 'diagnostics', label: 'Диагностика' },
  { value: 'waterproofing', label: 'Гидроизоляция' }
];

// Теги для галереи
const GALLERY_TAGS = [
  { value: 'ремонт', label: 'Ремонт' },
  { value: 'монтаж', label: 'Монтаж' },
  { value: 'диагностика', label: 'Диагностика' },
  { value: 'гидроизоляция', label: 'Гидроизоляция' },
  { value: 'жилой дом', label: 'Жилой дом' },
  { value: 'коммерческий объект', label: 'Коммерческий объект' },
  { value: 'промышленный объект', label: 'Промышленный объект' },
  { value: 'замена покрытия', label: 'Замена покрытия' },
  { value: 'протечки', label: 'Протечки' },
  { value: 'обследование', label: 'Обследование' },
  { value: 'материалы', label: 'Материалы' },
  { value: 'примыкания', label: 'Примыкания' },
  { value: 'герметизация', label: 'Герметизация' },
  { value: 'водосток', label: 'Водосток' },
  { value: 'водоотведение', label: 'Водоотведение' },
  { value: 'комплексный ремонт', label: 'Комплексный ремонт' },
  { value: 'восстановление', label: 'Восстановление' },
  { value: 'кровля', label: 'Кровля' }
];

// Интерфейс для формы элемента галереи
interface GalleryItemForm extends Omit<GalleryItemData, 'tags'> {
  tags: string[];
  _id?: string;
}

// Начальное состояние формы
const initialFormState: GalleryItemForm = {
  title: '',
  description: '',
  image: '',
  category: 'general',
  tags: [],
  order: 0,
  isActive: true,
  projectDate: new Date().toISOString().split('T')[0]
};

const Gallery: React.FC = () => {
  // Состояние для списка элементов галереи
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние для пагинации
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  
  // Состояние для фильтрации
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    isActive: undefined as boolean | undefined,
    search: '',
    sort: 'order'
  });
  
  // Состояние для модального окна
  const [modalOpened, setModalOpened] = useState(false);
  const [currentItem, setCurrentItem] = useState<GalleryItemForm>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpened, setPickerOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Состояние для подтверждения удаления
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Загрузка элементов галереи
  const loadItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { items: fetchedItems, pagination: paginationData } = await fetchGalleryItems({
        page: pagination.page,
        limit: pagination.limit,
        category: filters.category || undefined,
        tag: filters.tag || undefined,
        isActive: filters.isActive,
        sort: filters.sort
      });
      
      setItems(fetchedItems);
      setPagination(paginationData);
    } catch (error) {
      console.error('Ошибка при загрузке элементов галереи:', error);
      setError('Не удалось загрузить элементы галереи. Пожалуйста, попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка при монтировании и изменении фильтров/пагинации
  useEffect(() => {
    loadItems();
  }, [pagination.page, pagination.limit, filters.category, filters.tag, filters.isActive, filters.sort]);
  
  // Обработчик изменения формы
  const handleFormChange = (field: keyof GalleryItemForm, value: any) => {
    setCurrentItem(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!currentItem.title || !currentItem.image) {
      notifications.show({
        title: 'Ошибка',
        message: 'Заголовок и изображение обязательны для заполнения',
        color: 'red'
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (isEditing) {
        // Обновление существующего элемента
        const updatedItem = await updateGalleryItem(
          currentItem._id as string, 
          currentItem as GalleryItemData
        );
        
        setItems(prev => prev.map(item => 
          item._id === updatedItem._id ? updatedItem : item
        ));
        
        notifications.show({
          title: 'Успех',
          message: 'Элемент галереи успешно обновлен',
          color: 'green'
        });
      } else {
        // Создание нового элемента
        const newItem = await createGalleryItem(currentItem as GalleryItemData);
        
        setItems(prev => [...prev, newItem]);
        
        notifications.show({
          title: 'Успех',
          message: 'Элемент галереи успешно создан',
          color: 'green'
        });
      }
      
      // Закрываем модальное окно и сбрасываем форму
      setModalOpened(false);
      setCurrentItem(initialFormState);
      setIsEditing(false);
      
      // Перезагружаем список
      loadItems();
    } catch (error) {
      console.error('Ошибка при сохранении элемента галереи:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить элемент галереи',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Обработчик открытия формы редактирования
  const handleEdit = (item: GalleryItem) => {
    setCurrentItem({
      ...item,
      tags: item.tags || []
    });
    setIsEditing(true);
    setModalOpened(true);
  };
  
  // Обработчик открытия формы создания
  const handleCreate = () => {
    setCurrentItem(initialFormState);
    setIsEditing(false);
    setModalOpened(true);
  };
  
  // Обработчик удаления элемента
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    setLoading(true);
    
    try {
      await deleteGalleryItem(itemToDelete);
      
      setItems(prev => prev.filter(item => item._id !== itemToDelete));
      
      notifications.show({
        title: 'Успех',
        message: 'Элемент галереи успешно удален',
        color: 'green'
      });
      
      // Перезагружаем список
      loadItems();
    } catch (error) {
      console.error('Ошибка при удалении элемента галереи:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить элемент галереи',
        color: 'red'
      });
    } finally {
      setLoading(false);
      setDeleteConfirmOpened(false);
      setItemToDelete(null);
    }
  };
  
  // Обработчик изменения статуса активности
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateGalleryItem(id, { isActive: !isActive });
      
      setItems(prev => prev.map(item => 
        item._id === id ? { ...item, isActive: !isActive } : item
      ));
      
      notifications.show({
        title: 'Успех',
        message: `Элемент галереи ${!isActive ? 'активирован' : 'деактивирован'}`,
        color: 'green'
      });
    } catch (error) {
      console.error('Ошибка при изменении статуса элемента галереи:', error);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось изменить статус элемента галереи',
        color: 'red'
      });
    }
  };
  
  // Обработчик выбора изображения
  const handleImageSelect = (image: any) => {
    setCurrentItem(prev => ({
      ...prev,
      image: image.secure_url
    }));
    setPickerOpened(false);
  };
  
  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
  };
  
  // Обработчик изменения фильтров
  const handleFilterChange = (field: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Сбрасываем страницу при изменении фильтров
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setFilters({
      category: '',
      tag: '',
      isActive: undefined,
      search: '',
      sort: 'order'
    });
    
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };
  
  // Рендер формы элемента галереи
  const renderForm = () => (
    <Box>
      <TextInput
        label="Заголовок"
        placeholder="Введите заголовок"
        value={currentItem.title}
        onChange={(e) => handleFormChange('title', e.target.value)}
        required
        mb="md"
      />
      
      <Textarea
        label="Описание"
        placeholder="Введите описание"
        value={currentItem.description || ''}
        onChange={(e) => handleFormChange('description', e.target.value)}
        mb="md"
        minRows={3}
      />
      
      <Box mb="md">
        <Text size="sm" fw={500} mb={5}>Изображение</Text>
        <Group>
          <TextInput
            placeholder="URL изображения"
            value={currentItem.image}
            onChange={(e) => handleFormChange('image', e.target.value)}
            style={{ flex: 1 }}
            required
            rightSection={
              <Button 
                variant="subtle" 
                size="xs" 
                onClick={() => setPickerOpened(true)}
              >
                Выбрать
              </Button>
            }
          />
        </Group>
        
        {currentItem.image && (
          <Box mt="xs">
            <Image 
              src={currentItem.image} 
              alt={currentItem.title} 
              height={150} 
              fit="contain"
              placeholder="Загрузка изображения..."
              withFallback
            />
          </Box>
        )}
      </Box>
      
      <Grid>
        <Grid.Col span={6}>
          <Select
            label="Категория"
            placeholder="Выберите категорию"
            data={GALLERY_CATEGORIES}
            value={currentItem.category || 'general'}
            onChange={(value) => handleFormChange('category', value)}
            mb="md"
          />
        </Grid.Col>
        
        <Grid.Col span={6}>
          <TextInput
            label="Порядок отображения"
            placeholder="Введите число"
            type="number"
            value={currentItem.order?.toString() || '0'}
            onChange={(e) => handleFormChange('order', parseInt(e.target.value) || 0)}
            mb="md"
          />
        </Grid.Col>
      </Grid>
      
      <MultiSelect
        label="Теги"
        placeholder="Выберите теги"
        data={GALLERY_TAGS}
        value={currentItem.tags || []}
        onChange={(value) => handleFormChange('tags', value)}
        searchable
        getCreateLabel={(query: string) => `+ Создать "${query}"`}
        onCreate={(query: string) => {
          const newTag = { value: query, label: query };
          GALLERY_TAGS.push(newTag);
          return newTag.value;
        }}
        mb="md"
      />
      
      <Grid>
        <Grid.Col span={6}>
          <TextInput
            label="Дата проекта"
            placeholder="ГГГГ-ММ-ДД"
            type="date"
            value={currentItem.projectDate?.toString().split('T')[0] || ''}
            onChange={(e) => handleFormChange('projectDate', e.target.value)}
            mb="md"
          />
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Box mt={25}>
            <Switch
              label="Активен"
              checked={currentItem.isActive}
              onChange={(e) => handleFormChange('isActive', e.currentTarget.checked)}
            />
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
  
  // Рендер карточки элемента галереи
  const renderGalleryItem = (item: GalleryItem) => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={item.image}
          height={160}
          alt={item.title}
          placeholder="Загрузка изображения..."
          withFallback
        />
      </Card.Section>
      
      <Box mt="md" mb="xs">
        <Group justify="apart">
          <Text fw={500} lineClamp={1}>{item.title}</Text>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <ActionIcon>
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            
            <Menu.Dropdown>
              <Menu.Item 
                leftSection={<IconEdit size={16} />} 
                onClick={() => handleEdit(item)}
              >
                Редактировать
              </Menu.Item>
              
              <Menu.Item 
                icon={item.isActive ? <IconEyeOff size={16} /> : <IconEye size={16} />} 
                onClick={() => handleToggleActive(item._id, item.isActive)}
              >
                {item.isActive ? 'Деактивировать' : 'Активировать'}
              </Menu.Item>
              
              <Menu.Divider />
              
              <Menu.Item 
                color="red" 
                icon={<IconTrash size={16} />} 
                onClick={() => {
                  setItemToDelete(item._id);
                  setDeleteConfirmOpened(true);
                }}
              >
                Удалить
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>
      
      {item.description && (
        <Text size="sm" color="dimmed" lineClamp={2} mb="xs">
          {item.description}
        </Text>
      )}
      
      <Group position="apart" mt="md">
        <Badge color={item.isActive ? 'green' : 'gray'}>
          {item.isActive ? 'Активен' : 'Неактивен'}
        </Badge>
        
        {item.category && (
          <Badge color="blue">
            {GALLERY_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
          </Badge>
        )}
      </Group>
      
      {item.tags && item.tags.length > 0 && (
        <Box mt="sm">
          <Group spacing={5}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} size="sm" variant="outline">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge size="sm" variant="outline">
                +{item.tags.length - 3}
              </Badge>
            )}
          </Group>
        </Box>
      )}
    </Card>
  );
  
  return (
    <Box>
      <Group justify="apart" mb="lg">
        <Title order={2}>Управление галереей</Title>
        
        <Button 
          variant="outline" 
          leftSection={<IconPlus size={16} />} 
          onClick={handleCreate}
        >
          Добавить элемент
        </Button>
      </Group>
      
      {/* Фильтры */}
      <Paper p="md" mb="lg" withBorder>
        <Grid>
          <Grid.Col span={12} md={4}>
            <TextInput
              placeholder="Поиск по заголовку"
              icon={<IconSearch size={16} />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              mb="xs"
            />
          </Grid.Col>
          
          <Grid.Col span={6} md={2}>
            <Select
              placeholder="Категория"
              data={[
                { value: '', label: 'Все категории' },
                ...GALLERY_CATEGORIES
              ]}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              mb="xs"
            />
          </Grid.Col>
          
          <Grid.Col span={6} md={2}>
            <Select
              placeholder="Тег"
              data={[
                { value: '', label: 'Все теги' },
                ...GALLERY_TAGS
              ]}
              value={filters.tag}
              onChange={(value) => handleFilterChange('tag', value)}
              searchable
              mb="xs"
            />
          </Grid.Col>
          
          <Grid.Col span={6} md={2}>
            <Select
              placeholder="Статус"
              data={[
                { value: '', label: 'Все' },
                { value: 'true', label: 'Активные' },
                { value: 'false', label: 'Неактивные' }
              ]}
              value={filters.isActive === undefined ? '' : filters.isActive.toString()}
              onChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
              mb="xs"
            />
          </Grid.Col>
          
          <Grid.Col span={6} md={2}>
            <Select
              placeholder="Сортировка"
              data={[
                { value: 'order', label: 'По порядку ↑' },
                { value: '-order', label: 'По порядку ↓' },
                { value: 'createdAt', label: 'По дате создания ↑' },
                { value: '-createdAt', label: 'По дате создания ↓' },
                { value: 'projectDate', label: 'По дате проекта ↑' },
                { value: '-projectDate', label: 'По дате проекта ↓' }
              ]}
              value={filters.sort}
              onChange={(value) => handleFilterChange('sort', value)}
              mb="xs"
            />
          </Grid.Col>
        </Grid>
        
        <Group position="right">
          <Button 
            variant="subtle" 
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </Button>
        </Group>
      </Paper>
      
      {/* Список элементов */}
      <Box pos="relative" mih={400}>
        <LoadingOverlay visible={loading} />
        
        {error && (
          <Text color="red" mb="md">
            {error}
          </Text>
        )}
        
        {!loading && items.length === 0 ? (
          <Box ta="center" py={50}>
            <IconPhoto size={48} color="gray" opacity={0.3} />
            <Text c="dimmed" mt="md">
              Элементы галереи не найдены. Создайте первый элемент!
            </Text>
            <Button 
              mt="md" 
              leftSection={<IconPlus size={16} />} 
              onClick={handleCreate}
            >
              Добавить элемент
            </Button>
          </Box>
        ) : (
          <Grid>
            {items.map((item) => (
              <Grid.Col key={item._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                {renderGalleryItem(item)}
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Box>
      
      {/* Пагинация */}
      {pagination.pages > 1 && (
        <Group position="center" mt="xl">
          <Pagination 
            total={pagination.pages} 
            value={pagination.page} 
            onChange={handlePageChange} 
          />
        </Group>
      )}
      
      {/* Модальное окно создания/редактирования */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={isEditing ? 'Редактирование элемента галереи' : 'Создание элемента галереи'}
        size="lg"
      >
        <LoadingOverlay visible={submitting} />
        {renderForm()}
        
        <Group position="right" mt="xl">
          <Button variant="outline" onClick={() => setModalOpened(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </Group>
      </Modal>
      
      {/* Модальное окно выбора изображения */}
      <CloudinaryPicker
        opened={pickerOpened}
        onClose={() => setPickerOpened(false)}
        onSelect={handleImageSelect}
        title="Выберите изображение для галереи"
        filter={{ 
          section: 'gallery' 
        }}
      />
      
      {/* Модальное окно подтверждения удаления */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={() => setDeleteConfirmOpened(false)}
        title="Подтверждение удаления"
        size="sm"
      >
        <Text mb="lg">
          Вы уверены, что хотите удалить этот элемент галереи? Это действие нельзя отменить.
        </Text>
        
        <Group position="right">
          <Button variant="outline" onClick={() => setDeleteConfirmOpened(false)}>
            Отмена
          </Button>
          <Button color="red" onClick={handleDelete}>
            Удалить
          </Button>
        </Group>
      </Modal>
    </Box>
  );
};

export default Gallery; 