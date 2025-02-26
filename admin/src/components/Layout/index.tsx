import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, Burger, Group, Title } from '@mantine/core';
import { useAuth } from '../../hooks/useAuth';
import Navigation from './Navigation';

const Layout = () => {
  const [opened, setOpened] = useState(false);
  const { user, logout } = useAuth();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened(!opened)}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3}>Админ-панель</Title>
          </Group>
          <Group>
            {user?.name}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Navigation onLogout={logout} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout; 