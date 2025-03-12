import React from 'react';
import { 
  Container, Title, Text, Paper, Breadcrumbs, 
  Anchor, Space
} from '@mantine/core';
import { Link } from 'react-router-dom';
import MediaManager from '../components/Media/MediaManager';

const MediaPage: React.FC = () => {
  const items = [
    { title: 'Главная', href: '/' },
    { title: 'Медиа-библиотека', href: '/media' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <Container size="xl" py="md">
      <Breadcrumbs separator="→" mb="lg">{items}</Breadcrumbs>
      
      <Title order={1} mb="sm">Медиа-библиотека</Title>
      <Text color="dimmed" mb="xl">
        Управление изображениями и медиафайлами, загруженными на сайт
      </Text>
      
      <Paper shadow="xs" p={0}>
        <MediaManager />
      </Paper>
      
      <Space h="xl" />
    </Container>
  );
};

export default MediaPage; 