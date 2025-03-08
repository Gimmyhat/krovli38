import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Box, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  Select, 
  MultiSelect,
  Stack,
  Flex,
  Image,
  Tooltip,
  Badge,
  Card,
  Alert,
  LoadingOverlay
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUpload, IconTrash, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { uploadSingleImage, uploadMultipleImages } from '../../api/imageApi';

// Типы изображений для выбора
const IMAGE_TYPES = [
  { value: 'banner', label: 'Баннер' },
  { value: 'gallery', label: 'Галерея' },
  { value: 'product', label: 'Продукт' },
  { value: 'category', label: 'Категория' },
  { value: 'icon', label: 'Иконка' },
  { value: 'logo', label: 'Логотип' },
];

// Разделы сайта для выбора
const SECTIONS = [
  { value: 'home', label: 'Главная' },
  { value: 'catalog', label: 'Каталог' },
  { value: 'portfolio', label: 'Портфолио' },
  { value: 'about', label: 'О нас' },
  { value: 'contacts', label: 'Контакты' },
];

// Доступные теги
const AVAILABLE_TAGS = [
  { value: 'featured', label: 'Главное' },
  { value: 'new', label: 'Новое' },
  { value: 'promo', label: 'Промо' },
  { value: 'background', label: 'Фон' },
  { value: 'small', label: 'Маленькое' },
  { value: 'large', label: 'Большое' },
];

interface ImagePreview {
  file: File;
  preview: string;
  alt: string;
  title: string;
}

interface ImageUploaderProps {
  onUploadSuccess: () => void;
  multipleMode?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onUploadSuccess, 
  multipleMode = false 
}) => {
  const [files, setFiles] = useState<ImagePreview[]>([]);
  const [type, setType] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Преобразуем файлы для предпросмотра
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
      title: file.name.split('.')[0], // Имя файла без расширения как заголовок по умолчанию
    }));
    
    if (multipleMode) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // В режиме одиночной загрузки заменяем текущее изображение
      setFiles(newFiles.slice(0, 1));
    }
  }, [multipleMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: multipleMode,
    maxSize: 5 * 1024 * 1024, // 5MB макс размер
    onDropRejected: (rejections) => {
      const errors = rejections.map(rejection => 
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      );
      setError(`Ошибка при загрузке: ${errors.join(' | ')}`);
    }
  });

  const removeFile = (index: number) => {
    const updatedFiles = [...files];
    URL.revokeObjectURL(updatedFiles[index].preview);
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const updateFileMetadata = (index: number, field: 'alt' | 'title', value: string) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setFiles(updatedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Пожалуйста, выберите изображения для загрузки');
      return;
    }

    if (!type) {
      setError('Пожалуйста, укажите тип изображения');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (multipleMode && files.length > 1) {
        // Загрузка нескольких файлов
        await uploadMultipleImages(
          files.map(f => f.file), 
          { 
            type: type || undefined, 
            section: section || undefined, 
            tags 
          }
        );
        
        notifications.show({
          title: 'Успешно',
          message: `Загружено ${files.length} изображений`,
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        // Загрузка одного файла
        const file = files[0];
        await uploadSingleImage(
          file.file,
          {
            type: type || undefined,
            alt: file.alt,
            title: file.title,
            section: section || undefined,
            tags
          }
        );
        
        notifications.show({
          title: 'Успешно',
          message: 'Изображение загружено',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      }
      
      // Очищаем все поля после успешной загрузки
      setFiles([]);
      setType(null);
      setSection(null);
      setTags([]);
      
      // Уведомляем родительский компонент об успешной загрузке
      onUploadSuccess();
    } catch (err) {
      console.error('Ошибка при загрузке:', err);
      setError('Произошла ошибка при загрузке изображений. Пожалуйста, попробуйте снова.');
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить изображения',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError(null);
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      
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
      
      <Box
        {...getRootProps()}
        style={{
          border: '2px dashed var(--mantine-color-blue-6)',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? 'var(--mantine-color-blue-0)' : 'transparent',
        }}
      >
        <input {...getInputProps()} />
        
        <Stack align="center" gap="xs">
          <IconUpload size={32} stroke={1.5} color="var(--mantine-color-blue-6)" />
          
          {isDragActive ? (
            <Text size="sm">Перетащите файлы сюда...</Text>
          ) : (
            <>
              <Text size="sm" fw={500}>
                {multipleMode ? 'Перетащите изображения или нажмите для выбора' : 'Перетащите изображение или нажмите для выбора'}
              </Text>
              <Text size="xs" c="dimmed">
                Поддерживаемые форматы: JPEG, PNG, GIF, WebP. Максимальный размер: 5МБ
              </Text>
            </>
          )}
        </Stack>
      </Box>
      
      {files.length > 0 && (
        <Box mt="md">
          <Flex justify="space-between" align="center" mb="sm">
            <Text fw={500}>Предпросмотр</Text>
            <Button 
              variant="subtle" 
              color="red" 
              leftSection={<IconTrash size={16} />} 
              onClick={clearAll}
              size="xs"
            >
              Очистить всё
            </Button>
          </Flex>
          
          <Box 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px' 
            }}
          >
            {files.map((file, index) => (
              <Card key={index} padding="xs" withBorder>
                <Card.Section>
                  <Box pos="relative">
                    <Image
                      src={file.preview}
                      h={150}
                      alt={file.alt}
                      style={{ backgroundColor: '#f8f9fa', objectFit: 'contain' }}
                    />
                    <Box 
                      pos="absolute" 
                      top={5} 
                      right={5}
                      style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}
                    >
                      <Tooltip label="Удалить">
                        <Button 
                          onClick={() => removeFile(index)} 
                          size="xs" 
                          color="red" 
                          variant="subtle" 
                          p={4}
                          style={{ width: '24px', height: '24px', minWidth: 'auto' }}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card.Section>
                
                <Stack gap="xs" mt="xs">
                  <TextInput
                    size="xs"
                    label="Заголовок"
                    value={file.title}
                    onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                  />
                  
                  <TextInput
                    size="xs"
                    label="Alt текст"
                    value={file.alt}
                    onChange={(e) => updateFileMetadata(index, 'alt', e.target.value)}
                  />
                  
                  <Text size="xs">
                    <Badge size="xs">{(file.file.size / 1024).toFixed(0)} KB</Badge>
                  </Text>
                </Stack>
              </Card>
            ))}
          </Box>
        </Box>
      )}
      
      <Box mt="lg">
        <Group grow mb="md">
          <Select
            label="Тип изображения"
            placeholder="Выберите тип"
            data={IMAGE_TYPES}
            value={type}
            onChange={setType}
            searchable
            clearable
            required
          />
          
          <Select
            label="Раздел сайта"
            placeholder="Выберите раздел"
            data={SECTIONS}
            value={section}
            onChange={setSection}
            searchable
            clearable
          />
        </Group>
        
        <MultiSelect
          label="Теги"
          placeholder="Выберите теги"
          data={AVAILABLE_TAGS}
          value={tags}
          onChange={setTags}
          searchable
          clearable
          mb="md"
        />
        
        <Button 
          onClick={handleUpload} 
          leftSection={<IconUpload size={16} />} 
          disabled={files.length === 0 || !type} 
          fullWidth
        >
          {multipleMode ? 'Загрузить все изображения' : 'Загрузить изображение'}
        </Button>
      </Box>
    </Box>
  );
};

export default ImageUploader; 