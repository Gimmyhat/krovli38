import React, { useState } from 'react';
import {
  Box, Button, Group, Text, Image, Modal,
  Paper, ActionIcon, Stack
} from '@mantine/core';
import { IconTrash, IconEdit, IconPhoto, IconExternalLink } from '@tabler/icons-react';
import { MediaMetadata } from '../../services/mediaService';
import MediaManager from './MediaManager';

interface MediaSelectorProps {
  value?: MediaMetadata;
  onChange: (media: MediaMetadata | null) => void;
  label?: string;
  required?: boolean;
  width?: number | string;
  height?: number | string;
  ratio?: number;
  placeholder?: string;
  error?: string;
}

const MediaSelector: React.FC<MediaSelectorProps> = ({
  value,
  onChange,
  label = 'Изображение',
  required = false,
  width = '100%',
  height = 200,
  ratio,
  placeholder = 'Выберите изображение',
  error
}) => {
  const [opened, setOpened] = useState(false);
  const [previewOpened, setPreviewOpened] = useState(false);
  
  // Обработчик выбора изображения
  const handleSelect = (media: MediaMetadata) => {
    onChange(media);
    setOpened(false);
  };
  
  // Обработчик удаления изображения
  const handleClear = () => {
    onChange(null);
  };
  
  // Открытие изображения в новой вкладке
  const openImageInNewTab = () => {
    if (value?.urls?.original) {
      window.open(value.urls.original, '_blank');
    }
  };

  return (
    <Box>
      {label && (
        <Text size="sm" fw={500} mb={5}>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </Text>
      )}
      
      <Paper
        withBorder
        p={value ? 0 : 'md'}
        style={{
          width,
          height: value ? 'auto' : height,
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: ratio ? `${ratio}` : undefined
        }}
      >
        {value ? (
          <>
            <Image
              src={value.urls?.thumbnail || `/uploads/${value.thumbnailName}`}
              alt={value.alt || value.originalName}
              height={height}
              fit="cover"
              style={{ cursor: 'pointer' }}
              onClick={() => setPreviewOpened(true)}
            />
            
            <Group justify="space-between" p="xs" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)' }}>
              <Text size="xs" color="white" truncate style={{ maxWidth: 150 }}>
                {value.title || value.originalName}
              </Text>
              <Group gap={4}>
                <ActionIcon size="sm" variant="transparent" color="white" onClick={() => setOpened(true)}>
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon size="sm" variant="transparent" color="white" onClick={openImageInNewTab}>
                  <IconExternalLink size={16} />
                </ActionIcon>
                <ActionIcon size="sm" variant="transparent" color="white" onClick={handleClear}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Group>
          </>
        ) : (
          <Stack align="center" justify="center" style={{ height: '100%' }}>
            <IconPhoto size={24} stroke={1.5} opacity={0.3} />
            <Text color="dimmed" size="sm" ta="center">{placeholder}</Text>
            <Button variant="light" size="compact" mt={5} onClick={() => setOpened(true)}>
              Выбрать изображение
            </Button>
          </Stack>
        )}
      </Paper>
      
      {error && (
        <Text size="xs" color="red" mt={5}>
          {error}
        </Text>
      )}
      
      {/* Модальное окно выбора изображения */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Выбор изображения"
        size="xl"
        fullScreen
      >
        <MediaManager
          standalone={false}
          onSelect={handleSelect}
          title="Выберите изображение"
        />
      </Modal>
      
      {/* Модальное окно предпросмотра */}
      {value && (
        <Modal
          opened={previewOpened}
          onClose={() => setPreviewOpened(false)}
          title={value.title || value.originalName}
          size="lg"
        >
          <Box>
            <Image
              src={value.urls?.original || `/uploads/${value.fileName}`}
              alt={value.alt || value.originalName}
              fit="contain"
              style={{ maxHeight: '70vh' }}
            />
            
            <Stack gap="xs" mt="md">
              <Text size="sm">
                <b>Оригинальное имя:</b> {value.originalName}
              </Text>
              {value.alt && (
                <Text size="sm">
                  <b>Alt текст:</b> {value.alt}
                </Text>
              )}
              {value.width && value.height && (
                <Text size="sm">
                  <b>Размеры:</b> {value.width}x{value.height}px
                </Text>
              )}
              <Text size="sm">
                <b>Размер файла:</b> {(value.size / 1024).toFixed(1)} КБ
              </Text>
              <Group gap={4}>
                <Button
                  variant="light"
                  leftSection={<IconExternalLink size={16} />}
                  onClick={openImageInNewTab}
                  size="xs"
                >
                  Открыть оригинал
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default MediaSelector; 