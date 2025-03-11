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
          
          // Очищаем временные данные
          uploadedFiles.current = [];
          
          // Уведомляем и закрываем модальное окно
          notifications.show({
            title: 'Успешно',
            message: 'Все изображения успешно загружены',
            color: 'green',
            icon: <IconCheck size={16} />
          });
          
          // Вызываем функцию обратного вызова для обновления списка изображений
          onUploadSuccess();
          onClose();
        } catch (error) {
          console.error('Ошибка при сохранении изображений:', error);
          setError('Не удалось сохранить метаданные изображений в БД');
        } finally {
          setLoading(false);
        }
      } else {
        // Закрываем просто так, если ничего не загрузили
        onClose();
      }
    }
  };

  // Инициализация виджета
  useEffect(() => {
    let widget: CloudinaryUploadWidget | null = null;
    
    if (opened) {
      try {
        // Проверяем доступность Cloudinary
        if (!(window as any).cloudinary) {
          console.error('Cloudinary не доступен. Проверьте, загружены ли скрипты Cloudinary.');
          setError('Cloudinary не доступен. Проверьте консоль браузера для деталей.');
          return;
        }

        // Получаем базовую конфигурацию
        const options = cloudinaryConfig.getUploadWidgetConfig({
          multiple,
          maxFiles,
          // Добавляем информацию для организации файлов
          folder: `krovli38/${type || 'content'}`,
          // Если теги указаны, добавляем их
          tags: tags.length > 0 ? tags : undefined
        });
        
        // Создаем виджет с типизацией
        widget = (window as any).cloudinary.createUploadWidget(
          options,
          handleUploadResults
        );
        
        widgetRef.current = widget;
        
        // Сразу открываем виджет
        if (widget) {
          widget.open();
        } else {
          console.error('Не удалось создать виджет Cloudinary');
          setError('Не удалось создать виджет загрузки. Проверьте консоль браузера.');
        }
      } catch (error) {
        console.error('Ошибка при инициализации Cloudinary Upload Widget:', error);
        setError('Не удалось инициализировать Cloudinary Upload Widget');
      }
    }
    
    // Очищаем при размонтировании или закрытии
    return () => {
      if (widget) {
        try {
          widget.close({ quiet: true });
          widget.destroy();
          widgetRef.current = null;
        } catch (e) {
          console.error('Ошибка при закрытии Cloudinary Upload Widget:', e);
        }
      }
    };
  }, [opened, type, tags, multiple, maxFiles]);

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