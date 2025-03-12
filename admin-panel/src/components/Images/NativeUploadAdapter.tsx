import React from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import MediaUploader from '../Media/MediaUploader';

// Тот же интерфейс, что и у CloudinaryUploadWidgetComponent
export interface NativeUploadAdapterProps {
  opened: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  title?: string;
  multiple?: boolean;
  maxFiles?: number;
}

/**
 * Компонент-адаптер для замены Cloudinary виджета на нативный загрузчик
 * Имеет тот же интерфейс, что и CloudinaryUploadWidgetComponent,
 * но использует MediaUploader вместо Cloudinary
 */
const NativeUploadAdapter: React.FC<NativeUploadAdapterProps> = ({
  opened,
  onClose,
  onUploadSuccess,
  title = 'Загрузка изображений',
  multiple = true,
  maxFiles = 10
}) => {
  const handleUploadSuccess = () => {
    // Вызываем коллбэк для обновления списка изображений
    onUploadSuccess();
    
    // Показываем уведомление об успешной загрузке
    notifications.show({
      title: 'Успешно',
      message: 'Изображения загружены',
      color: 'green',
      icon: <IconCheck size={16} />
    });
  };

  return (
    <MediaUploader 
      opened={opened}
      onClose={onClose}
      onUploadSuccess={handleUploadSuccess}
      title={title}
      multiple={multiple}
      maxFiles={maxFiles}
    />
  );
};

export default NativeUploadAdapter; 