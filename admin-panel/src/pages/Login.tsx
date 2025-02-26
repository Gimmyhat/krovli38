import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        notifications.show({
          title: 'Успешно',
          message: 'Добро пожаловать в админ-панель',
          color: 'green',
        });
        // Используем window.location для полного обновления страницы
        window.location.href = '/dashboard';
      } else {
        notifications.show({
          title: 'Ошибка',
          message: 'Неверный email или пароль',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Ошибка',
        message: 'Произошла ошибка при входе',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2}>
        Вход в админ-панель
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="admin@krovli38.ru"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Пароль"
            placeholder="Ваш пароль"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Войти
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 