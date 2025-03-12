import React, { useState } from 'react';
import { 
  Box, Button, Group, Text, Image,
  SimpleGrid, Modal, Stack, TextInput, Select, MultiSelect,
  LoadingOverlay,
  FileInput,
  Divider,
  Textarea,
  Checkbox,
  Progress,
  Grid,
  Card,
  CloseButton
} from '@mantine/core';
import { useDropzone } from 'react-dropzone';
import { IconUpload, IconPhoto, IconX, IconAlertCircle, IconCheck, IconFileUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { mediaService, MediaMetadata } from '../../services/mediaService';
import { IMAGE_TYPES, SECTIONS, AVAILABLE_TAGS } from '../../constants';
import { uploadMultipleImages } from '../../api/imageApi';

export interface MediaUploaderProps {
  opened: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
  title?: string;
  multiple?: boolean;
  maxFiles?: number;
}

// Расширяем интерфейс для файлов с превью и метаданными
interface FileWithPreview extends Omit<File, 'type'> {
  preview?: string;
  id: string;
  title?: string;
  alt?: string;
  type?: string;
  section?: string;
  tags?: string[];
  originalType: string; // Сохраняем оригинальное свойство type из File
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  opened,
  onClose,
  onUploadSuccess,
  title = 'Загрузка изображений',
  multiple = true,
  maxFiles = 10
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sharedMetadata, setSharedMetadata] = useState({
    type: '',
    section: '',
    tags: [] as string[],
    title: '',
    alt: ''
  });
  const [useSharedMetadata, setUseSharedMetadata] = useState(true);
  
  const resetForm = () => {
    setFiles([]);
    setProgress(0);
    setSharedMetadata({
      type: '',
      section: '',
      tags: [],
      title: '',
      alt: ''
    });
  };
  
  const handleClose = () => {
    if (uploading) {
      if (!window.confirm('Загрузка в процессе. Вы уверены, что хотите закрыть окно?')) {
        return;
      }
    }
    resetForm();
    onClose();
  };
  
  const handleFileChange = (uploadedFiles: File[] | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    const newFiles: FileWithPreview[] = Array.from(uploadedFiles).map(file => {
      const fileWithPreview = {
        ...file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        originalType: file.type
      } as FileWithPreview;
      return fileWithPreview;
    });
    
    setFiles(prevFiles => {
      const combined = [...prevFiles, ...newFiles];
      // Ограничиваем количество файлов
      return combined.slice(0, maxFiles);
    });
  };
  
  const removeFile = (id: string) => {
    setFiles(prevFiles => {
      const filtered = prevFiles.filter(file => file.id !== id);
      // Освобождаем URL для предотвращения утечек памяти
      const fileToRemove = prevFiles.find(file => file.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return filtered;
    });
  };
  
  const updateFileMetadata = (id: string, field: string, value: string | string[]) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === id 
          ? { ...file, [field]: value } 
          : file
      )
    );
  };
  
  const handleUpload = async () => {
    if (files.length === 0) {
      notifications.show({
        title: 'Ошибка',
        message: 'Пожалуйста, выберите хотя бы одно изображение для загрузки',
        color: 'red'
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Подготавливаем файлы и их метаданные
      const filesToUpload = files.map(file => {
        const metadata = useSharedMetadata 
          ? { ...sharedMetadata } 
          : {
              type: file.type || '',
              section: file.section || '',
              tags: file.tags || [],
              title: file.title || '',
              alt: file.alt || ''
            };
        
        // Создаем реальный объект File с оригинальным типом
        const fileObject = new File(
          [file], 
          file.name, 
          { type: file.originalType }
        );
        
        return {
          file: fileObject,
          metadata
        };
      });
      
      // Последовательная загрузка с обновлением прогресса
      const results = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const { file, metadata } = filesToUpload[i];
        
        // Загружаем файл на сервер
        const uploadedImage = await uploadMultipleImages([file], metadata);
        results.push(uploadedImage);
        
        // Обновляем прогресс
        const currentProgress = Math.round(((i + 1) / filesToUpload.length) * 100);
        setProgress(currentProgress);
      }
      
      notifications.show({
        title: 'Успешно',
        message: `Загружено ${results.length} изображений`,
        color: 'green',
        icon: <IconCheck />
      });
      
      // Вызываем коллбэк успешной загрузки
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      // Закрываем модальное окно и сбрасываем форму
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      notifications.show({
        title: 'Ошибка загрузки',
        message: 'Произошла ошибка при загрузке изображений. Пожалуйста, попробуйте снова.',
        color: 'red',
        icon: <IconX />
      });
    } finally {
      setUploading(false);
    }
  };

  // Инициализируем dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Приводим File[] к FileWithPath[] и добавляем свойство path
      const filesWithPath = acceptedFiles.map(file => 
        Object.assign(file, { path: URL.createObjectURL(file) })
      ) as FileWithPreview[];
      
      handleFileChange(filesWithPath);
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
      <Box key={file.id} p="sm" style={{ border: '1px solid #eee', borderRadius: '4px' }}>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500} truncate style={{ maxWidth: '180px' }}>
            {file.name}
          </Text>
          <Button 
            variant="subtle" 
            color="red" 
            size="compact" 
            p={0} 
            onClick={() => removeFile(file.id)}
          >
            <IconX size={18} />
          </Button>
        </Group>
        
        <Image 
          src={file.preview}
          height={120}
          fit="contain"
          mb="xs"
          style={{ borderRadius: '4px' }}
        />
        
        <TextInput
          label="Название"
          placeholder="Введите название"
          size="xs"
          value={file.title || ''}
          onChange={(e) => updateFileMetadata(file.id, 'title', e.currentTarget.value)}
          mb="xs"
        />
        
        <TextInput
          label="Alt текст"
          placeholder="Текст для SEO"
          size="xs"
          value={file.alt || ''}
          onChange={(e) => updateFileMetadata(file.id, 'alt', e.currentTarget.value)}
        />
      </Box>
    );
  });

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="xl"
      padding="lg"
      centered
    >
      <Box>
        <Group mb="md">
          <FileInput
            placeholder="Выберите изображения"
            label="Изображения"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            leftSection={<IconFileUpload size={16} />}
            disabled={uploading || files.length >= maxFiles}
            value={null}
          />
          <Text fz="sm" c="dimmed" mt={25}>
            {files.length} из {maxFiles} изображений
          </Text>
        </Group>
        
        {files.length > 0 && (
          <>
            <Divider my="md" label="Общие метаданные" labelPosition="center" />
            
            <Checkbox
              label="Использовать общие метаданные для всех изображений"
              checked={useSharedMetadata}
              onChange={(event) => setUseSharedMetadata(event.currentTarget.checked)}
              mb="md"
            />
            
            {useSharedMetadata && (
              <Grid>
                <Grid.Col span={6}>
                  <Select
                    label="Тип изображения"
                    placeholder="Выберите тип"
                    data={IMAGE_TYPES}
                    value={sharedMetadata.type}
                    onChange={(value) => setSharedMetadata({...sharedMetadata, type: value || ''})}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Раздел"
                    placeholder="Выберите раздел"
                    data={SECTIONS}
                    value={sharedMetadata.section}
                    onChange={(value) => setSharedMetadata({...sharedMetadata, section: value || ''})}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <MultiSelect
                    label="Теги"
                    placeholder="Добавьте теги"
                    data={[]}
                    value={sharedMetadata.tags}
                    onChange={(value) => setSharedMetadata({...sharedMetadata, tags: value})}
                    getCreateLabel={(query: string) => `+ Создать "${query}"`}
                    onCreate={(query: string) => query}
                    searchable
                    clearable
                  />
                </Grid.Col>
              </Grid>
            )}
            
            <Divider my="md" label="Предпросмотр" labelPosition="center" />
            
            <Grid>
              {files.map((file) => (
                <Grid.Col span={4} key={file.id}>
                  <Card withBorder padding="sm">
                    <Card.Section>
                      <Box pos="relative">
                        <Image
                          src={file.preview}
                          alt={file.name}
                          height={150}
                          fit="contain"
                        />
                        <CloseButton
                          onClick={() => removeFile(file.id)}
                          pos="absolute"
                          right={5}
                          top={5}
                          style={{ background: 'rgba(255,255,255,0.8)' }}
                          disabled={uploading}
                        />
                      </Box>
                    </Card.Section>
                    
                    <Text fz="sm" fw={500} mt="xs" lineClamp={1} title={file.name}>
                      {file.name}
                    </Text>
                    
                    {!useSharedMetadata && (
                      <Stack mt="xs" gap="xs">
                        <TextInput
                          placeholder="Заголовок"
                          size="xs"
                          value={file.title || ''}
                          onChange={(e) => updateFileMetadata(file.id, 'title', e.target.value)}
                          disabled={uploading}
                        />
                        <TextInput
                          placeholder="Alt текст"
                          size="xs"
                          value={file.alt || ''}
                          onChange={(e) => updateFileMetadata(file.id, 'alt', e.target.value)}
                          disabled={uploading}
                        />
                        <Select
                          placeholder="Тип"
                          size="xs"
                          data={IMAGE_TYPES}
                          value={file.type || ''}
                          onChange={(value) => updateFileMetadata(file.id, 'type', value || '')}
                          disabled={uploading}
                          clearable
                        />
                        <Select
                          placeholder="Раздел"
                          size="xs"
                          data={SECTIONS}
                          value={file.section || ''}
                          onChange={(value) => updateFileMetadata(file.id, 'section', value || '')}
                          disabled={uploading}
                          clearable
                        />
                        <MultiSelect
                          placeholder="Теги"
                          size="xs"
                          data={[]}
                          value={file.tags || []}
                          onChange={(value) => updateFileMetadata(file.id, 'tags', value)}
                          disabled={uploading}
                          getCreateLabel={(query: string) => `+ Создать "${query}"`}
                          onCreate={(query: string) => query}
                          searchable
                        />
                      </Stack>
                    )}
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </>
        )}
        
        {uploading && (
          <Box my="md">
            <Text fz="sm" fw={500} mb="xs">
              Прогресс загрузки: {progress}%
            </Text>
            <Progress value={progress} animated />
          </Box>
        )}
        
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={handleClose} disabled={uploading}>
            Отмена
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || uploading}
            loading={uploading}
            leftSection={<IconUpload size={16} />}
            color="blue"
          >
            Загрузить
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default MediaUploader; 