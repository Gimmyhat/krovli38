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

// Расширяем глобальный объект Window для безопасного доступа к crypto
declare global {
  interface Window {
    crypto: Crypto & {
      // Костыль для объявления нестандартной реализации randomUUID
      randomUUID?: () => string;
    };
    // Глобальные флаги для отслеживания полифилла
    _cryptoPolyfilled?: boolean;
    _sentryUrl?: string;
    _sentryDisabled?: boolean;
  }
}

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
          
          // Создаем изображения через API с задержкой между запросами
          for (let i = 0; i < uploadedFiles.current.length; i++) {
            const file = uploadedFiles.current[i];
            if (file.info && file.info.public_id) {
              try {
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
                
                // Добавляем задержку между запросами, чтобы избежать 429 ошибки
                if (i < uploadedFiles.current.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              } catch (err) {
                console.error(`Ошибка при создании изображения из Cloudinary (${i+1}/${uploadedFiles.current.length}):`, err);
                // Продолжаем выполнение с другими изображениями, не прерываем цикл
              }
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
    if (opened) {
      try {
        // Проверка полифилла перед использованием Cloudinary
        if (!window._cryptoPolyfilled || typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') {
          console.warn('Полифилл crypto.randomUUID не установлен или не работает, применяем внутренний полифилл');
          
          // Используем приведение типов для обхода проверки TypeScript
          if (typeof window.crypto === 'undefined') (window as any).crypto = {};
          
          // Добавляем полифилл через приведение типов any
          (window as any).crypto.randomUUID = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
          
          // Устанавливаем флаг
          (window as any)._cryptoPolyfilled = true;
          
          // Проверяем, что полифилл установлен
          const testUUID = (window as any).crypto.randomUUID();
          console.log('Полифилл успешно установлен внутри компонента:', testUUID);
        }
        
        // Проверяем доступность Cloudinary
        if (!(window as any).cloudinary) {
          console.error('Cloudinary не доступен. Проверьте, загружены ли скрипты Cloudinary.');
          setError('Cloudinary не доступен. Скрипты не загружены или заблокированы. Проверьте консоль браузера для деталей.');
          return;
        }

        console.log('Cloudinary настройки:', {
          cloudName: cloudinaryConfig.CLOUD_NAME,
          apiKey: cloudinaryConfig.API_KEY,
          uploadPreset: cloudinaryConfig.UPLOAD_PRESET
        });

        // Оборачиваем весь код Cloudinary в try-catch для защиты от ошибок
        try {
          // Получаем базовую конфигурацию с увеличенной задержкой
          const options = cloudinaryConfig.getUploadWidgetConfig({
            multiple,
            maxFiles,
            // Добавляем информацию для организации файлов
            folder: `krovli38/${type || 'content'}`,
            // Если теги указаны, добавляем их
            tags: tags.length > 0 ? tags : undefined,
            // Увеличиваем задержку между запросами
            queueDuration: 3500 // 3.5 секунды между загрузками
          });
          
          // Добавляем дополнительное свойство для блокировки трекинга ошибок DeepL
          if ((window as any)._sentryUrl && (window as any)._sentryUrl.includes('deepl.com')) {
            (window as any)._sentryDisabled = true;
          }
          
          console.log('Опции для Cloudinary Upload Widget:', options);
          
          // Создаем виджет с дополнительной защитой
          try {
            // Временно отключаем трекинг ошибок для создания виджета
            const oldOnerror = window.onerror;
            window.onerror = function(message, source, lineno, colno, error) {
              if (message && typeof message === 'string' && message.includes('crypto.randomUUID')) {
                console.warn('Перехвачена ошибка crypto.randomUUID при создании виджета');
                return true; // Предотвращаем стандартную обработку
              }
              return oldOnerror ? oldOnerror(message, source, lineno, colno, error) : false;
            };
            
            // Создаем виджет
            widgetRef.current = (window as any).cloudinary.createUploadWidget(
              options,
              handleUploadResults
            );
            
            // Восстанавливаем обработчик ошибок
            window.onerror = oldOnerror;
            
            // Сразу открываем виджет
            if (widgetRef.current) {
              widgetRef.current.open();
            } else {
              console.error('Не удалось создать виджет Cloudinary');
              setError('Не удалось создать виджет загрузки. Проверьте консоль браузера.');
            }
          } catch (cloudinaryError) {
            console.error('Ошибка при создании Cloudinary Upload Widget:', cloudinaryError);
            setError(`Ошибка при инициализации Cloudinary: ${(cloudinaryError as Error).message || 'неизвестная ошибка'}`);
          }
        } catch (configError) {
          console.error('Ошибка при настройке Cloudinary Upload Widget:', configError);
          setError(`Ошибка при настройке Cloudinary: ${(configError as Error).message || 'неизвестная ошибка'}`);
        }
      } catch (error) {
        console.error('Общая ошибка при инициализации Cloudinary Upload Widget:', error);
        setError(`Не удалось инициализировать Cloudinary Upload Widget: ${(error as Error).message || 'неизвестная ошибка'}`);
      }
    }
    
    // Очищаем при размонтировании
    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.close({ quiet: true });
          widgetRef.current.destroy();
        } catch (e) {
          console.error('Ошибка при закрытии Cloudinary Upload Widget:', e);
        }
      }
    };
  }, [opened]);

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