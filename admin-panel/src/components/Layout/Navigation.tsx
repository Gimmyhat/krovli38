import { UnstyledButton, Group, Text } from '@mantine/core';
import { Link, useLocation } from 'react-router-dom';
import { IconDashboard, IconUsers, IconLogout, IconList, IconPhoto, IconSettings, IconPhotoEdit } from '@tabler/icons-react';

interface NavigationProps {
  onLogout: () => void;
}

const Navigation = ({ onLogout }: NavigationProps) => {
  const location = useLocation();

  const links = [
    { label: 'Панель управления', icon: IconDashboard, path: '/admin/dashboard' },
    { label: 'Заявки', icon: IconUsers, path: '/admin/requests' },
    { label: 'Логи', icon: IconList, path: '/admin/logs' },
    { label: 'Изображения', icon: IconPhoto, path: '/admin/images' },
    { label: 'Галерея', icon: IconPhotoEdit, path: '/admin/gallery' },
    { label: 'Настройки сайта', icon: IconSettings, path: '/admin/settings' }
  ];

  const NavButton = ({ label, icon: Icon, path, onClick }: { 
    label: string;
    icon: typeof IconDashboard;
    path?: string;
    onClick?: () => void;
  }) => {
    const isActive = path ? location.pathname === path : false;

    if (!path) {
      return (
        <UnstyledButton
          onClick={onClick}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: 'inherit',
            textDecoration: 'none',
            marginBottom: '8px'
          }}
        >
          <Group>
            <Icon size="1rem" stroke={1.5} />
            <Text size="sm">{label}</Text>
          </Group>
        </UnstyledButton>
      );
    }

    return (
      <Link
        to={path}
        style={{
          display: 'block',
          width: '100%',
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: isActive ? 'var(--mantine-color-blue-light)' : 'transparent',
          color: isActive ? 'var(--mantine-color-blue-filled)' : 'inherit',
          textDecoration: 'none',
          marginBottom: '8px'
        }}
      >
        <Group>
          <Icon size="1rem" stroke={1.5} />
          <Text size="sm">{label}</Text>
        </Group>
      </Link>
    );
  };

  return (
    <div>
      {links.map((link) => (
        <NavButton
          key={link.path}
          label={link.label}
          icon={link.icon}
          path={link.path}
        />
      ))}
      
      <NavButton
        label="Выйти"
        icon={IconLogout}
        onClick={onLogout}
      />
    </div>
  );
};

export default Navigation; 