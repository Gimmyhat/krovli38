import React, { useState } from 'react';
import { 
  Tabs, 
  Title, 
  Text, 
  Card, 
  Button, 
  Group, 
  TextInput, 
  Textarea, 
  LoadingOverlay, 
  Alert, 
  Container,
  Image,
  SimpleGrid,
  ActionIcon
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconPhoto } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Service } from '../types/content';
import { useContentSync } from '../hooks/useContentSync';
import { useLogger } from '../hooks/useLogger';
import CloudinaryPicker from '../components/Images/CloudinaryPicker';
import { ImageData } from '../api/imageApi';

const ContentEditor: React.FC = () => {
  const { content, loading, error, loadContent, updateServiceItem } = useContentSync();
  const [activeTab, setActiveTab] = useState<string | null>('services');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imagePickerOpened, setImagePickerOpened] = useState(false);
  const logger = useLogger();

  const handleServiceEdit = (service: Service) => {
    setEditingService({ ...service });
  };

  const handleServiceUpdate = async () => {
    if (!editingService) return;
    
    try {
      await updateServiceItem(editingService.id, editingService);
      
      setEditingService(null);
      notifications.show({
        title: 'Успешно',
        message: 'Услуга успешно обновлена',
        color: 'green',
        icon: <IconCheck size="1.1rem" />
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      notifications.show({
        title: 'Ошибка',
        message: `Не удалось обновить услугу: ${errorMessage}`,
        color: 'red',
        icon: <IconAlertCircle size="1.1rem" />
      });
    }
  };

  const handleServiceCancel = () => {
    setEditingService(null);
  };

  const handleServiceChange = (field: keyof Service, value: string) => {
    if (editingService) {
      setEditingService({ ...editingService, [field]: value });
    }
  };

  const handleImageSelect = (image: ImageData) => {
    if (editingService) {
      setEditingService({ ...editingService, image: image.secure_url });
      setImagePickerOpened(false);
    }
  };

  if (loading && !content) {
    return <LoadingOverlay visible={true} />;
  }

  if (error && !content) {
    return (
      <Alert color="red" title="Ошибка загрузки" icon={<IconAlertCircle size="1rem" />}>
        {error}
        <Button variant="outline" color="red" onClick={loadContent} mt="md">
          Попробовать снова
        </Button>
      </Alert>
    );
  }

  return (
    <Container size="xl">
      <Title order={1} mb="lg">Редактор контента</Title>
      <Text color="dimmed" mb="xl">
        Здесь вы можете редактировать содержимое различных разделов сайта
      </Text>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="services">Услуги</Tabs.Tab>
          <Tabs.Tab value="benefits">Преимущества</Tabs.Tab>
          <Tabs.Tab value="types">Виды работ</Tabs.Tab>
          <Tabs.Tab value="hero">Главный экран</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="services" pt="xl">
          <Title order={2} mb="md">Наши услуги</Title>
          
          {editingService ? (
            <Card withBorder p="xl" radius="md" mb="xl">
              <Title order={3} mb="md">Редактирование услуги</Title>
              
              <TextInput
                label="Название"
                value={editingService.title}
                onChange={(e) => handleServiceChange('title', e.target.value)}
                mb="md"
              />
              
              <Textarea
                label="Описание"
                value={editingService.description}
                onChange={(e) => handleServiceChange('description', e.target.value)}
                mb="md"
                minRows={3}
              />
              
              <Group align="flex-end" mb="md">
                <TextInput
                  label="Путь к изображению"
                  value={editingService.image}
                  onChange={(e) => handleServiceChange('image', e.target.value)}
                  style={{ flex: 1 }}
                  placeholder="/images/services/service-1.jpg"
                  rightSection={
                    <ActionIcon onClick={() => setImagePickerOpened(true)}>
                      <IconPhoto size="1.1rem" />
                    </ActionIcon>
                  }
                />
              </Group>

              {editingService.image && (
                <Card withBorder mb="md">
                  <Card.Section>
                    <Image
                      src={editingService.image}
                      height={200}
                      alt={editingService.title}
                    />
                  </Card.Section>
                </Card>
              )}
              
              <TextInput
                label="Иконка"
                value={editingService.icon}
                onChange={(e) => handleServiceChange('icon', e.target.value)}
                mb="xl"
                placeholder="Shield"
              />
              
              <Group justify="flex-end">
                <Button variant="outline" onClick={handleServiceCancel}>Отмена</Button>
                <Button onClick={handleServiceUpdate}>Сохранить</Button>
              </Group>
            </Card>
          ) : content?.services && (
            <SimpleGrid cols={3}>
              {content.services.map((service) => (
                <Card key={service.id} withBorder p="md" radius="md">
                  <Card.Section>
                    <Image
                      src={service.image}
                      height={160}
                      alt={service.title}
                    />
                  </Card.Section>
                  
                  <Title order={4} mt="md">{service.title}</Title>
                  <Text size="sm" color="dimmed" mt="xs" mb="md">
                    {service.description}
                  </Text>
                  
                  <Button 
                    variant="light" 
                    fullWidth 
                    onClick={() => handleServiceEdit(service)}
                  >
                    Редактировать
                  </Button>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="benefits" pt="xl">
          <Title order={2} mb="md">Преимущества</Title>
          <Text>Функционал редактирования преимуществ в разработке</Text>
        </Tabs.Panel>

        <Tabs.Panel value="types" pt="xl">
          <Title order={2} mb="md">Виды работ</Title>
          <Text>Функционал редактирования видов работ в разработке</Text>
        </Tabs.Panel>

        <Tabs.Panel value="hero" pt="xl">
          <Title order={2} mb="md">Главный экран</Title>
          <Text>Функционал редактирования главного экрана в разработке</Text>
        </Tabs.Panel>
      </Tabs>

      {/* Модальное окно выбора изображения */}
      <CloudinaryPicker
        opened={imagePickerOpened}
        onClose={() => setImagePickerOpened(false)}
        onSelect={handleImageSelect}
        title="Выберите изображение для услуги"
        filter={{ section: 'services' }}
      />
    </Container>
  );
};

export default ContentEditor; 