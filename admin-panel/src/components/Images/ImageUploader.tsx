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
  Card,
  Alert,
  LoadingOverlay,
  Paper,
  Title,
  Divider,
  Accordion,
  Grid,
  ActionIcon
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconUpload, 
  IconTrash, 
  IconAlertCircle, 
  IconCheck, 
  IconInfoCircle,
  IconPhotoPlus
} from '@tabler/icons-react';
import { uploadSingleImage, uploadMultipleImages } from '../../api/imageApi';
import { 
  FLAT_IMAGE_TYPES, 
  GROUPED_SECTIONS, 
  GROUPED_TAGS, 
  getTypeInfo
} from '../../constants/imageCategories';

// Интерфейс для предварительного просмотра изображения
interface ImagePreview {
  file: File;
  preview: string;
  alt: string;
  title: string;
}

// Свойства компонента загрузки изображений
interface ImageUploaderProps {
  onUploadSuccess: () => void;
  multipleMode?: boolean;
  initialType?: string | null;
  initialSection?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onUploadSuccess, 
  multipleMode = false,
  initialType = null,
  initialSection = null
}) => {
  const [files, setFiles] = useState<ImagePreview[]>([]);
  const [type, setType] = useState<string | null>(initialType);
  const [section, setSection] = useState<string | null>(initialSection);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Информация о выбранном типе и разделе
  const typeInfo = type ? getTypeInfo(type) : null;

  // Обработчик дропа файлов
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // Преобразуем файлы для предпросмотра
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      alt: '',
      title: file.name.split('.')[0].replace(/[-_]/g, ' '), // Имя файла без расширения как заголовок по умолчанию
    }));
    
    if (multipleMode) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      // В режиме одиночной загрузки заменяем текущее изображение
      setFiles(newFiles.slice(0, 1));
    }
  }, [multipleMode]);

  // Настройка Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: multipleMode,
  });

  // Удаление файла из предпросмотра
  const removeFile = (index: number) => {
    const newFiles = [...files];
    
    // Освобождаем URL объекта для предотвращения утечек памяти
    URL.revokeObjectURL(newFiles[index].preview);
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Обновление метаданных файла
  const updateFileMetadata = (index: number, field: 'alt' | 'title', value: string) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };
  
  // Загрузка изображений на сервер
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Добавьте хотя бы одно изображение для загрузки');
      return;
    }
    
    if (!type) {
      setError('Выберите тип изображения');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (multipleMode) {
        // Режим множественной загрузки
        await uploadMultipleImages(
          files.map(f => f.file),
          { 
            type, 
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
        // Режим загрузки одного изображения
        const file = files[0];
        await uploadSingleImage(
          file.file,
          {
            type,
            alt: file.alt || file.title, // Если alt не указан, используем title
            title: file.title,
            section: section || undefined,
            tags
          }
        );
        
        notifications.show({
          title: 'Успешно',
          message: 'Изображение успешно загружено',
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      }
      
      // Очищаем форму после успешной загрузки
      clearAll();
      
      // Вызываем колбэк для обновления родительского компонента
      onUploadSuccess();
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Ошибка при загрузке изображения. Повторите попытку позже.');
    } finally {
      setLoading(false);
    }
  };

  // Очистка формы
  const clearAll = () => {
    // Освобождаем URL объектов
    files.forEach(file => URL.revokeObjectURL(file.preview));
    
    setFiles([]);
    // Не сбрасываем тип и раздел, так как они могут использоваться для последующих загрузок
  };

  return (
    <Paper withBorder p="md" radius="md">
      <LoadingOverlay visible={loading} />
      
      <Title order={3} mb="md">Загрузка изображений</Title>
      
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
      
      <Box {...getRootProps()} 
        style={{
          border: '2px dashed',
          borderColor: isDragActive ? '#4dabf7' : '#ced4da',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: isDragActive ? '#e7f5ff' : '#f8f9fa',
          cursor: 'pointer',
          transition: 'all 200ms ease',
        }}
        mb="md"
      >
        <input {...getInputProps()} />
        
        <Flex direction="column" align="center" justify="center">
          <IconPhotoPlus size={48} style={{ marginBottom: 16, opacity: 0.7 }} />
          
          <Text size="xl" ta="center" mb={6}>
            {isDragActive
              ? 'Перетащите изображения сюда'
              : 'Перетащите изображения сюда или нажмите для выбора'}
          </Text>
          
          <Text c="dimmed" size="sm" ta="center">
            {multipleMode 
              ? 'Загрузите несколько изображений одновременно' 
              : 'Загрузите одно изображение'}
          </Text>
          
          <Text c="dimmed" size="xs" ta="center" mt={6}>
            Поддерживаются форматы JPG, PNG, GIF, WEBP
          </Text>
        </Flex>
      </Box>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Select
            label="Тип изображения"
            description="Выберите, к какой категории относится изображение"
            placeholder="Выберите тип"
            data={FLAT_IMAGE_TYPES}
            value={type}
            onChange={setType}
            required
            clearable
            searchable
            mb="sm"
          />
          
          {typeInfo && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md" variant="light">
              {typeInfo.description}
            </Alert>
          )}
          
          <Select
            label="Раздел сайта"
            description="Выберите, в каком разделе будет использоваться изображение"
            placeholder="Выберите раздел"
            data={GROUPED_SECTIONS}
            value={section}
            onChange={setSection}
            clearable
            searchable
            mb="sm"
          />
          
          <MultiSelect
            label="Теги"
            description="Добавьте теги для удобного поиска и фильтрации"
            placeholder="Выберите теги"
            data={GROUPED_TAGS}
            value={tags}
            onChange={setTags}
            clearable
            searchable
            mb="md"
          />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 6 }}>
          {files.length > 0 && (
            <Stack>
              <Text fw={500} size="sm" mb={4}>Предпросмотр ({files.length})</Text>
              
              {files.map((file, index) => (
                <Card key={index} p="xs" withBorder>
                  <Flex gap="md">
                    <Image
                      src={file.preview}
                      width={80}
                      height={80}
                      fit="contain"
                      alt={file.title}
                    />
                    
                    <Box style={{ flex: 1 }}>
                      <TextInput
                        label="Заголовок"
                        placeholder="Введите заголовок"
                        value={file.title}
                        onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                        size="xs"
                        mb="xs"
                      />
                      
                      <TextInput
                        label="Альтернативный текст (для SEO)"
                        placeholder="Опишите содержимое изображения"
                        value={file.alt}
                        onChange={(e) => updateFileMetadata(index, 'alt', e.target.value)}
                        size="xs"
                      />
                    </Box>
                    
                    <Tooltip label="Удалить">
                      <ActionIcon 
                        color="red" 
                        onClick={() => removeFile(index)}
                        mt={8}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Flex>
                </Card>
              ))}
            </Stack>
          )}
        </Grid.Col>
      </Grid>
      
      <Divider my="md" />
      
      <Group justify="space-between">
        <Button 
          variant="outline" 
          onClick={clearAll} 
          disabled={files.length === 0}
        >
          Очистить
        </Button>
        
        <Button 
          onClick={handleUpload} 
          leftSection={<IconUpload size={18} />}
          disabled={files.length === 0 || !type}
        >
          Загрузить {multipleMode && files.length > 0 ? `(${files.length})` : 'изображение'}
        </Button>
      </Group>
      
      <Accordion mt="md">
        <Accordion.Item value="usage-help">
          <Accordion.Control>Справка по использованию</Accordion.Control>
          <Accordion.Panel>
            <Text size="sm" mb="xs">
              <strong>Тип изображения</strong> определяет, как изображение будет использоваться на сайте.
              Например, баннеры для слайдера, фотографии для галереи работ и т.д.
            </Text>
            
            <Text size="sm" mb="xs">
              <strong>Раздел сайта</strong> указывает на конкретное место на сайте, где будет отображаться изображение.
              Например, "Главная - Баннер" или "Услуги - Ремонт кровли".
            </Text>
            
            <Text size="sm">
              <strong>Теги</strong> добавляют дополнительную информацию для классификации и позволяют легче найти нужные изображения.
              Например, "Зима", "Большое", "Горизонтальное".
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};

export default ImageUploader; 