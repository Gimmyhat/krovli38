import { useEffect, useState } from 'react';
import { Title, SimpleGrid, Card, Text, Group, Skeleton, Alert, Paper } from '@mantine/core';
import { IconUsers, IconCheck, IconClock, IconAlertCircle } from '@tabler/icons-react';
import axios from '../utils/axios';
import { API_URL } from '../config';
import { notifications } from '@mantine/notifications';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logger from '../utils/logger';

interface Request {
  _id: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  chartData: Array<{
    date: string;
    count: number;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('Начало загрузки данных для панели управления');
      const response = await axios.get<{ requests: Request[] }>(`${API_URL}/requests`);
      
      const requests = response.data.requests;
      logger.debug('Данные получены успешно', { requestsCount: requests.length });
      
      // Подсчет статистики
      const total = requests.length;
      const completed = requests.filter(r => r.status === 'completed').length;
      const inProgress = requests.filter(r => ['new', 'in_progress'].includes(r.status)).length;

      // Подготовка данных для графика
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const chartData = last7Days.map(date => ({
        date,
        count: requests.filter(r => r.createdAt.startsWith(date)).length
      }));

      setStats({ total, completed, inProgress, chartData });
    } catch (err) {
      logger.error('Ошибка при загрузке данных', { error: err });
      const message = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных';
      setError(message);
      notifications.show({
        title: 'Ошибка',
        message,
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Обновляем данные каждые 5 минут
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Ошибка" color="red">
        {error}
      </Alert>
    );
  }

  const statCards = [
    {
      title: 'Всего заявок',
      value: stats?.total ?? 0,
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Выполнено',
      value: stats?.completed ?? 0,
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'В обработке',
      value: stats?.inProgress ?? 0,
      icon: IconClock,
      color: 'orange',
    },
  ];

  return (
    <>
      <Title order={2} mb="xl">Панель управления</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
        {statCards.map((stat) => (
          <Card key={stat.title} withBorder p="md">
            <Skeleton visible={loading}>
              <Group>
                <stat.icon size={32} color={stat.color} stroke={1.5} />
                <div>
                  <Text size="xs" c="dimmed">{stat.title}</Text>
                  <Text size="xl" fw={700}>{stat.value}</Text>
                </div>
              </Group>
            </Skeleton>
          </Card>
        ))}
      </SimpleGrid>

      <Paper withBorder p="md">
        <Title order={3} mb="md">Динамика заявок за последние 7 дней</Title>
        <Skeleton visible={loading} height={300}>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.chartData ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date: string) => {
                    const [_, month, day] = date.split('-');
                    return `${day}.${month}`;
                  }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  labelFormatter={(date: string) => {
                    const [year, month, day] = date.split('-');
                    return `${day}.${month}.${year}`;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#1c7ed6" 
                  strokeWidth={2}
                  name="Количество заявок"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Skeleton>
      </Paper>
    </>
  );
};

export default Dashboard; 