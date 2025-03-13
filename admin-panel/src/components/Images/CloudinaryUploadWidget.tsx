import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Button, 
  Group,
  Modal, 
  Text,
  Paper,
  Alert,
  LoadingOverlay,
  Select,
  MultiSelect,
  TextInput,
  Stack
} from '@mantine/core';
import { 
  IconUpload,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import cloudinaryConfig, { IMAGE_TYPES, SECTIONS, AVAILABLE_TAGS } from '../../services/cloudinaryConfig';
import { createImageFromCloudinary } from '../../api/imageApi';
import type { CloudinaryUploadWidget, CloudinaryUploadWidgetResult } from '../../types/cloudinary';

interface CloudinaryUploadWidgetComponentProps {
  opened: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  title?: string;
  multiple?: boolean;
  maxFiles?: number;
}

/**
 * Компонент для загрузки файлов с использованием Cloudinary Upload Widget
 */
const CloudinaryUploadWidgetComponent: React.FC<CloudinaryUploadWidgetComponentProps> = ({
  opened,
  onClose,
  onUploadSuccess,
  title = 'Загрузка изображений',
  multiple = true,
  maxFiles = 10
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<string | null>('content');
  const [section, setSection] = useState<string | null>('general');
  const [tags, setTags] = useState<string[]>([]);
  const [alt, setAlt] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);
  const uploadedFiles = useRef<CloudinaryUploadWidgetResult[]>([]);
  const widgetCallbackRef = useRef<((error: Error | null, result: CloudinaryUploadWidgetResult) => void) | null>(null);

  // Обработчик результатов загрузки
  const handleUploadResults = async (
    error: Error | null, 
    result: CloudinaryUploadWidgetResult
  ) => {
    if (error) {
      console.error('Ошибка Cloudinary Upload Widget:', error);
      setError('Произошла ошибка при загрузке файлов');
      return;
    }

    if (result.event === 'success') {
      // Сохраняем результат загрузки
      uploadedFiles.current.push(result);
      
      // Уведомляем пользователя
      notifications.show({
        title: 'Файл загружен',
        message: `${result.info.original_filename || 'Файл'} успешно загружен`,
        color: 'green',
        icon: <IconCheck size={16} />
      });
    }
    
    if (result.event === 'close') {
      // Очищаем callback перед закрытием виджета
      widgetCallbackRef.current = null;
      
      // Если были загруженные файлы, сохраняем их в БД
      if (uploadedFiles.current.length > 0) {
        try {
          setLoading(true);
          
          // Создаем изображения через API
          for (const file of uploadedFiles.current) {
            if (file.info && file.info.public_id) {
              const imageData = {
                public_id: file.info.public_id,
                type: type || 'content',
                section: section || 'general',
                alt: alt || file.info.original_filename || '',
                title: imageTitle || file.info.original_filename || '',
                tags: tags
              };
              
              // Вызываем API для сохранения метаданных
              await createImageFromCloudinary(imageData);
            }
          }
          
          // Уведомляем пользователя
          notifications.show({
            title: 'Успешно',
            message: `Загружено ${uploadedFiles.current.length} изображений`,
            color: 'green',
            icon: <IconCheck size={16} />
          });
          
          // Вызываем callback успешной загрузки
          onUploadSuccess();
          
          // Закрываем модальное окно
          onClose();
        } catch (err) {
          console.error('Ошибка при сохранении метаданных:', err);
          setError('Произошла ошибка при сохранении метаданных изображений');
        } finally {
          setLoading(false);
        }
      } else {
        // Просто закрываем модальное окно, если не было загрузок
        onClose();
      }
    }
  };

  // Инициализация виджета при открытии модального окна
  useEffect(() => {
    if (opened && !widgetRef.current) {
      try {
        // Создаем новый callback и сохраняем его в ref
        widgetCallbackRef.current = handleUploadResults;
        
        // Создаем функцию-обертку, которая проверяет актуальность callback
        const safeCallback = (error: Error | null, result: CloudinaryUploadWidgetResult) => {
          if (widgetCallbackRef.current) {
            widgetCallbackRef.current(error, result);
          }
        };
        
        // Получаем конфигурацию для виджета
        const options = cloudinaryConfig.getUploadWidgetConfig({
          multiple,
          maxFiles,
          tags
        });
        
        // Создаем виджет
        if (typeof window !== 'undefined' && (window as any).cloudinary) {
          widgetRef.current = (window as any).cloudinary.createUploadWidget(
            options,
            safeCallback
          );
          
          // Открываем виджет
          if (widgetRef.current) {
            widgetRef.current.open();
          }
        } else {
          setError('Cloudinary не инициализирован. Пожалуйста, обновите страницу.');
        }
      } catch (err) {
        console.error('Ошибка при инициализации Cloudinary Upload Widget:', err);
        setError('Не удалось инициализировать виджет загрузки');
      }
    }
    
    // Очистка при закрытии модального окна
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.close({ quiet: true });
          widgetRef.current = null;
        } catch (err) {
          console.error('Ошибка при закрытии виджета:', err);
        }
      }
      
      // Очищаем callback при размонтировании
      widgetCallbackRef.current = null;
    };
  }, [opened, multiple, maxFiles, tags]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        
        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Ошибка" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        <Stack>
          <Text fw={500}>Метаданные для загружаемых изображений</Text>
          
          <Group grow>
            <Select
              label="Тип изображения"
              placeholder="Выберите тип"
              value={type}
              onChange={setType}
              data={IMAGE_TYPES}
              required
            />
            
            <Select
              label="Раздел сайта"
              placeholder="Выберите раздел"
              value={section}
              onChange={setSection}
              data={SECTIONS}
              required
            />
          </Group>
          
          <TextInput
            label="Alt текст (для SEO)"
            placeholder="Введите альтернативный текст"
            value={alt}
            onChange={(e) => setAlt(e.currentTarget.value)}
          />
          
          <TextInput
            label="Название изображения"
            placeholder="Введите название"
            value={imageTitle}
            onChange={(e) => setImageTitle(e.currentTarget.value)}
          />
          
          <MultiSelect
            label="Теги"
            placeholder="Выберите теги"
            data={AVAILABLE_TAGS}
            value={tags}
            onChange={setTags}
            searchable
            clearable
          />
          
          <Paper withBorder p="md" mt="md">
            <Group justify="center">
              <Button 
                leftSection={<IconUpload size={16} />}
                onClick={() => {
                  if (widgetRef.current) {
                    widgetRef.current.open();
                  }
                }}
              >
                Открыть загрузчик Cloudinary
              </Button>
            </Group>
            
            <Text ta="center" size="sm" c="dimmed" mt="md">
              Укажите метаданные выше и нажмите кнопку для выбора и загрузки файлов.
              Поддерживаются JPG, PNG, GIF и WebP форматы.
            </Text>
          </Paper>
        </Stack>
      </Box>
    </Modal>
  );
};

export default CloudinaryUploadWidgetComponent; 