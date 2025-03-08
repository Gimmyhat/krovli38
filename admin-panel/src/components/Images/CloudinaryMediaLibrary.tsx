import React, { useEffect, useState } from 'react';
import { Button, Text, Alert, Paper, Title, Group } from '@mantine/core';
import { IconCloudUpload, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Типы для Cloudinary Media Library
declare global {
  interface Window {
    cloudinary: any;
    mlInstances: any[];
  }
}

interface CloudinaryMediaLibraryProps {
  cloudName: string;
  apiKey: string;
  onImageSelect?: (assets: any[]) => void;
  buttonLabel?: string;
}

/**
 * Компонент для интеграции с Cloudinary Media Library
 */
const CloudinaryMediaLibrary: React.FC<CloudinaryMediaLibraryProps> = ({
  cloudName,
  apiKey,
  onImageSelect,
  buttonLabel = 'Открыть медиа-библиотеку'
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка скрипта Cloudinary Media Library
  useEffect(() => {
    // Если скрипт уже загружен, не загружаем его повторно
    if (document.getElementById('cloudinary-media-library-script')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'cloudinary-media-library-script';
    script.src = 'https://media-library.cloudinary.com/global/all.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Cloudinary Media Library скрипт загружен');
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Ошибка загрузки скрипта Cloudinary Media Library');
      setError('Не удалось загрузить скрипт Cloudinary Media Library');
    };
    
    document.body.appendChild(script);
    
    // Очистка при размонтировании компонента
    return () => {
      if (window.mlInstances && window.mlInstances.length > 0) {
        window.mlInstances.forEach(instance => {
          try {
            instance.destroy();
          } catch (e) {
            console.error('Ошибка при уничтожении экземпляра Media Library:', e);
          }
        });
      }
    };
  }, []);

  // Открытие медиа-библиотеки
  const openMediaLibrary = () => {
    if (!isScriptLoaded) {
      notifications.show({
        title: 'Ошибка',
        message: 'Библиотека Cloudinary еще не загрузилась. Пожалуйста, подождите.',
        color: 'red'
      });
      return;
    }

    if (!window.cloudinary) {
      setError('Cloudinary Media Library не инициализирована');
      return;
    }

    // Инициализация и открытие Media Library
    const mediaLibrary = window.cloudinary.createMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: apiKey,
        multiple: true,
        max_files: 10,
        insert_caption: 'Выбрать изображения',
        default_transformations: [
          [{ quality: 'auto', fetch_format: 'auto' }]
        ],
      },
      {
        insertHandler: (data: { assets: any[] }) => {
          console.log('Выбранные изображения:', data.assets);
          if (onImageSelect && data.assets.length > 0) {
            onImageSelect(data.assets);
          }
        }
      }
    );

    // Сохраняем экземпляр для последующего уничтожения
    if (!window.mlInstances) {
      window.mlInstances = [];
    }
    window.mlInstances.push(mediaLibrary);

    // Открываем медиа-библиотеку
    mediaLibrary.show();
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={3} mb="md">Cloudinary Media Library</Title>
      
      {error && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Ошибка" 
          color="red" 
          mb="md"
        >
          {error}
        </Alert>
      )}
      
      <Group>
        <Button
          leftSection={<IconCloudUpload size={16} />}
          onClick={openMediaLibrary}
          disabled={!isScriptLoaded}
        >
          {buttonLabel}
        </Button>
        
        {!isScriptLoaded && (
          <Text size="sm" c="dimmed">
            Загрузка библиотеки...
          </Text>
        )}
      </Group>
      
      <Text size="sm" mt="md" c="dimmed">
        Используйте Cloudinary Media Library для загрузки, управления и выбора изображений.
        Все выбранные изображения будут автоматически добавлены на сайт.
      </Text>
    </Paper>
  );
};

export default CloudinaryMediaLibrary; 