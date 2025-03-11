import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Title, 
  Text, 
  Tabs, 
  Container, 
  Paper, 
  Divider, 
  Button, 
  Group, 
  TextInput, 
  Textarea, 
  NumberInput, 
  ColorInput, 
  Switch, 
  Select, 
  LoadingOverlay, 
  Alert,
  Grid
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconSettings, 
  IconPhoto, 
  IconPalette, 
  IconTypography, 
  IconLayoutDashboard, 
  IconBrandTailwind, 
  IconAlertCircle,
  IconDeviceFloppy,
  IconArrowBackUp 
} from '@tabler/icons-react';
import { SiteSettingData, fetchSettings, updateSettingsGroup, resetSettings } from '../api/settingsApi';
import CloudinaryPicker from '../components/Images/CloudinaryPicker';

// Группы настроек для вкладок
interface SettingsGroup {
  value: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  { 
    value: 'general', 
    label: 'Общие', 
    icon: <IconSettings size={16} />, 
    description: 'Основные настройки сайта: название, описание, ключевые слова' 
  },
  { 
    value: 'hero', 
    label: 'Главный экран', 
    icon: <IconLayoutDashboard size={16} />, 
    description: 'Настройки главного баннера: заголовок, подзаголовок, кнопка' 
  },
  { 
    value: 'colors', 
    label: 'Цвета', 
    icon: <IconPalette size={16} />, 
    description: 'Цветовая схема сайта: основные цвета, фон, текст' 
  },
  { 
    value: 'typography', 
    label: 'Типографика', 
    icon: <IconTypography size={16} />, 
    description: 'Настройки шрифтов и текста' 
  },
  { 
    value: 'gallery', 
    label: 'Галерея', 
    icon: <IconPhoto size={16} />, 
    description: 'Настройки раздела галереи' 
  },
  { 
    value: 'footer', 
    label: 'Подвал', 
    icon: <IconBrandTailwind size={16} />, 
    description: 'Настройки подвала сайта' 
  }
];

