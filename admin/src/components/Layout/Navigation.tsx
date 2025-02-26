import { NavLink } from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconDashboard, IconUsers, IconLogout } from '@tabler/icons-react';

interface NavigationProps {
  onLogout: () => void;
}

const Navigation = ({ onLogout }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: 'Панель управления', icon: IconDashboard, path: '/dashboard' },
    { label: 'Заявки', icon: IconUsers, path: '/requests' },
  ];

  return (
    <div>
      {links.map((link) => (
        <NavLink
          key={link.path}
          label={link.label}
          leftSection={<link.icon size="1rem" stroke={1.5} />}
          active={location.pathname === link.path}
          onClick={() => navigate(link.path)}
        />
      ))}
      
      <NavLink
        label="Выйти"
        leftSection={<IconLogout size="1rem" stroke={1.5} />}
        onClick={onLogout}
        color="red"
      />
    </div>
  );
};

export default Navigation; 