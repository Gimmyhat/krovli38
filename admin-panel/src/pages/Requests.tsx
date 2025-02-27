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
import axios from '../utils/axios';
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
  { value: 'in_progress', label: 'В обработке' },
  { value: 'completed', label: 'Выполнена' },
  { value: 'cancelled', label: 'Отменена' }
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

// Получение цвета и текста для статуса
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { color: string, label: string }> = {
    new: { color: 'blue', label: 'Новая' },
    in_progress: { color: 'yellow', label: 'В обработке' },
    completed: { color: 'green', label: 'Выполнена' },
    cancelled: { color: 'red', label: 'Отменена' }
  };

  const statusInfo = statusMap[status] || { color: 'gray', label: status };
  return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
};

const Requests = () => {
  logger.debug('Инициализация компонента Requests');
  
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
    logger.debug('Начало загрузки заявок');
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      logger.debug('Токен авторизации получен', { tokenExists: !!token });
      
      const response = await axios.get(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logger.debug('Ответ от сервера получен', { 
        status: response.status,
        dataExists: !!response.data,
        dataType: typeof response.data
      });
      
      // Проверяем структуру ответа и получаем массив заявок
      const requestsData = response.data.requests || response.data;
      logger.debug('Данные заявок обработаны', { 
        count: requestsData.length,
        firstRequest: requestsData[0] ? { 
          id: requestsData[0]._id,
          status: requestsData[0].status 
        } : 'нет заявок'
      });
      
      setRequests(requestsData);
      applyFilters(requestsData, search, statusFilter);
      
    } catch (err) {
      logger.error('Ошибка при загрузке заявок', { 
        error: err,
        isAxiosError: axios.isAxiosError(err),
        response: axios.isAxiosError(err) ? err.response?.data : null
      });
      
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response ? 
          `Ошибка ${err.response.status}: ${err.response.statusText}` : 
          'Сетевая ошибка';
        setError(`Ошибка при загрузке заявок: ${errorMessage}`);
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
      logger.debug('Загрузка заявок завершена');
    }
  };

  // Применение фильтров к списку заявок
  const applyFilters = (requestsArray: Request[], searchValue: string, statusValue: string) => {
    logger.debug('Применение фильтров', { searchValue, statusValue });
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
    
    logger.debug('Результаты фильтрации', { 
      totalRequests: requestsArray.length,
      filteredCount: filtered.length 
    });
    
    setFilteredRequests(filtered);
  };

  // Обработка изменения поискового запроса
  const handleSearchChange = (value: string) => {
    logger.debug('Изменение поискового запроса', { value });
    setSearch(value);
    applyFilters(requests, value, statusFilter);
  };

  // Обработка изменения фильтра по статусу
  const handleStatusFilterChange = (value: string | null) => {
    logger.debug('Изменение фильтра статуса', { value });
    setStatusFilter(value || 'all');
    applyFilters(requests, search, value || 'all');
  };

  // Открытие модального окна для просмотра/редактирования заявки
  const openRequestModal = (request: Request, isDelete = false) => {
    logger.debug('Открытие модального окна', { 
      requestId: request._id,
      isDelete,
      status: request.status 
    });
    setCurrentRequest(request);
    setEditedStatus(request.status);
    setEditedNotes(request.notes || '');
    setIsDeleteMode(isDelete);
    open();
  };

  // Обновление заявки
  const updateRequest = async () => {
    if (!currentRequest) return;
    
    logger.debug('Начало обновления заявки', { 
      requestId: currentRequest._id,
      newStatus: editedStatus,
      hasNotes: !!editedNotes 
    });
    
    try {
      setUpdateLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/requests/${currentRequest._id}`,
        { status: editedStatus, notes: editedNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      logger.debug('Заявка успешно обновлена');
      await fetchRequests();
      close();
      
      notifications.show({
        title: 'Успех',
        message: 'Заявка успешно обновлена',
        color: 'green',
      });
      
    } catch (err) {
      logger.error('Ошибка при обновлении заявки', { 
        error: err,
        requestId: currentRequest._id 
      });
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
    
    logger.debug('Начало удаления заявки', { requestId: currentRequest._id });
    
    try {
      setUpdateLoading(true);
      
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/requests/${currentRequest._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logger.debug('Заявка успешно удалена');
      await fetchRequests();
      close();
      
      notifications.show({
        title: 'Успех',
        message: 'Заявка успешно удалена',
        color: 'green',
      });
      
    } catch (err) {
      logger.error('Ошибка при удалении заявки', { 
        error: err,
        requestId: currentRequest._id 
      });
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
    logger.debug('Компонент смонтирован, загружаем заявки');
    fetchRequests();
  }, []);

  return (
    <>
      <Title order={2} mb="xl">Заявки</Title>

      {error && (
        <Paper p="md" mb="md" bg="red.1" c="red">
          <Text>{error}</Text>
        </Paper>
      )}

      <Paper p="md" mb="md">
        <Group>
          <TextInput
            placeholder="Поиск по имени, телефону или сообщению"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftSection={<IconSearch size="1rem" />}
            style={{ flex: 1 }}
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            data={statusOptions}
            style={{ width: 200 }}
          />
        </Group>
      </Paper>

      <Paper p="md" pos="relative">
        <LoadingOverlay visible={loading} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Дата</Table.Th>
              <Table.Th>Имя</Table.Th>
              <Table.Th>Телефон</Table.Th>
              <Table.Th>Сообщение</Table.Th>
              <Table.Th>Статус</Table.Th>
              <Table.Th>Действия</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRequests.map((request) => (
              <Table.Tr key={request._id}>
                <Table.Td>{formatDate(request.createdAt)}</Table.Td>
                <Table.Td>{request.name}</Table.Td>
                <Table.Td>{request.phone}</Table.Td>
                <Table.Td>{request.message}</Table.Td>
                <Table.Td>{getStatusBadge(request.status)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => openRequestModal(request)}
                    >
                      <IconEdit size="1rem" />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => openRequestModal(request, true)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal 
        opened={opened} 
        onClose={close}
        title={isDeleteMode ? "Удаление заявки" : "Редактирование заявки"}
      >
        {isDeleteMode ? (
          <div>
            <Text mb="md">Вы уверены, что хотите удалить эту заявку?</Text>
            <Group justify="flex-end">
              <Button variant="outline" onClick={close}>Отмена</Button>
              <Button color="red" onClick={deleteRequest} loading={updateLoading}>
                Удалить
              </Button>
            </Group>
          </div>
        ) : (
          <div>
            <Select
              label="Статус"
              value={editedStatus}
              onChange={(value) => setEditedStatus(value || '')}
              data={statusOptions.filter(option => option.value !== 'all')}
              mb="md"
            />
            <Textarea
              label="Заметки"
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              mb="md"
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
    </>
  );
};

export default Requests; 