// Компонент для рендеринга поля настройки в зависимости от типа
const SettingField: React.FC<{
  setting: SiteSettingData;
  value: any;
  onChange: (value: any) => void;
}> = ({ setting, value, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  switch (setting.type) {
    case 'text':
      return (
        <TextInput
          label={setting.name}
          description={setting.description}
          placeholder={`Введите ${setting.name.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          mb="md"
        />
      );
    
    case 'textarea':
      return (
        <Textarea
          label={setting.name}
          description={setting.description}
          placeholder={`Введите ${setting.name.toLowerCase()}`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          mb="md"
          minRows={3}
          maxRows={6}
          autosize
        />
      );
    
    case 'number':
      return (
        <NumberInput
          label={setting.name}
          description={setting.description}
          placeholder={`Введите ${setting.name.toLowerCase()}`}
          value={value}
          onChange={onChange}
          mb="md"
          min={setting.options?.min}
          max={setting.options?.max}
        />
      );
    
    case 'boolean':
      return (
        <Switch
          label={setting.name}
          description={setting.description}
          checked={value}
          onChange={(e) => onChange(e.currentTarget.checked)}
          mb="md"
        />
      );
    
    case 'color':
      return (
        <ColorInput
          label={setting.name}
          description={setting.description}
          placeholder={`Выберите ${setting.name.toLowerCase()}`}
          value={value}
          onChange={onChange}
          mb="md"
          swatches={['#1E3A8A', '#3B82F6', '#60A5FA', '#BAE6FD', '#FFFFFF', '#F9FAFB', '#111827', '#9CA3AF']}
          format="hex"
        />
      );
    
    case 'select':
      return (
        <Select
          label={setting.name}
          description={setting.description}
          placeholder={`Выберите ${setting.name.toLowerCase()}`}
          data={setting.options?.choices || []}
          value={value}
          onChange={onChange}
          mb="md"
          searchable
          clearable
        />
      );
    
    case 'image':
      return (
        <Box mb="md">
          <TextInput
            label={setting.name}
            description={setting.description}
            placeholder="Путь к изображению"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rightSection={
              <Button 
                variant="subtle" 
                size="xs" 
                onClick={() => setPickerOpen(true)}
              >
                Выбрать
              </Button>
            }
          />
          {value && (
            <Box mt="xs">
              <img 
                src={value.startsWith('http') ? value : `${window.location.origin}${value}`} 
                alt={setting.name} 
                style={{ maxHeight: '100px', maxWidth: '100%', borderRadius: '4px' }} 
              />
            </Box>
          )}
          
          {/* Компонент выбора изображения из Cloudinary */}
          <CloudinaryPicker 
            opened={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(image) => {
              onChange(image.secure_url);
            }}
            title={`Выберите ${setting.name.toLowerCase()}`}
            filter={{ 
              type: setting.group === 'hero' ? 'banner' : undefined,
              section: setting.group 
            }}
          />
        </Box>
      );
    
    default:
      return <Text color="dimmed">Неизвестный тип настройки: {setting.type}</Text>;
  }
};

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [settings, setSettings] = useState<SiteSettingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [initializingSettings, setInitializingSettings] = useState(false);
  
  // Загрузка настроек при изменении активной вкладки
  useEffect(() => {
    const loadSettings = async () => {
      if (!activeTab) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchSettings(activeTab);
        setSettings(data);
        
        // Заполняем форму значениями
        const newFormData: Record<string, any> = {};
        data.forEach(setting => {
          newFormData[setting.key] = setting.value;
        });
        setFormData(newFormData);
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        setError('Не удалось загрузить настройки. Пожалуйста, попробуйте еще раз.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [activeTab]);
  
  // Обработчик изменения значения настройки
  const handleSettingChange = (key: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [key]: value
    }));
  };
  
  // Сохранение настроек
  const handleSave = async () => {
    if (!activeTab) return;
    
    setSaving(true);
    
    try {
      await updateSettingsGroup(activeTab, formData);
      
      notifications.show({
        title: 'Настройки сохранены',
        message: 'Изменения успешно сохранены',
        color: 'green'
      });

      // Проверяем, есть ли среди обновленных настроек связанные с изображениями
      const hasImageSettings = Object.keys(formData).some(key => 
        key.includes('logo') || key.includes('image') || key.includes('background')
      );

      // Если обновлены изображения, запускаем очистку кэша и сигнализируем об обновлении
      if (hasImageSettings) {
        try {
          // Отправляем сигнал на фронтенд о необходимости обновления настроек
          // Это простой запрос, который заставит сервер обновить настройки
          const response = await fetch('/api/settings/clear-cache', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            notifications.show({
              title: 'Кэш очищен',
              message: 'Изменения применены на сайте',
              color: 'green'
            });
          }
        } catch (cacheError) {
          console.error('Ошибка при очистке кэша:', cacheError);
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сохранить настройки',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Сброс настроек к значениям по умолчанию
  const handleReset = async () => {
    if (!activeTab || !window.confirm('Вы уверены, что хотите сбросить настройки к значениям по умолчанию?')) {
      return;
    }
    
    setSaving(true);
    
    try {
      await resetSettings(activeTab);
      
      // Перезагружаем настройки
      const data = await fetchSettings(activeTab);
      setSettings(data);
      
      // Обновляем форму
      const newFormData: Record<string, any> = {};
      data.forEach(setting => {
        newFormData[setting.key] = setting.value;
      });
      setFormData(newFormData);
      
      notifications.show({
        title: 'Настройки сброшены',
        message: 'Настройки успешно сброшены к значениям по умолчанию',
        color: 'blue'
      });
    } catch (error) {
      console.error('Ошибка при сбросе настроек:', error);
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось сбросить настройки',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Функция для инициализации настроек сайта из захардкоженных значений
  const handleInitializeSettings = async () => {
    if (!window.confirm('Эта операция перезапишет все настройки. Вы уверены, что хотите продолжить?')) {
      return;
    }
    
    setInitializingSettings(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Требуется авторизация');
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      // После успешной инициализации перезагружаем все настройки
      if (activeTab) {
        const data = await fetchSettings(activeTab);
        setSettings(data);
        
        // Обновляем форму
        const newFormData: Record<string, any> = {};
        data.forEach(setting => {
          newFormData[setting.key] = setting.value;
        });
        setFormData(newFormData);
      }
      
      notifications.show({
        title: 'Успех',
        message: 'Настройки успешно инициализированы из значений по умолчанию',
        color: 'green'
      });
    } catch (error) {
      console.error('Ошибка при инициализации настроек:', error);
      
      notifications.show({
        title: 'Ошибка',
        message: 'Не удалось инициализировать настройки',
        color: 'red'
      });
    } finally {
      setInitializingSettings(false);
    }
  };
  
  // Находим активную группу настроек
  const activeGroup = SETTINGS_GROUPS.find(group => group.value === activeTab);
  
  return (
    <Container size="xl" py="md">
      <Box mb="lg">
        <Title order={2} mb="sm">Настройки сайта</Title>
        <Text color="dimmed">
          Управляйте контентом и внешним видом сайта
        </Text>
        
        {/* Кнопка для инициализации настроек */}
        <Paper shadow="xs" p="md" withBorder mt="md">
          <Text fw={500} mb="sm">Инициализация настроек</Text>
          <Text size="sm" color="dimmed" mb="md">
            Используйте эту функцию для сброса всех настроек к значениям по умолчанию.
            Это полезно при первом запуске или если вы хотите полностью сбросить все настройки.
          </Text>
          <Button 
            variant="filled" 
            color="orange"
            onClick={handleInitializeSettings}
            loading={initializingSettings}
          >
            Инициализировать настройки
          </Button>
        </Paper>
      </Box>
      
      <Paper shadow="xs" p="md" withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            {SETTINGS_GROUPS.map(group => (
              <Tabs.Tab 
                key={group.value} 
                value={group.value} 
                leftSection={group.icon}
              >
                {group.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          
          {SETTINGS_GROUPS.map(group => (
            <Tabs.Panel key={group.value} value={group.value} pt="md">
              <Box pos="relative" mt="md">
                <LoadingOverlay visible={loading || saving} />
                
                {error && (
                  <Alert icon={<IconAlertCircle size={16} />} title="Ошибка" color="red" mb="md">
                    {error}
                  </Alert>
                )}
                
                {activeGroup && (
                  <Box mb="md">
                    <Text size="xl" fw={500}>{activeGroup.label}</Text>
                    <Text color="dimmed" size="sm">{activeGroup.description}</Text>
                    <Divider my="md" />
                  </Box>
                )}
                
                <Grid>
                  {settings.map(setting => (
                    <Grid.Col key={setting.key} span={{ base: 12, md: 6, lg: 6 }}>
                      <SettingField
                        setting={setting}
                        value={formData[setting.key]}
                        onChange={(value) => handleSettingChange(setting.key, value)}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Box>
              
              <Group justify="flex-end" mt="xl">
                <Button 
                  variant="light" 
                  color="red" 
                  onClick={handleReset}
                  leftSection={<IconArrowBackUp size={16} />}
                  loading={saving}
                >
                  Сбросить
                </Button>
                <Button 
                  onClick={handleSave}
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={saving}
                >
                  Сохранить
                </Button>
              </Group>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Paper>
    </Container>
  );
};

export default Settings; 