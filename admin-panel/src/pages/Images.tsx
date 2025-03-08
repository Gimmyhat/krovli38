import React, { useState } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Tabs, 
  Container, 
  Paper, 
  Divider 
} from '@mantine/core';
import { IconUpload, IconPhoto } from '@tabler/icons-react';
import ImageUploader from '../components/Images/ImageUploader';
import ImagesGallery from '../components/Images/ImagesGallery';

const Images: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('gallery');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleUploadSuccess = () => {
    // Переключаемся на галерею после успешной загрузки
    setActiveTab('gallery');
    // Обновляем галерею
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <Container size="xl" py="md">
      <Box mb="lg">
        <Title order={2} mb="sm">Управление изображениями</Title>
        <Text color="dimmed">
          Загружайте, просматривайте и управляйте изображениями для вашего сайта
        </Text>
      </Box>
      
      <Paper shadow="xs" p="md" withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="gallery" leftSection={<IconPhoto size={16} />}>
              Галерея
            </Tabs.Tab>
            <Tabs.Tab value="upload-single" leftSection={<IconUpload size={16} />}>
              Загрузить изображение
            </Tabs.Tab>
            <Tabs.Tab value="upload-multiple" leftSection={<IconUpload size={16} />}>
              Загрузить несколько
            </Tabs.Tab>
          </Tabs.List>
          
          <Divider my="sm" />
          
          <Tabs.Panel value="gallery" pt="xs">
            <ImagesGallery refreshTrigger={refreshTrigger} />
          </Tabs.Panel>
          
          <Tabs.Panel value="upload-single" pt="xs">
            <Box px="xs">
              <Title order={4} mb="md">Загрузка изображения</Title>
              <ImageUploader 
                onUploadSuccess={handleUploadSuccess} 
                multipleMode={false} 
              />
            </Box>
          </Tabs.Panel>
          
          <Tabs.Panel value="upload-multiple" pt="xs">
            <Box px="xs">
              <Title order={4} mb="md">Загрузка нескольких изображений</Title>
              <ImageUploader 
                onUploadSuccess={handleUploadSuccess} 
                multipleMode={true} 
              />
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default Images; 