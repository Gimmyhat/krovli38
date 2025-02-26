import { useState, useEffect } from 'react';
import { Title, Table, Text, Button, Group, Select, Badge, Card, ScrollArea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import logger from '../utils/logger';

// Типы для логов
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

const Logs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');

  // Загрузка логов
  const loadLogs = () => {
    try {
      const allLogs = logger.getLogs();
      setLogs(allLogs);
      notifications.show({
        title: 'Успешно',
        message: `Загружено ${allLogs.length} записей логов`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить логи',
        color: 'red',
      });
    }
  };

  // Очистка логов
  const clearLogs = () => {
    try {
      logger.clearLogs();
      setLogs([]);
      notifications.show({
        title: 'Успешно',
        message: 'Логи очищены',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось очистить логи',
        color: 'red',
      });
    }
  };

  // Загрузка логов при монтировании компонента
  useEffect(() => {
    loadLogs();
  }, []);

  // Фильтрация логов
  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.level === filter);

  // Получение цвета для уровня логирования
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'blue';
      case 'info': return 'green';
      case 'warn': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
      <Title order={2} mb="xl">Логи приложения</Title>
      
      <Card withBorder mb="md">
        <Group justify="space-between">
          <Group>
            <Select
              label="Фильтр по уровню"
              value={filter}
              onChange={(value) => setFilter(value || 'all')}
              data={[
                { value: 'all', label: 'Все' },
                { value: 'debug', label: 'Debug' },
                { value: 'info', label: 'Info' },
                { value: 'warn', label: 'Warning' },
                { value: 'error', label: 'Error' },
              ]}
              style={{ width: 200 }}
            />
          </Group>
          <Group>
            <Button onClick={loadLogs} variant="outline">Обновить</Button>
            <Button onClick={clearLogs} color="red" variant="outline">Очистить</Button>
          </Group>
        </Group>
      </Card>
      
      <Card withBorder>
        <ScrollArea h={500}>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Время</th>
                <th>Уровень</th>
                <th>Сообщение</th>
                <th>Данные</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.timestamp)}</td>
                    <td>
                      <Badge color={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                    </td>
                    <td>{log.message}</td>
                    <td>
                      {log.data && (
                        <pre style={{ maxWidth: '300px', overflow: 'auto' }}>
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <Text ta="center" c="dimmed">Нет доступных логов</Text>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </Card>
    </>
  );
};

export default Logs; 