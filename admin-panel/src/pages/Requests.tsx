import { useState, useEffect } from 'react';
import { 
  Title, 
  Paper, 
  TextInput, 
  Group, 
  Select, 
  Table, 
  ActionIcon, 
  Badge, 
  LoadingOverlay, 
  Modal, 
  Textarea, 
  Button,
  Text
} from '@mantine/core';
import { IconSearch, IconEdit, IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import logger from '../utils/logger';
import { API_URL } from '../config';

// Интерфейс для заявки
interface Request {
  _id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Опции статусов заявок
const statusOptions = [
  { value: 'all', label: 'Все статусы' },
  { value: 'new', label: 'Новая' },
  { value: 'processing', label: 'В обработке' },
  { value: 'completed', label: 'Выполнена' },
  { value: 'canceled', label: 'Отменена' }
];

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

// Генерация бейджа для статуса
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'new':
      return <Badge color="blue">Новая</Badge>;
    case 'processing':
      return <Badge color="yellow">В обработке</Badge>;
    case 'completed':
      return <Badge color="green">Выполнена</Badge>;
    case 'canceled':
      return <Badge color="red">Отменена</Badge>;
    default:
      return <Badge>Неизвестно</Badge>;
  }
};

const Requests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Модальное окно для детальной информации
  const [opened, { open, close }] = useDisclosure(false);
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Загрузка заявок
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.debug('Fetching requests');
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Проверяем структуру ответа и получаем массив заявок
      const requestsData = response.data.requests || response.data;
      setRequests(requestsData);
      applyFilters(requestsData, search, statusFilter);
      logger.debug(`Fetched ${requestsData.length} requests`);
      
    } catch (err) {
      logger.error('Error fetching requests', err);
      
      // Добавляем более подробную информацию об ошибке
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response ? 
          `Ошибка ${err.response.status}: ${err.response.statusText}` : 
          'Сетевая ошибка';
        setError(`Ошибка при загрузке заявок: ${errorMessage}`);
        console.error('API Error:', err.response?.data);
      } else {
        setError('Ошибка при загрузке заявок');
      }
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось загрузить заявки',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Применение фильтров к списку заявок
  const applyFilters = (requestsArray: Request[], searchValue: string, statusValue: string) => {
    let filtered = [...requestsArray];
    
    // Фильтр по поисковому запросу
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        req => 
          req.name.toLowerCase().includes(searchLower) || 
          req.phone.toLowerCase().includes(searchLower) || 
          req.message.toLowerCase().includes(searchLower)
      );
    }
    
    // Фильтр по статусу
    if (statusValue !== 'all') {
      filtered = filtered.filter(req => req.status === statusValue);
    }
    
    setFilteredRequests(filtered);
  };

  // Обработка изменения поискового запроса
  const handleSearchChange = (value: string) => {
    setSearch(value);
    applyFilters(requests, value, statusFilter);
  };

  // Обработка изменения фильтра по статусу
  const handleStatusFilterChange = (value: string | null) => {
    setStatusFilter(value || 'all');
    applyFilters(requests, search, value || 'all');
  };

  // Открытие модального окна для просмотра/редактирования заявки
  const openRequestModal = (request: Request, isDelete = false) => {
    setCurrentRequest(request);
    setEditedStatus(request.status);
    setEditedNotes(request.notes || '');
    setIsDeleteMode(isDelete);
    open();
  };

  // Обновление заявки
  const updateRequest = async () => {
    if (!currentRequest) return;
    
    try {
      setUpdateLoading(true);
      logger.debug(`Updating request ${currentRequest._id} status to ${editedStatus}`);
      
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/requests/${currentRequest._id}`,
        { status: editedStatus, notes: editedNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchRequests();
      close();
      
      notifications.show({
        title: 'Успех',
        message: 'Заявка успешно обновлена',
        color: 'green',
      });
      
    } catch (err) {
      logger.error(`Error updating request ${currentRequest._id}`, err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось обновить заявку',
        color: 'red',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Удаление заявки
  const deleteRequest = async () => {
    if (!currentRequest) return;
    
    try {
      setUpdateLoading(true);
      logger.debug(`Deleting request ${currentRequest._id}`);
      
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/requests/${currentRequest._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchRequests();
      close();
      
      notifications.show({
        title: 'Успех',
        message: 'Заявка успешно удалена',
        color: 'green',
      });
      
    } catch (err) {
      logger.error(`Error deleting request ${currentRequest._id}`, err);
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось удалить заявку',
        color: 'red',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  // Загрузка заявок при монтировании компонента
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <LoadingOverlay visible={loading} />
      
      <Title order={2} mb="xl">Управление заявками</Title>
      
      {/* Фильтры */}
      <Paper shadow="xs" p="md" mb="lg">
        <Group justify="space-between">
          <TextInput
            placeholder="Поиск по имени, телефону или сообщению"
            value={search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            leftSection={<IconSearch size="0.9rem" />}
            style={{ flexGrow: 1 }}
          />
          <Select
            placeholder="Фильтр по статусу"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            data={statusOptions}
            style={{ width: 200 }}
            clearable={false}
          />
        </Group>
      </Paper>
      
      {/* Таблица заявок */}
      {error ? (
        <Text color="red">{error}</Text>
      ) : (
        <Paper shadow="xs" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Дата</Table.Th>
                <Table.Th>Имя</Table.Th>
                <Table.Th>Телефон</Table.Th>
                <Table.Th>Сообщение</Table.Th>
                <Table.Th>Статус</Table.Th>
                <Table.Th style={{ width: 60 }}>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRequests.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    {loading ? 'Загрузка...' : 'Заявки не найдены'}
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredRequests.map((request) => (
                  <Table.Tr key={request._id}>
                    <Table.Td>{formatDate(request.createdAt)}</Table.Td>
                    <Table.Td>{request.name}</Table.Td>
                    <Table.Td>{request.phone}</Table.Td>
                    <Table.Td style={{ maxWidth: 250 }} title={request.message}>
                      {request.message.length > 50 
                        ? `${request.message.substring(0, 50)}...` 
                        : request.message}
                    </Table.Td>
                    <Table.Td>{getStatusBadge(request.status)}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          onClick={() => openRequestModal(request)}
                        >
                          <IconEdit size="1rem" />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          onClick={() => openRequestModal(request, true)}
                        >
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
      
      {/* Модальное окно для просмотра/редактирования заявки */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={isDeleteMode ? "Удаление заявки" : "Детали заявки"} 
        size={isDeleteMode ? 'sm' : 'md'}
      >
        {isDeleteMode ? (
          <div>
            <Text mb="md">
              Вы уверены, что хотите удалить заявку от <b>{currentRequest?.name}</b>?
            </Text>
            <Text mb="xl" color="dimmed" size="sm">
              Это действие нельзя отменить.
            </Text>
            
            <Group justify="flex-end" mt="xl">
              <Button variant="outline" onClick={close}>Отмена</Button>
              <Button color="red" onClick={deleteRequest} loading={updateLoading}>
                Удалить
              </Button>
            </Group>
          </div>
        ) : (
          <div>
            <Group grow mb="md">
              <div>
                <Text fw={700} size="sm">Имя</Text>
                <Text>{currentRequest?.name}</Text>
              </div>
              <div>
                <Text fw={700} size="sm">Телефон</Text>
                <Text>{currentRequest?.phone}</Text>
              </div>
            </Group>
            
            <div style={{ marginBottom: '1rem' }}>
              <Text fw={700} size="sm">Сообщение</Text>
              <Text>{currentRequest?.message}</Text>
            </div>
            
            <Group grow mb="md" mt="md">
              <div>
                <Text fw={700} size="sm">Дата создания</Text>
                <Text>{formatDate(currentRequest?.createdAt || '')}</Text>
              </div>
              <div>
                <Text fw={700} size="sm">Последнее обновление</Text>
                <Text>{formatDate(currentRequest?.updatedAt || '')}</Text>
              </div>
            </Group>
            
            <Select
              label="Статус"
              placeholder="Выберите статус"
              data={statusOptions.filter(option => option.value !== 'all')}
              value={editedStatus}
              onChange={(value) => setEditedStatus(value || '')}
              mb="md"
              required
            />
            
            <Textarea
              label="Примечания"
              placeholder="Дополнительная информация по заявке"
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.currentTarget.value)}
              minRows={3}
              mb="xl"
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={close}>Отмена</Button>
              <Button onClick={updateRequest} loading={updateLoading}>
                Сохранить
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Requests; 