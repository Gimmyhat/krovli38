import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Alert, 
  Stack, 
  List, 
  ThemeIcon, 
  Progress, 
  Badge, 
  LoadingOverlay,
} from '@mantine/core';
import { 
  IconPhotoSearch, 
  IconAlertCircle, 
  IconCheck, 
  IconX, 
  IconInfoCircle, 
  IconFolderSearch, 
  IconDatabase 
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../../config';

interface ScanResult {
  total: number;
  created: number;
  existing: number;
  errors: number;
  details: {
    path: string;
    status: 'created' | 'existing' | 'error';
    message: string;
    id?: string;
  }[];
}

const ImageScannerPanel: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [step, setStep] = useState<'idle' | 'scanning' | 'complete'>('idle');

  // Функция для запуска сканирования изображений
  const startScan = async () => {
    setError(null);
    setStep('scanning');

    try {
      // Запрос к API для сканирования изображений
      const response = await axios.get(`${API_URL}/images/scan`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setResult(response.data.data);
        notifications.show({
          title: 'Успешно',
          message: response.data.message,
          color: 'green',
          icon: <IconCheck size={18} />,
        });
      } else {
        throw new Error(response.data.message || 'Ошибка при сканировании изображений');
      }
    } catch (error: unknown) {
      console.error('Ошибка при сканировании изображений:', error);
      
      let errorMessage = 'Ошибка при сканировании изображений';
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось выполнить сканирование изображений',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setStep('complete');
    }
  };

  // Рендер результатов сканирования
  const renderResults = () => {
    if (!result) return null;

    // Расчет процентов для прогресс-бара
    const createdPercent = Math.round((result.created / result.total) * 100) || 0;
    const existingPercent = Math.round((result.existing / result.total) * 100) || 0;
    const errorPercent = Math.round((result.errors / result.total) * 100) || 0;

    return (
      <Stack gap="md">
        <Title order={4}>Результаты сканирования</Title>
        
        <Group grow>
          <Paper p="xs" withBorder>
            <Text fw={700} ta="center" size="lg">{result.total}</Text>
            <Text c="dimmed" ta="center" size="sm">Всего изображений</Text>
          </Paper>
          
          <Paper p="xs" withBorder>
            <Text fw={700} ta="center" size="lg" c="green">{result.created}</Text>
            <Text c="dimmed" ta="center" size="sm">Создано записей</Text>
          </Paper>
          
          <Paper p="xs" withBorder>
            <Text fw={700} ta="center" size="lg" c="blue">{result.existing}</Text>
            <Text c="dimmed" ta="center" size="sm">Уже существует</Text>
          </Paper>
          
          <Paper p="xs" withBorder>
            <Text fw={700} ta="center" size="lg" c="red">{result.errors}</Text>
            <Text c="dimmed" ta="center" size="sm">Ошибок</Text>
          </Paper>
        </Group>
        
        <Box>
          <Text mb="xs">Статистика обработки:</Text>
          <Progress.Root size="xl">
            <Progress.Section value={createdPercent} color="green">
              <Progress.Label>Создано ({createdPercent}%)</Progress.Label>
            </Progress.Section>
            <Progress.Section value={existingPercent} color="blue">
              <Progress.Label>Существует ({existingPercent}%)</Progress.Label>
            </Progress.Section>
            <Progress.Section value={errorPercent} color="red">
              <Progress.Label>Ошибки ({errorPercent}%)</Progress.Label>
            </Progress.Section>
          </Progress.Root>
        </Box>
        
        {result?.details && result.details.length > 0 && (
          <Box mt="md">
            <Title order={5} mb="xs">Детали обработки</Title>
            <List
              spacing="xs"
              size="sm"
              center
              icon={
                <ThemeIcon color="teal" size={24} radius="xl">
                  <IconInfoCircle size={16} />
                </ThemeIcon>
              }
            >
              {Array.isArray(result.details) && result.details.slice(0, 10).map((detail, index) => (
                <List.Item
                  key={index}
                  icon={
                    <ThemeIcon
                      color={
                        detail?.status === 'created' ? 'green' : detail?.status === 'existing' ? 'blue' : 'red'
                      }
                      size={24}
                      radius="xl"
                    >
                      {detail?.status === 'created' ? (
                        <IconCheck size={16} />
                      ) : detail?.status === 'existing' ? (
                        <IconInfoCircle size={16} />
                      ) : (
                        <IconX size={16} />
                      )}
                    </ThemeIcon>
                  }
                >
                  <Group>
                    <Text size="sm" lineClamp={1} style={{ flex: 1 }}>
                      {detail?.path || 'Неизвестный путь'}
                    </Text>
                    <Badge
                      color={
                        detail?.status === 'created' ? 'green' : detail?.status === 'existing' ? 'blue' : 'red'
                      }
                    >
                      {detail?.status === 'created'
                        ? 'Создано'
                        : detail?.status === 'existing'
                        ? 'Существует'
                        : 'Ошибка'}
                    </Badge>
                  </Group>
                </List.Item>
              ))}
              
              {result.details.length > 10 && (
                <List.Item>
                  <Text size="sm" c="dimmed" fs="italic">
                    И еще {result.details.length - 10} записей...
                  </Text>
                </List.Item>
              )}
            </List>
          </Box>
        )}
      </Stack>
    );
  };

  // Отображение шагов выполнения
  const renderStep = () => {
    switch (step) {
      case 'idle':
        return (
          <Box ta="center" py="xl">
            <IconFolderSearch size={48} style={{ marginBottom: 20, opacity: 0.7 }} />
            <Title order={4} mb="md">Сканирование изображений сайта</Title>
            <Text mb="xl">
              Эта функция сканирует файловую систему на сервере и создает записи в базе данных для всех найденных изображений.
              Используйте её для автоматической загрузки существующих изображений сайта в систему управления.
            </Text>
            <Group justify="center">
              <Button
                leftSection={<IconPhotoSearch size={16} />}
                onClick={startScan}
              >
                Начать сканирование
              </Button>
            </Group>
          </Box>
        );
        
      case 'scanning':
        return (
          <Box ta="center" py="xl">
            <Box pos="relative" h={200}>
              <LoadingOverlay visible loaderProps={{ size: 'md' }} />
              <IconDatabase size={48} style={{ marginBottom: 20, opacity: 0.7 }} />
              <Title order={4} mb="md">Сканирование изображений</Title>
              <Text>
                Пожалуйста, подождите. Сканирование файловой системы и создание записей в базе данных может занять некоторое время.
              </Text>
            </Box>
          </Box>
        );
        
      case 'complete':
        return (
          <Box>
            {error ? (
              <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mb="md">
                {error}
              </Alert>
            ) : (
              renderResults()
            )}
            
            <Group justify="center" mt="xl">
              <Button variant="outline" onClick={() => setStep('idle')}>
                Начать заново
              </Button>
            </Group>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Инструмент миграции изображений</Title>
      </Group>
      
      {renderStep()}
    </Paper>
  );
};

export default ImageScannerPanel; 