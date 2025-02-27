import { useEffect, useState, useMemo } from 'react';
import { 
  Title, Paper, TextInput, Button, Group, Select, Badge, 
  Text, Modal, Code, ScrollArea
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { 
  IconSearch, IconTrash, IconRefresh, IconDownload
} from '@tabler/icons-react';
import axios from 'axios';
import logger from '../utils/logger';
import { API_URL } from '../config';
import { DataTable } from 'mantine-datatable';

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

interface TableRecord extends LogEntry {
  id: string;
}

// Форматирование даты
const formatDate = (dateString: string) => {
  try {
    if (!dateString) return 'Дата не указана';
    
    // Проверяем, является ли строка timestamp в миллисекундах
    const timestamp = Number(dateString);
    if (!isNaN(timestamp) && timestamp > 0) {
      return new Intl.DateTimeFormat('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(timestamp));
    }

    // Пробуем распарсить дату в формате winston logger (YYYY-MM-DD HH:mm:ss)
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (match) {
      const [_, year, month, day, hour, minute, second] = match;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('ru', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(date);
      }
    }

    // Пробуем распарсить как ISO дату
    const date = new Date(dateString);
    if (!isNaN(date.getTime()) && date.getTime() > 0) {
      return new Intl.DateTimeFormat('ru', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    }

    return 'Некорректная дата';
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return 'Ошибка даты';
  }
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
  // Состояния
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [opened, { open, close }] = useDisclosure(false);
  const [currentLogEntry, setCurrentLogEntry] = useState<LogEntry | null>(null);

  // Вычисляем данные для текущей страницы
  const paginatedLogs = useMemo(() => {
    if (!filteredLogs?.length) return [];
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filteredLogs.slice(startIndex, endIndex).map((log, index) => ({
      ...log,
      id: `${log.timestamp}-${log.level}-${index}-${Math.random().toString(36).substr(2, 9)}`
    }));
  }, [filteredLogs, page, pageSize]);

  // Эффект для загрузки файлов логов при монтировании
  useEffect(() => {
    fetchLogFiles();
  }, []);

  // Эффект для загрузки содержимого лога при выборе файла
  useEffect(() => {
    if (selectedFile) {
      fetchLogContent(selectedFile);
    }
  }, [selectedFile]);

  // Эффект для фильтрации логов
  useEffect(() => {
    if (logs.length > 0) {
      const filtered = applyFilters(logs, search, levelFilter || '');
      setFilteredLogs(filtered);
      setPage(1); // Сброс на первую страницу при изменении фильтров
    }
  }, [logs, search, levelFilter]);

  // Получение списка файлов логов
  const fetchLogFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/logs/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logger.debug('Получены файлы логов:', response.data);
      
      if (Array.isArray(response.data.files)) {
        setLogFiles(response.data.files);
        // Если есть файлы и нет выбранного файла, выбираем первый
        if (response.data.files.length > 0 && !selectedFile) {
          setSelectedFile(response.data.files[0].name);
        }
      } else {
        throw new Error('Неверный формат данных от сервера');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при загрузке файлов логов';
      logger.error('Ошибка загрузки файлов логов:', error);
      setError(errorMessage);
      showNotification({
        title: 'Ошибка',
        message: errorMessage,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  // Получение содержимого файла логов
  const fetchLogContent = async (filename: string) => {
    if (!filename) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/logs/content/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logger.debug('Получено содержимое лога:', {
        filename,
        entriesCount: response.data?.logs?.length
      });

      if (Array.isArray(response.data.logs)) {
        setLogs(response.data.logs);
        // Применяем текущие фильтры к новым данным
        const filtered = applyFilters(response.data.logs, search, levelFilter || '');
        setFilteredLogs(filtered);
        setPage(1); // Сброс на первую страницу при загрузке новых данных
      } else {
        throw new Error('Неверный формат данных лога от сервера');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Ошибка при загрузке содержимого лога';
      logger.error('Ошибка загрузки содержимого лога:', error);
      setError(errorMessage);
      showNotification({
        title: 'Ошибка',
        message: errorMessage,
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
  };

  // Обработка изменения фильтра по уровню лога
  const handleLevelFilterChange = (value: string | null) => {
    setLevelFilter(value);
  };

  // Обработчик изменения страницы
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Применение фильтров
  const applyFilters = (logsArray: LogEntry[], searchValue: string, levelValue: string): LogEntry[] => {
    return logsArray.filter(log => {
      const matchesSearch = searchValue === '' || 
        log.message?.toLowerCase().includes(searchValue.toLowerCase()) ||
        log.level?.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesLevel = levelValue === '' || levelValue === 'all' || 
        log.level?.toLowerCase() === levelValue.toLowerCase();
      
      return matchesSearch && matchesLevel;
    });
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

  return (
    <>
      <Title order={2} mb="xl">Логи системы</Title>

      {error && (
        <Text color="red" mb="md">{error}</Text>
      )}

      <Paper shadow="xs" p="md" mb="md">
        <Group>
          <Select
            placeholder="Выберите файл"
            data={logFiles.map(file => ({
              value: file.name,
              label: `${file.name} (${formatFileSize(file.size)})`
            }))}
            value={selectedFile}
            onChange={setSelectedFile}
            style={{ minWidth: 250 }}
          />

          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => selectedFile && fetchLogContent(selectedFile)}
            loading={loading}
            variant="light"
          >
            Обновить
          </Button>

          <Button
            leftSection={<IconTrash size={16} />}
            onClick={() => selectedFile && clearLogFile()}
            loading={deleteLoading}
            color="red"
            variant="light"
          >
            Очистить
          </Button>

          {selectedFile && (
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={downloadLogFile}
              variant="light"
            >
              Скачать
            </Button>
          )}
        </Group>
      </Paper>

      <Paper shadow="xs" p="md" mb="md">
        <Group mb="md">
          <TextInput
            placeholder="Поиск в логах..."
            value={search}
            onChange={(event) => handleSearchChange(event.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ flexGrow: 1 }}
          />

          <Select
            placeholder="Уровень"
            value={levelFilter}
            onChange={handleLevelFilterChange}
            data={[
              { value: 'all', label: 'Все' },
              { value: 'info', label: 'Info' },
              { value: 'warn', label: 'Warning' },
              { value: 'error', label: 'Error' },
              { value: 'debug', label: 'Debug' }
            ]}
            style={{ minWidth: 150 }}
          />
        </Group>

        <ScrollArea h={600}>
          <DataTable<TableRecord>
            minHeight={150}
            records={paginatedLogs}
            columns={[
              {
                accessor: 'timestamp',
                title: 'Дата',
                render: (record: TableRecord) => formatDate(record?.timestamp || '')
              },
              {
                accessor: 'level',
                title: 'Уровень',
                render: (record: TableRecord) => (
                  <Badge color={getLevelColor(record?.level || 'info')}>
                    {record?.level || 'info'}
                  </Badge>
                )
              },
              {
                accessor: 'message',
                title: 'Сообщение',
                render: (record: TableRecord) => record?.message || 'Нет сообщения'
              },
              {
                accessor: 'actions',
                title: 'Действия',
                render: (record: TableRecord) => (
                  <Button 
                    variant="subtle" 
                    size="sm" 
                    onClick={() => record && openLogModal(record)}
                    disabled={!record}
                  >
                    Детали
                  </Button>
                )
              }
            ]}
            fetching={loading}
            noRecordsText={loading ? 'Загрузка...' : !selectedFile ? 'Выберите файл' : filteredLogs?.length === 0 ? 'Логи не найдены' : ' '}
            totalRecords={filteredLogs?.length || 0}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={handlePageChange}
          />
        </ScrollArea>
      </Paper>

      <Modal 
        opened={opened} 
        onClose={close} 
        title="Детали лога" 
        size="xl"
        styles={{
          body: {
            maxHeight: 'calc(90vh - 80px)',
            overflowY: 'auto'
          }
        }}
      >
        {currentLogEntry && (
          <div>
            <Paper withBorder p="md" mb="md">
              <Group mb="md">
                <div>
                  <Text size="sm" c="dimmed">Время:</Text>
                  <Text fw={500}>{formatDate(currentLogEntry.timestamp)}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Уровень:</Text>
                  <Badge size="lg" color={getLevelColor(currentLogEntry.level)}>
                    {currentLogEntry.level}
                  </Badge>
                </div>
              </Group>
            </Paper>

            <Paper withBorder p="md" mb="md">
              <Text size="sm" c="dimmed" mb="xs">Сообщение:</Text>
              <Code 
                block 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {currentLogEntry.message}
              </Code>
            </Paper>

            {currentLogEntry.meta && (
              <Paper withBorder p="md">
                <Text size="sm" c="dimmed" mb="xs">Дополнительные данные:</Text>
                <Code 
                  block 
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {JSON.stringify(currentLogEntry.meta, null, 2)}
                </Code>
              </Paper>
            )}
          </div>
        )}
      </Modal>
    </>
  );
} 