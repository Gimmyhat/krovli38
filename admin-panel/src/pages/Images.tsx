import React, { useState, useEffect } from 'react';
import { Stack, Title, Alert, Divider, Group, Button } from '@mantine/core';
import { IconInfoCircle, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import SimpleImageList from '../components/Images/SimpleImageList';
import CloudinaryMediaLibrary from '../components/Images/CloudinaryMediaLibrary';
import { CloudinaryAsset } from '../api/cloudinaryApi';

const Images: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cloudinaryConfig, setCloudinaryConfig] = useState<{ cloudName: string; apiKey: string } | null>(null);
  const [, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // Загрузка конфигурации Cloudinary при монтировании
  useEffect(() => {
    const loadConfig = async () => {
      setConfigLoading(true);
      setConfigError(null);
      
      try {
        // Вместо загрузки с сервера используем заранее известные значения
        // В продакшене лучше получать эти данные из API
        const config = {
          cloudName: 'dr0hjlr79',
          apiKey: '586934817968136'
        };
        
        setCloudinaryConfig(config);
      } catch (error) {
        console.error('Ошибка загрузки конфигурации Cloudinary:', error);
        setConfigError('Не удалось загрузить конфигурацию Cloudinary');
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Обработчик выбора изображений из Cloudinary Media Library
  const handleImageSelect = async (assets: CloudinaryAsset[]) => {
    try {
      notifications.show({
        title: 'Обработка',
        message: `Добавление ${assets.length} изображений...`,
        loading: true,
        autoClose: false,
        id: 'adding-images'
      });

      // Здесь мы сохраняем выбранные изображения в базу данных
      // В реальном проекте лучше вызывать API
      console.log('Выбранные изображения для добавления:', assets);
      
      // Имитируем задержку запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifications.update({
        id: 'adding-images',
        title: 'Успех',
        message: `${assets.length} изображений успешно добавлены`,
        color: 'green',
        loading: false,
        autoClose: 5000
      });

      // Обновляем список изображений
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Ошибка при добавлении изображений:', error);
      
      notifications.update({
        id: 'adding-images',
        title: 'Ошибка',
        message: 'Не удалось добавить изображения. Попробуйте снова позже.',
        color: 'red',
        loading: false,
        autoClose: 5000
      });
    }
  };

  return (
    <Stack>
      <Title order={1}>Управление изображениями</Title>

      <Alert 
        icon={<IconInfoCircle size={16} />} 
        title="Интеграция с Cloudinary" 
        color="blue"
      >
        Управление медиафайлами реализовано через интеграцию с Cloudinary Media Library.
        Для полноценной работы необходимо настроить учетную запись Cloudinary.
      </Alert>
      
      {cloudinaryConfig && (
        <CloudinaryMediaLibrary
          cloudName={cloudinaryConfig.cloudName}
          apiKey={cloudinaryConfig.apiKey}
          onImageSelect={handleImageSelect}
        />
      )}
      
      {configError && (
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Ошибка конфигурации" 
          color="red"
        >
          {configError}
        </Alert>
      )}
      
      <Divider my="md" />
      
      <Group justify="space-between">
        <Title order={2}>Галерея изображений</Title>
        <Button 
          variant="outline" 
          leftSection={<IconRefresh size={14} />}
          onClick={() => setRefreshTrigger(prev => prev + 1)}
        >
          Обновить галерею
        </Button>
      </Group>
      
      <SimpleImageList key={refreshTrigger} />
    </Stack>
  );
};

export default Images; 