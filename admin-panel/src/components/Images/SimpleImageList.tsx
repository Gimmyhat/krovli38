import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Card, 
  Image, 
  Button, 
  Group, 
  Alert,
  LoadingOverlay,
  Title,
  Paper
} from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { fetchImages, ImageData } from '../../api/imageApi';

/**
 * Максимально упрощенный компонент для отображения списка изображений
 */
const SimpleImageList: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка изображений при монтировании
  useEffect(() => {
    loadImages();
  }, []);

  // Функция загрузки изображений
  const loadImages = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Загрузка изображений...');
      const data = await fetchImages();
      console.log('Получены данные:', data);
      
      if (Array.isArray(data)) {
        setImages(data);
        console.log(`Загружено ${data.length} изображений`);
      } else {
        console.warn('API вернул неожиданный формат данных:', data);
        setImages([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки изображений:', err);
      setError('Не удалось загрузить изображения. Пожалуйста, попробуйте позже.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Рендер карточки изображения
  const renderImageCard = (image: ImageData) => {
    if (!image || !image.url) {
      return (
        <Card key={`empty-${Math.random()}`} shadow="sm" p="md">
          <Text>Недействительное изображение</Text>
        </Card>
      );
    }

    return (
      <Card key={image._id} shadow="sm" p="md">
        <Card.Section>
          <Image
            src={image.url}
            height={160}
            alt={image.alt || 'Изображение'}
          />
        </Card.Section>

        <Text fw={500} mt="md">
          {image.title || 'Без названия'}
        </Text>
        
        <Text size="sm" color="dimmed">
          {image.alt || 'Нет описания'}
        </Text>
      </Card>
    );
  };

  return (
    <Box p="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Галерея изображений</Title>
        <Button 
          variant="outline" 
          leftSection={<IconRefresh size={14} />}
          onClick={loadImages}
          loading={loading}
        >
          Обновить
        </Button>
      </Group>

      <Paper withBorder p="md" pos="relative">
        <LoadingOverlay visible={loading} />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mb="md">
            {error}
          </Alert>
        )}

        {!loading && images.length === 0 && !error && (
          <Alert title="Информация" color="blue">
            Изображения не найдены. Загрузите первое изображение с помощью формы выше.
          </Alert>
        )}

        {!loading && images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {images.map(image => renderImageCard(image))}
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default SimpleImageList; 