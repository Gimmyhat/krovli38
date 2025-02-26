import { Title, SimpleGrid, Card, Text, Group } from '@mantine/core';
import { IconUsers, IconCheck, IconClock } from '@tabler/icons-react';

const Dashboard = () => {
  // TODO: Получать реальные данные с сервера
  const stats = [
    {
      title: 'Всего заявок',
      value: '12',
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Выполнено',
      value: '5',
      icon: IconCheck,
      color: 'green',
    },
    {
      title: 'В обработке',
      value: '7',
      icon: IconClock,
      color: 'orange',
    },
  ];

  return (
    <>
      <Title order={2} mb="xl">Панель управления</Title>
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {stats.map((stat) => (
          <Card key={stat.title} withBorder p="md">
            <Group>
              <stat.icon size={32} color={stat.color} stroke={1.5} />
              <div>
                <Text size="xs" c="dimmed">{stat.title}</Text>
                <Text size="xl" fw={700}>{stat.value}</Text>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
};

export default Dashboard; 