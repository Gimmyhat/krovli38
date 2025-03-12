import React, { useState } from 'react';
import { 
  Box, Button, Group, Text, Image,
  SimpleGrid, Modal, Stack, TextInput, Select, MultiSelect,
  LoadingOverlay
} from '@mantine/core';
import { useDropzone } from 'react-dropzone';
import { IconUpload, IconPhoto, IconX, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mediaService, MediaMetadata } from '../../services/mediaService';
import { IMAGE_TYPES, SECTIONS, AVAILABLE_TAGS } from '../../constants';

interface MediaUploaderProps {
  opened: boolean;
  onClose: () => void;
  onUploadSuccess: (images: MediaMetadata[]) => void;
  title?: string;
  maxFiles?: number;
}

// Тип для файлов с путями
interface FileWithPath extends File {
  path: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  opened,
  onClose,
  onUploadSuccess,
  title = 'Загрузка изображений',
  maxFiles = 10
}) => {
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Метаданные для всех загружаемых файлов
  const [type, setType] = useState<string>('content');
  const [section, setSection] = useState<string>('general');
  const [tags, setTags] = useState<string[]>([]);
  
  // Для редактирования метаданных каждого файла индивидуально
  const [filesMeta, setFilesMeta] = useState<{ [path: string]: { alt: string; title: string } }>({});

  // Обработка добавления файлов
  const handleDrop = (newFiles: FileWithPath[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    // Ограничиваем количество файлов
    if (files.length + validFiles.length > maxFiles) {
      notifications.show({
        title: 'Предупреждение',
        message: `Вы можете загрузить максимум ${maxFiles} файлов за раз`,
        color: 'yellow'
      });
      setFiles([...files, ...validFiles.slice(0, maxFiles - files.length)]);
    } else {
      setFiles([...files, ...validFiles]);
    }
    
    // Инициализируем метаданные для новых файлов
    const newFilesMeta = { ...filesMeta };
    validFiles.forEach(file => {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      if (!newFilesMeta[file.path]) {
        newFilesMeta[file.path] = {
          alt: fileName,
          title: fileName
        };
      }
    });
    setFilesMeta(newFilesMeta);
  };
  
  // Удаление файла из списка
  const removeFile = (path: string) => {
    setFiles(files.filter(file => file.path !== path));
    
    // Удаляем метаданные
    const newFilesMeta = { ...filesMeta };
    delete newFilesMeta[path];
    setFilesMeta(newFilesMeta);
  };

  // Обновление метаданных для конкретного файла
  const updateFileMeta = (path: string, field: 'alt' | 'title', value: string) => {
    setFilesMeta({
      ...filesMeta,
      [path]: {
        ...filesMeta[path],
        [field]: value
      }
    });
  };

  // Загрузка всех файлов
  const handleUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'Предупреждение',
        message: 'Добавьте файлы для загрузки',
        color: 'yellow'
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const uploadedImages: MediaMetadata[] = [];
    const errors: string[] = [];
    
    // Загружаем файлы последовательно, чтобы избежать перегрузки сервера
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        // Добавляем метаданные
        const metadata = {
          type,
          section,
          tags,
          alt: filesMeta[file.path]?.alt || file.name,
          title: filesMeta[file.path]?.title || file.name
        };
        
        formData.append('metadata', JSON.stringify(metadata));
        
        // Отправляем запрос
        const result = await mediaService.uploadImage(formData);
        uploadedImages.push(result);
        
        notifications.show({
          title: 'Успешно',
          message: `Файл ${file.name} загружен`,
          color: 'green'
        });
      } catch (err: any) {
        console.error('Ошибка при загрузке файла:', err);
        errors.push(`${file.name}: ${err.message}`);
      }
    }
    
    setLoading(false);
    
    // Отображаем результаты
    if (errors.length > 0) {
      setError(`Не все файлы были загружены успешно: ${errors.join('; ')}`);
    }
    
    if (uploadedImages.length > 0) {
      onUploadSuccess(uploadedImages);
      setFiles([]);
      setFilesMeta({});
      
      if (errors.length === 0) {
        onClose();
      }
    }
  };

  // Инициализируем dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Приводим File[] к FileWithPath[] и добавляем свойство path
      const filesWithPath = acceptedFiles.map(file => 
        Object.assign(file, { path: URL.createObjectURL(file) })
      ) as FileWithPath[];
      
      handleDrop(filesWithPath);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: maxFiles > 1
  });

  // Превью файлов
  const previews = files.map((file) => {
    const imageUrl = URL.createObjectURL(file);
    
    return (
      <Box key={file.path} p="sm" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500} truncate style={{ maxWidth: '180px' }}>
            {file.name}
          </Text>
          <Button 
            variant="subtle" 
            color="red" 
            size="compact" 
            p={0} 
            onClick={() => removeFile(file.path)}
          >
            <IconX size={18} />
          </Button>
        </Group>
        
        <Image 
          src={imageUrl}
          height={120}
          fit="contain"
          mb="xs"
          style={{ borderRadius: '4px' }}
        />
        
        <TextInput
          label="Название"
          placeholder="Введите название"
          size="xs"
          value={filesMeta[file.path]?.title || ''}
          onChange={(e) => updateFileMeta(file.path, 'title', e.currentTarget.value)}
          mb="xs"
        />
        
        <TextInput
          label="Alt текст"
          placeholder="Текст для SEO"
          size="xs"
          value={filesMeta[file.path]?.alt || ''}
          onChange={(e) => updateFileMeta(file.path, 'alt', e.currentTarget.value)}
        />
      </Box>
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
    >
      <Box pos="relative">
        <LoadingOverlay visible={loading} />
        
        {error && (
          <Box mb="md">
            <Text color="red" size="sm">
              <IconAlertCircle size={16} style={{ marginRight: 5 }} />
              {error}
            </Text>
          </Box>
        )}
        
        <Stack gap="md">
          <Text fw={500}>Общие настройки изображений</Text>
          
          <Group grow>
            <Select
              label="Тип изображений"
              placeholder="Выберите тип"
              value={type}
              onChange={(value) => setType(value || 'content')}
              data={IMAGE_TYPES}
              required
            />
            
            <Select
              label="Раздел сайта"
              placeholder="Выберите раздел"
              value={section}
              onChange={(value) => setSection(value || 'general')}
              data={SECTIONS}
              required
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
          />
          
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
            
            <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
              {isDragActive ? (
                <IconUpload size={50} stroke={1.5} />
              ) : (
                <IconPhoto size={50} stroke={1.5} />
              )}

              <div>
                <Text size="xl" inline>
                  Перетащите изображения сюда
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  Перетащите изображения сюда или нажмите для выбора файлов
                </Text>
              </div>
            </Group>
          </Box>
          
          {files.length > 0 && (
            <>
              <Text fw={500}>Выбранные файлы ({files.length})</Text>
              
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {previews}
              </SimpleGrid>
            </>
          )}
          
          <Group justify="right" mt="md">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={files.length === 0}>
              Загрузить {files.length > 0 && `(${files.length})`}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
};

export default MediaUploader; 