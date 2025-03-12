import React, { useState } from 'react';
import { 
  Container, Title, Text, Paper, Grid, 
  Divider, Button, Group, Code, Space
} from '@mantine/core';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import MediaSelector from '../components/Media/MediaSelector';
import { MediaMetadata } from '../services/mediaService';

const TestSelectorPage: React.FC = () => {
  const [banner, setBanner] = useState<MediaMetadata | null>(null);
  const [logo, setLogo] = useState<MediaMetadata | null>(null);
  const [gallery, setGallery] = useState<MediaMetadata[]>([]);
  
  // Добавление изображения в галерею
  const addToGallery = (image: MediaMetadata | null) => {
    if (image) {
      setGallery([...gallery, image]);
    }
  };
  
  // Удаление изображения из галереи
  const removeFromGallery = (index: number) => {
    setGallery(gallery.filter((_, i) => i !== index));
  };
  
  // Сброс всех полей
  const handleReset = () => {
    setBanner(null);
    setLogo(null);
    setGallery([]);
  };
  
  return (
    <Container size="lg" py="md">
      <Title order={1} mb="sm">Тест компонентов выбора изображений</Title>
      <Text color="dimmed" mb="xl">
        Эта страница демонстрирует использование компонента выбора изображений в различных формах
      </Text>
      
      <Paper shadow="xs" p="md" withBorder>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid gutter="md">
            <Grid.Col span={12}>
              <Title order={3} mb="xs">Основные настройки сайта</Title>
              <Text color="dimmed" size="sm" mb="md">
                Выберите изображения для главной страницы
              </Text>
            </Grid.Col>
            
            <Grid.Col span={6}>
              <MediaSelector
                label="Баннер главной страницы"
                value={banner || undefined}
                onChange={setBanner}
                required
                height={250}
                placeholder="Рекомендуемый размер: 1920x600"
              />
            </Grid.Col>
            
            <Grid.Col span={6}>
              <MediaSelector
                label="Логотип"
                value={logo || undefined}
                onChange={setLogo}
                height={250}
                placeholder="Рекомендуемый размер: 200x80"
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Divider my="md" label="Галерея изображений" labelPosition="center" />
            </Grid.Col>
            
            {gallery.map((image, index) => (
              <Grid.Col span={4} key={index}>
                <MediaSelector
                  label={`Изображение #${index + 1}`}
                  value={image}
                  onChange={(img) => img ? setGallery(gallery.map((g, i) => i === index ? img : g)) : removeFromGallery(index)}
                  height={180}
                />
              </Grid.Col>
            ))}
            
            <Grid.Col span={4}>
              <MediaSelector
                label="Добавить изображение"
                value={undefined}
                onChange={addToGallery}
                height={180}
                placeholder="Нажмите, чтобы добавить"
              />
            </Grid.Col>
            
            <Grid.Col span={12}>
              <Divider my="md" />
              
              <Group justify="space-between">
                <Button variant="light" leftSection={<IconRefresh size={18} />} onClick={handleReset}>
                  Сбросить
                </Button>
                <Button leftSection={<IconDeviceFloppy size={18} />} type="submit">
                  Сохранить
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
      
      <Space h="xl" />
      
      <Paper shadow="xs" p="md" withBorder>
        <Title order={3} mb="md">Данные формы</Title>
        
        <Text fw={500} mb="xs">Баннер:</Text>
        <Code block>{banner ? JSON.stringify(banner, null, 2) : 'null'}</Code>
        
        <Text fw={500} mt="md" mb="xs">Логотип:</Text>
        <Code block>{logo ? JSON.stringify(logo, null, 2) : 'null'}</Code>
        
        <Text fw={500} mt="md" mb="xs">Галерея ({gallery.length}):</Text>
        <Code block>{JSON.stringify(gallery, null, 2)}</Code>
      </Paper>
    </Container>
  );
};

export default TestSelectorPage; 