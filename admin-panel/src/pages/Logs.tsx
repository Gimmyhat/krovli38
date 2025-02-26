import { useEffect, useState } from 'react';
import { 
  Title, Paper, TextInput, Button, Group, Select, Table, Badge, 
  Text, Modal, LoadingOverlay, Code
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { 
  IconSearch, IconTrash, IconRefresh, IconDownload
} from '@tabler/icons-react';
import axios from 'axios';
import logger from '../utils/logger';
import { API_URL } from '../config';

interface LogFile {
  name: string;
  size: number;
  updatedAt: string;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: Record<string, any>;
}

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Форматирование размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Определение цвета для уровня лога
const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'error':
      return 'red';
    case 'warn':
      return 'yellow';
    case 'info':
      return 'blue';
    case 'debug':
      return 'gray';
    default:
      return 'dark';
  }
};

export default function Logs() {
  // Состояние
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [currentLogEntry, setCurrentLogEntry] = useState<LogEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Получение списка файлов логов
  useEffect(() => {
    fetchLogFiles();
  }, []);

  // Получение содержимого выбранного файла логов
  useEffect(() => {
    if (selectedFile) {
      fetchLogContent(selectedFile);
    }
  }, [selectedFile]);

  // Получение списка файлов логов
  const fetchLogFiles = async () => {
    try {
      setLoading(true);
      setError('');
      logger.debug('Fetching log files');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/logs/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Проверяем структуру ответа
      const files = response.data.files || response.data;
      setLogFiles(files);
      
      // Выбор первого файла по умолчанию, если есть файлы
      if (files.length > 0 && !selectedFile) {
        setSelectedFile(files[0].name);
      }
      
      logger.debug(`Fetched ${files.length} log files`);
    } catch (err) {
      logger.error('Error fetching log files', err);
      
      // Добавляем более подробную информацию об ошибке
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response ? 
          `Ошибка ${err.response.status}: ${err.response.statusText}` : 
          'Сетевая ошибка';
        setError(`Ошибка при загрузке списка файлов логов: ${errorMessage}`);
        console.error('API Error:', err.response?.data);
      } else {
        setError('Ошибка при загрузке списка файлов логов');
      }
      
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось загрузить список файлов логов',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Получение содержимого файла логов
  const fetchLogContent = async (filename: string) => {
    try {
      setLoading(true);
      setError('');
      logger.debug(`Fetching content for log file: ${filename}`);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/logs/content/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Проверяем структуру ответа
      const logEntries = response.data.logs || response.data;
      setLogs(logEntries);
      applyFilters(logEntries, search, levelFilter);
      
      logger.debug(`Fetched ${logEntries.length} log entries from ${filename}`);
    } catch (err) {
      logger.error(`Error fetching log content: ${filename}`, err);
      
      // Добавляем более подробную информацию об ошибке
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response ? 
          `Ошибка ${err.response.status}: ${err.response.statusText}` : 
          'Сетевая ошибка';
        setError(`Ошибка при загрузке содержимого файла лога ${filename}: ${errorMessage}`);
        console.error('API Error:', err.response?.data);
      } else {
        setError(`Ошибка при загрузке содержимого файла лога: ${filename}`);
      }
      
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось загрузить содержимое файла лога',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Очистка файла лога
  const clearLogFile = async () => {
    if (!selectedFile) return;
    
    try {
      setDeleteLoading(true);
      logger.debug(`Clearing log file: ${selectedFile}`);
      
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/logs/clear/${selectedFile}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLogs([]);
      setFilteredLogs([]);
      
      showNotification({
        title: 'Успех',
        message: 'Файл лога успешно очищен',
        color: 'green'
      });
      
      // Обновляем список файлов, так как размер файла изменился
      fetchLogFiles();
      
    } catch (err) {
      logger.error(`Error clearing log file: ${selectedFile}`, err);
      showNotification({
        title: 'Ошибка',
        message: 'Не удалось очистить файл лога',
        color: 'red'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Обработка изменения поиска
  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters(logs, value, levelFilter);
  };

  // Обработка изменения фильтра по уровню лога
  const handleLevelFilterChange = (value: string | null) => {
    setLevelFilter(value || 'all');
    applyFilters(logs, search, value || 'all');
  };

  // Применение фильтров
  const applyFilters = (logsArray: LogEntry[], searchValue: string, levelValue: string) => {
    let filtered = [...logsArray];
    
    // Фильтрация по поиску
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        log => 
          (log.message && log.message.toLowerCase().includes(searchLower)) ||
          (log.meta && JSON.stringify(log.meta).toLowerCase().includes(searchLower))
      );
    }
    
    // Фильтрация по уровню лога
    if (levelValue !== 'all') {
      filtered = filtered.filter(log => log.level.toLowerCase() === levelValue.toLowerCase());
    }
    
    setFilteredLogs(filtered);
  };

  // Скачать лог-файл
  const downloadLogFile = () => {
    if (!selectedFile) return;
    
    const fileContent = JSON.stringify(logs, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Открытие модального окна для просмотра деталей лога
  const openLogModal = (log: LogEntry) => {
    setCurrentLogEntry(log);
    open();
  };

  // Уровни логов для фильтра
  const levelOptions = [
    { value: 'all', label: 'Все уровни' },
    { value: 'error', label: 'Ошибки' },
    { value: 'warn', label: 'Предупреждения' },
    { value: 'info', label: 'Информация' },
    { value: 'debug', label: 'Отладка' }
  ];

  return (
    <div>
      <LoadingOverlay visible={loading} />
      
      <Title order={2} mb="xl">Системные логи</Title>
      
      {/* Выбор файла и действия */}
      <Paper shadow="xs" p="md" mb="lg">
        <Group justify="space-between">
          <Select
            placeholder="Выберите файл логов"
            value={selectedFile}
            onChange={setSelectedFile}
            data={logFiles.map(file => ({
              value: file.name,
              label: `${file.name} (${formatFileSize(file.size)}, ${formatDate(file.updatedAt)})`
            }))}
            style={{ width: 350 }}
          />
          
          <Group gap="xs">
            <Button 
              variant="outline" 
              leftSection={<IconRefresh size="1rem" />}
              onClick={() => selectedFile && fetchLogContent(selectedFile)}
            >
              Обновить
            </Button>
            
            <Button 
              variant="outline" 
              leftSection={<IconDownload size="1rem" />}
              onClick={downloadLogFile}
              disabled={!selectedFile || logs.length === 0}
            >
              Скачать
            </Button>
            
            <Button 
              color="red" 
              leftSection={<IconTrash size="1rem" />}
              onClick={clearLogFile}
              loading={deleteLoading}
              disabled={!selectedFile || logs.length === 0}
            >
              Очистить
            </Button>
          </Group>
        </Group>
      </Paper>
      
      {/* Фильтры */}
      <Paper shadow="xs" p="md" mb="lg">
        <Group justify="space-between">
          <TextInput
            placeholder="Поиск по сообщению или метаданным"
            value={search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            leftSection={<IconSearch size="0.9rem" />}
            style={{ flexGrow: 1 }}
          />
          <Select
            placeholder="Фильтр по уровню"
            value={levelFilter}
            onChange={handleLevelFilterChange}
            data={levelOptions}
            style={{ width: 200 }}
            clearable={false}
          />
        </Group>
      </Paper>
      
      {/* Таблица логов */}
      {error ? (
        <Text color="red" mb="md">{error}</Text>
      ) : (
        <Paper shadow="xs" p="md">
          <Table>
            <thead>
              <tr>
                <th style={{ width: 180 }}>Время</th>
                <th style={{ width: 100 }}>Уровень</th>
                <th>Сообщение</th>
                <th style={{ width: 80 }}>Детали</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>
                    {loading ? 'Загрузка...' : 'Логи не найдены'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestamp}</td>
                    <td>
                      <Badge color={getLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                    </td>
                    <td>
                      {log.message && log.message.length > 100
                        ? `${log.message.substring(0, 100)}...`
                        : log.message}
                    </td>
                    <td>
                      <Button 
                        variant="subtle" 
                        size="xs"
                        onClick={() => openLogModal(log)}
                      >
                        Детали
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Paper>
      )}
      
      {/* Модальное окно для просмотра деталей лога */}
      <Modal
        opened={opened}
        onClose={close}
        title="Детали записи лога"
        size="lg"
      >
        {currentLogEntry && (
          <div>
            <Group grow mb="md">
              <div>
                <Text fw={700} size="sm">Время</Text>
                <Text>{currentLogEntry.timestamp}</Text>
              </div>
              <div>
                <Text fw={700} size="sm">Уровень</Text>
                <Badge color={getLevelColor(currentLogEntry.level)}>
                  {currentLogEntry.level}
                </Badge>
              </div>
            </Group>
            
            <div style={{ marginBottom: '1rem' }}>
              <Text fw={700} size="sm">Сообщение</Text>
              <Text>{currentLogEntry.message}</Text>
            </div>
            
            {currentLogEntry.meta && Object.keys(currentLogEntry.meta).length > 0 && (
              <div>
                <Text fw={700} size="sm" mb="xs">Метаданные</Text>
                <Code block style={{ maxHeight: 300, overflow: 'auto' }}>
                  {JSON.stringify(currentLogEntry.meta, null, 2)}
                </Code>
              </div>
            )}
            
            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={close}>
                Закрыть
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
} 