import React, { useState } from 'react';
import {
  Box,
  Button,
  Group,
  Paper,
  Text,
  Title,
  TextInput,
  Stack,
  Alert,
  LoadingOverlay,
  Badge,
  Progress,
  Chip,
  Code,
  Collapse,
  Switch
} from '@mantine/core';
import { 
  IconFileImport, 
  IconAlertCircle, 
  IconRefresh, 
  IconFolderPlus, 
  IconCheck, 
  IconX,
  IconSearch
} from '@tabler/icons-react';
import { importLocalImages } from '../../api/imageApi';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { API } from '../../constants';
import { LOCAL_IMAGE_DIRECTORIES } from '../../constants';

interface ImportLocalImagesProps {
  onCompleted?: () => void;
}

/**
 * Компонент для импорта локальных изображений в Cloudinary
 */
const ImportLocalImages: React.FC<ImportLocalImagesProps> = ({ onCompleted }) => {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);
  const [directories, setDirectories] = useState<string[]>(LOCAL_IMAGE_DIRECTORIES);
  const [customDirectory, setCustomDirectory] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [foundImagePaths, setFoundImagePaths] = useState<string[]>([]);
  const [deepScan, setDeepScan] = useState(false);

  // Добавление пользовательской директории
  const handleAddDirectory = () => {
    if (customDirectory && !directories.includes(customDirectory)) {
      setDirectories([...directories, customDirectory]);
      setCustomDirectory('');
    }
  };

  // Удаление директории из списка
  const handleRemoveDirectory = (dir: string) => {
    setDirectories(directories.filter(d => d !== dir));
  };

  // Сброс к директориям по умолчанию
  const handleReset = () => {
    setDirectories(LOCAL_IMAGE_DIRECTORIES);
    setCustomDirectory('');
    setError(null);
    setSuccess(false);
    setResults(null);
    setFoundImagePaths([]);
  };

  // Проверка наличия изображений перед импортом
  const handleCheckImages = async () => {
    try {
      setChecking(true);
      setError(null);
      setFoundImagePaths([]);
      
      const token = localStorage.getItem('token');
      
      const { data } = await axios.post(
        `${API.BASE_URL}/images/check-paths`, 
        { 
          directories,
          deep: deepScan
        },
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      
      if (data.imagePaths && data.imagePaths.length > 0) {
        setFoundImagePaths(data.imagePaths);
        notifications.show({
          title: 'Проверка завершена',
          message: `Найдено ${data.imagePaths.length} изображений`,
          color: 'green'
        });
      } else {
        setError('Изображения не найдены. Попробуйте указать другие директории или включить глубокое сканирование.');
        notifications.show({
          title: 'Проверка завершена',
          message: 'Изображения не найдены',
          color: 'yellow'
        });
      }
    } catch (error: any) {
      console.error('Ошибка при проверке директорий:', error);
      setError(error.message || 'Произошла ошибка при проверке директорий');
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось проверить директории',
        color: 'red'
      });
    } finally {
      setChecking(false);
    }
  };

  // Запуск импорта
  const handleStartImport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setResults(null);
      
      // Запускаем импорт
      const response = await importLocalImages(directories);
      
      setResults(response.results);
      setSuccess(true);
      
      notifications.show({
        title: 'Импорт завершен',
        message: `Успешно: ${response.results.success}, Пропущено: ${response.results.skipped}, Ошибок: ${response.results.error}`,
        color: 'green',
        icon: <IconCheck size={18} />
      });
      
      // Вызываем callback при успешном завершении
      if (onCompleted) {
        onCompleted();
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при импорте изображений');
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось импортировать изображения. Проверьте консоль.',
        color: 'red',
        icon: <IconX size={18} />
      });
    } finally {
      setLoading(false);
    }
  };

  // Расчет прогресса импорта
  const calculateProgress = () => {
    if (!results) return 0;
    return Math.floor(((results.success + results.skipped) / results.total) * 100);
  };

  return (
    <Paper p="md" withBorder>
      <Box pos="relative">
        <LoadingOverlay visible={loading || checking} />
        
        <Title order={4} mb="md">Импорт локальных изображений</Title>
        
        <Text mb="md">
          Импортируйте локальные изображения из директорий проекта в Cloudinary для централизованного управления всеми изображениями.
        </Text>
        
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
        
        {success && results && (
          <Alert 
            icon={<IconCheck size={16} />} 
            title="Импорт завершен" 
            color="green" 
            mb="md"
            withCloseButton
            onClose={() => setSuccess(false)}
          >
            <Text mb="xs">Результаты импорта:</Text>
            <Group gap="xs">
              <Badge color="green">Успешно: {results.success}</Badge>
              <Badge color="yellow">Пропущено: {results.skipped}</Badge>
              <Badge color="red">Ошибок: {results.error}</Badge>
              <Badge color="blue">Всего: {results.total}</Badge>
            </Group>
            
            <Progress 
              value={calculateProgress()} 
              mt="md" 
              color={results.error > 0 ? "yellow" : "green"} 
              striped
              animated
            />
          </Alert>
        )}
        
        {foundImagePaths.length > 0 && (
          <Alert 
            icon={<IconCheck size={16} />} 
            title="Найдены изображения" 
            color="blue" 
            mb="md"
            withCloseButton
            onClose={() => setFoundImagePaths([])}
          >
            <Text mb="xs">Найдено {foundImagePaths.length} изображений:</Text>
            <Box
              style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                padding: '8px', 
                border: '1px solid #eee', 
                borderRadius: '4px', 
                background: '#f9f9f9'
              }}
            >
              {foundImagePaths.slice(0, 20).map((path, index) => (
                <Text key={index} size="xs">{path}</Text>
              ))}
              {foundImagePaths.length > 20 && (
                <Text size="xs" c="dimmed" mt="xs">
                  ...и еще {foundImagePaths.length - 20} файлов
                </Text>
              )}
            </Box>
          </Alert>
        )}
        
        <Stack>
          <Box>
            <Text fw={500} mb="xs">Директории для сканирования:</Text>
            <Group gap="xs" mb="sm">
              {directories.map((dir) => (
                <Chip
                  key={dir}
                  checked={true}
                  variant="filled"
                  size="sm"
                  radius="sm"
                >
                  <Group gap={5}>
                    <span>{dir}</span>
                    <IconX 
                      size={14} 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleRemoveDirectory(dir)}
                    />
                  </Group>
                </Chip>
              ))}
            </Group>
          </Box>
          
          <Button 
            variant="light" 
            size="xs" 
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Скрыть дополнительные настройки' : 'Показать дополнительные настройки'}
          </Button>
          
          <Collapse in={showAdvanced}>
            <Box mb="md">
              <Text fw={500} mb="xs">Добавить директорию:</Text>
              <Group>
                <TextInput
                  placeholder="Введите путь к директории (например, public/assets)"
                  value={customDirectory}
                  onChange={(e) => setCustomDirectory(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  leftSection={<IconFolderPlus size={16} />}
                  onClick={handleAddDirectory}
                  disabled={!customDirectory}
                >
                  Добавить
                </Button>
              </Group>
              
              <Group mt="md" align="center">
                <Switch
                  label="Глубокое сканирование файловой системы"
                  checked={deepScan}
                  onChange={(e) => setDeepScan(e.currentTarget.checked)}
                />
                <Text size="xs" c="dimmed">
                  Будут просканированы все поддиректории (занимает больше времени)
                </Text>
              </Group>
              
              <Text mt="xs" size="xs" c="dimmed">
                Укажите пути относительно корня проекта (папки server). 
                Например: <Code>public/images</Code> или <Code>src/assets</Code>
              </Text>
            </Box>
          </Collapse>
          
          <Group justify="right" mt="md">
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={handleReset}
            >
              Сбросить
            </Button>
            
            <Button
              variant="light"
              leftSection={<IconSearch size={16} />}
              onClick={handleCheckImages}
              loading={checking}
            >
              Проверить наличие
            </Button>
            
            <Button
              leftSection={<IconFileImport size={16} />}
              onClick={handleStartImport}
              loading={loading}
              disabled={checking}
            >
              Начать импорт
            </Button>
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ImportLocalImages; 