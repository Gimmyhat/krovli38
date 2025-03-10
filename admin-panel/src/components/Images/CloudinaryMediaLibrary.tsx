import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Button, 
  Group,
  Modal, 
  Text,
  Paper,
  Alert
} from '@mantine/core';
import { 
  IconPhotoPlus,
  IconAlertCircle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import { ImageData } from '../../api/imageApi';

// Используем типы из глобального типа Window
interface CloudinaryMediaLibraryProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (images: ImageData[]) => void;
  title?: string;
  multiple?: boolean;
  maxFiles?: number;
  resourceType?: string;
  filterOptions?: {
    type?: string;
    section?: string;
    tags?: string[];
  };
}

/**
 * Компонент для интеграции Cloudinary Media Library
 */
const CloudinaryMediaLibrary: React.FC<CloudinaryMediaLibraryProps> = ({
  opened,
  onClose,
  onSelect,
  title = 'Медиабиблиотека Cloudinary',
  multiple = false,
  maxFiles = 10,
  resourceType = 'image',
  filterOptions = {}
}) => {
  const [error, setError] = useState<string | null>(null);
  const mediaLibraryRef = useRef<any>(null);

  // Функция для преобразования результата Cloudinary в формат ImageData
  const transformCloudinaryResult = (result: any): ImageData[] => {
    if (!result || !result.assets || !Array.isArray(result.assets)) {
      return [];
    }
    
    return result.assets.map((asset: any) => ({
      _id: asset.asset_id || asset.public_id,
      public_id: asset.public_id,
      url: asset.url,
      secure_url: asset.secure_url,
      type: filterOptions.type || 'content',
      alt: asset.alt || '',
      title: asset.context?.custom?.caption || '',
      section: filterOptions.section || 'general',
      width: asset.width,
      height: asset.height,
      format: asset.format,
      tags: asset.tags || [],
      order: 0,
      isActive: true,
      createdAt: asset.created_at,
      updatedAt: asset.created_at
    }));
  };

  // Обработчик выбора изображений
  const handleSelectImages = (data: any) => {
    try {
      const transformedImages = transformCloudinaryResult(data);
      
      if (transformedImages.length === 0) {
        setError('Не удалось получить данные выбранных изображений');
        return;
      }
      
      // Вызываем колбэк с преобразованными данными
      onSelect(transformedImages);
      
      // Закрываем окно и чистим состояние
      onClose();
    } catch (error) {
      console.error('Ошибка при обработке выбранных изображений:', error);
      setError('Произошла ошибка при обработке выбранных изображений');
    }
  };

  // Открываем Media Library когда компонент открыт
  useEffect(() => {
    if (opened) {
      try {
        // Проверяем доступность Cloudinary
        if (!(window as any).cloudinary) {
          console.error('Cloudinary не доступен. Проверьте, загружены ли скрипты Cloudinary.');
          setError('Cloudinary не доступен. Проверьте консоль браузера для деталей.');
          return;
        }

        console.log('Cloudinary настройки:', {
          cloudName: cloudinaryConfig.CLOUDINARY_CLOUD_NAME,
          apiKey: cloudinaryConfig.CLOUDINARY_API_KEY
        });

        // Получаем настройки Cloudinary
        const options = cloudinaryConfig.getMediaLibraryConfig({
          multiple,
          max_files: maxFiles,
          asset: {
            resource_type: resourceType
          }
        });

        console.log('Опции для Cloudinary Media Library:', options);
        
        // Если есть теги, добавляем их в поисковый запрос
        if (filterOptions.tags && filterOptions.tags.length > 0) {
          // Используем приведение типов для обхода ограничений TypeScript
          const optionsWithSearch = options as any;
          optionsWithSearch.search = optionsWithSearch.search || {};
          optionsWithSearch.search.expressions = [`tags:${filterOptions.tags.join(' OR tags:')}`];
        }
        
        // Создаем экземпляр Media Library с приведением типов
        mediaLibraryRef.current = (window as any).cloudinary.createMediaLibrary(
          options,
          { 
            insertHandler: handleSelectImages 
          }
        );
        
        // Показываем виджет
        if (mediaLibraryRef.current) {
          mediaLibraryRef.current.show();
        } else {
          console.error('Не удалось создать Media Library');
          setError('Не удалось создать библиотеку медиа. Проверьте консоль браузера.');
        }
      } catch (error) {
        console.error('Ошибка при инициализации Cloudinary Media Library:', error);
        setError('Не удалось инициализировать Cloudinary Media Library');
      }
    }
    
    // Закрываем виджет при размонтировании
    return () => {
      if (mediaLibraryRef.current) {
        try {
          mediaLibraryRef.current.hide();
        } catch (e) {
          console.error('Ошибка при закрытии Cloudinary Media Library:', e);
        }
      }
    };
  }, [opened, multiple, maxFiles, resourceType, filterOptions]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      padding={0}
    >
      <Box p="md">
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка" 
            color="red" 
            mb="md"
          >
            {error}
            <Group mt="md">
              <Button size="xs" onClick={() => setError(null)}>Попробовать снова</Button>
              <Button size="xs" variant="subtle" onClick={onClose}>Закрыть</Button>
            </Group>
          </Alert>
        )}
        
        <Paper p="lg" withBorder>
          <Text ta="center" mb="md">
            Загрузка Cloudinary Media Library...
          </Text>
          <Group justify="center">
            <Button 
              leftSection={<IconPhotoPlus size={20} />}
              onClick={() => {
                if (mediaLibraryRef.current) {
                  try {
                    mediaLibraryRef.current.show();
                  } catch (e) {
                    console.error('Ошибка при повторном открытии виджета:', e);
                    notifications.show({
                      title: 'Ошибка',
                      message: 'Не удалось открыть Cloudinary Media Library',
                      color: 'red'
                    });
                  }
                }
              }}
            >
              Показать медиабиблиотеку
            </Button>
          </Group>
        </Paper>
      </Box>
    </Modal>
  );
};

export default CloudinaryMediaLibrary; 