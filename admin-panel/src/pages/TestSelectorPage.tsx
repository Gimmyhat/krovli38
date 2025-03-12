import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Box, 
  Button, 
  Grid, 
  Group,
  Paper,
  Code,
  Divider
} from '@mantine/core';
import MediaUploader from '../components/Media/MediaUploader';
import { IconCloudUpload } from '@tabler/icons-react';

const TestSelectorPage: React.FC = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const handleUploadSuccess = () => {
    console.log('Загрузка завершена успешно');
  };

  return (
    <Container size="xl">
      <Title order={1} mb="md">Тестовая страница загрузки изображений</Title>
      <Text mb="xl">Эта страница предназначена для тестирования загрузки изображений через новую систему с локальным хранилищем.</Text>
      
      <Paper p="md" withBorder mb="xl">
        <Title order={2} mb="md">Загрузка изображений</Title>
        
        <Grid>
          <Grid.Col span={12}>
            <Button 
              leftSection={<IconCloudUpload size={16} />}
              onClick={() => setUploadModalOpen(true)}
              mb="md"
            >
              Открыть загрузчик изображений
            </Button>
          </Grid.Col>
          
          <Grid.Col span={12}>
            <Divider my="md" />
            <Text fw={500} mb="md">Инструкция:</Text>
            <Text mb="sm">1. Нажмите на кнопку "Открыть загрузчик изображений"</Text>
            <Text mb="sm">2. Выберите изображения для загрузки, заполните метаданные</Text>
            <Text mb="sm">3. Нажмите "Загрузить"</Text>
            <Text mb="sm">4. После успешной загрузки изображения будут доступны в медиа-библиотеке</Text>
          </Grid.Col>
        </Grid>
      </Paper>
      
      <MediaUploader
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        title="Тестовая загрузка изображений"
        multiple={true}
        maxFiles={10}
      />
    </Container>
  );
};

export default TestSelectorPage; 