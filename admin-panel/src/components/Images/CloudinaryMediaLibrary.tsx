import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Group,
  Modal, 
  Text,
  Paper,
  Alert,
  Stack
} from '@mantine/core';
import { 
  IconPhotoPlus,
  IconAlertCircle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import cloudinaryConfig from '../../services/cloudinaryConfig';
import { ImageData } from '../../api/imageApi';
import { useDisclosure } from '@mantine/hooks';

/**
 * Проверка доступности Cloudinary API
 */
const checkCloudinaryAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         window.cloudinary !== undefined && 
         typeof window.cloudinary.createMediaLibrary === 'function';
};

/**
 * Проверка поддержки crypto.randomUUID
 */
const checkCryptoSupport = (): boolean => {
  try {
    return typeof window.crypto !== 'undefined' && 
           typeof window.crypto.randomUUID === 'function';
  } catch (error) {
    console.error('Ошибка при проверке crypto.randomUUID:', error);
    return false;
  }
};

// Типы компонента
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaLibraryRef = useRef<any>(null);
  const [isCloudinaryAvailable, setIsCloudinaryAvailable] = useState(false);
  const [showAdvancedError, { toggle: toggleAdvancedError }] = useDisclosure(false);

  /**
   * Трансформация результата из Cloudinary в ImageData
   */
  const transformCloudinaryResult = (result: any): ImageData[] => {
    try {
      if (!result || !result.assets || !Array.isArray(result.assets) || result.assets.length === 0) {
        console.error('Некорректные данные от Cloudinary:', result);
        return [];
      }
      
      // Маппим результаты в формат ImageData
      return result.assets.map((asset: any) => ({
        _id: '', // Будет заполнено при сохранении
        public_id: asset.public_id,
        url: asset.url,
        secure_url: asset.secure_url,
        type: filterOptions.type || 'general',
        section: filterOptions.section || 'general',
        alt: asset.context?.alt || '',
        title: asset.context?.caption || '',
        width: asset.width,
        height: asset.height,
        format: asset.format,
        tags: asset.tags || [],
        order: 0,
        isActive: true,
        createdAt: asset.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Ошибка при трансформации данных Cloudinary:', err);
      setError('Ошибка при обработке выбранных изображений');
      return [];
    }
  };

  /**
   * Обработчик выбора изображений
   */
  const handleSelectImages = async (data: any) => {
    if (!data || !data.assets) {
      setError('Некорректные данные от Cloudinary');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Трансформируем результаты и создаем записи в БД
      const transformedImages = transformCloudinaryResult(data);
      const savedImages: ImageData[] = [];
      
      // Последовательно сохраняем каждое изображение с задержкой
      for (const image of transformedImages) {
        try {
          const savedImage = await createImageFromCloudinary({
            public_id: image.public_id,
            type: filterOptions.type || 'general',
            section: filterOptions.section || 'general',
            alt: image.alt,
            title: image.title,
            tags: filterOptions.tags || []
          });
          
          savedImages.push(savedImage);
          
          // Добавляем задержку между запросами для предотвращения rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Ошибка при сохранении изображения:', err);
        }
      }
      
      if (savedImages.length > 0) {
        onSelect(savedImages);
        onClose();
      } else {
        setError('Не удалось сохранить выбранные изображения');
      }
    } catch (err) {
      console.error('Ошибка при выборе изображений:', err);
      setError('Произошла ошибка при обработке запроса');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Проверяем доступность Cloudinary при монтировании
   */
  useEffect(() => {
    const cryptoSupported = checkCryptoSupport();
    if (!cryptoSupported) {
      console.warn('Функция crypto.randomUUID не поддерживается в этом браузере.');
      setError('Ваш браузер не поддерживает необходимые функции. Пожалуйста, обновите браузер.');
    }

    const cloudinaryAvailable = checkCloudinaryAvailable();
    setIsCloudinaryAvailable(cloudinaryAvailable);
    
    if (!cloudinaryAvailable) {
      console.error('Cloudinary виджет не найден!');
      setError('Не удалось загрузить Cloudinary Media Library. Попробуйте обновить страницу.');
    }
  }, []);

  /**
   * Инициализируем и открываем Cloudinary Media Library
   */
  useEffect(() => {
    if (!opened || !isCloudinaryAvailable) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Логируем конфигурацию для отладки
      console.log('Cloudinary конфигурация:', {
        cloud_name: cloudinaryConfig.CLOUD_NAME,
        api_key: cloudinaryConfig.API_KEY
      });

      // Получаем настройки Cloudinary
      const mediaLibraryOptions = cloudinaryConfig.getMediaLibraryConfig({
        multiple,
        maxFiles,
        remove_header: true,
        insert_caption: multiple ? 'Выбрать изображения' : 'Выбрать изображение',
        search: {
          expressions: [
            filterOptions.type ? `resource_type:image AND tags=${filterOptions.type}` : 'resource_type:image'
          ]
        },
        asset: {
          resource_type: resourceType
        }
      });

      // Создаем и открываем Media Library
      if (window.cloudinary && typeof window.cloudinary.createMediaLibrary === 'function') {
        mediaLibraryRef.current = window.cloudinary.createMediaLibrary(
          mediaLibraryOptions,
          { insertHandler: handleSelectImages }
        );
        
        mediaLibraryRef.current.show();
      } else {
        throw new Error('Cloudinary API не доступно');
      }
    } catch (err) {
      console.error('Ошибка при инициализации Cloudinary Media Library:', err);
      setError(`Ошибка при инициализации Cloudinary Media Library: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }

    // Очищаем при размонтировании
    return () => {
      if (mediaLibraryRef.current) {
        try {
          mediaLibraryRef.current.hide();
        } catch (err) {
          console.error('Ошибка при закрытии Media Library:', err);
        }
      }
    };
  }, [opened, isCloudinaryAvailable, multiple, maxFiles, resourceType, filterOptions]);

  /**
   * Обработчик закрытия модального окна
   */
  const handleClose = () => {
    if (mediaLibraryRef.current) {
      try {
        mediaLibraryRef.current.hide();
      } catch (err) {
        console.error('Ошибка при закрытии Media Library:', err);
      }
    }
    onClose();
  };

  /**
   * Рендер компонента
   */
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
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
            <Stack>
              <Text>{error}</Text>
              {showAdvancedError && (
                <Text size="sm">
                  Cloudinary доступен: {isCloudinaryAvailable ? 'Да' : 'Нет'}<br />
                  crypto.randomUUID поддерживается: {checkCryptoSupport() ? 'Да' : 'Нет'}
                </Text>
              )}
              <Button size="xs" onClick={toggleAdvancedError} variant="subtle">
                {showAdvancedError ? 'Скрыть подробности' : 'Показать подробности'}
              </Button>
            </Stack>
          </Alert>
        )}
        
        {!isCloudinaryAvailable && !error && (
          <Alert 
            title="Загрузка Media Library..." 
            color="blue" 
            mb="md" 
            icon={<IconAlertCircle size={16} />}
          >
            <Text>Ожидание загрузки Cloudinary Media Library. Если ничего не происходит, 
            попробуйте обновить страницу.</Text>
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