# Настройка Cloudinary для локальной разработки

## Проблема

При попытке загрузить изображения в галерею на локальной машине возникает ошибка 500 (Internal Server Error):

```
POST http://localhost/api/images/cloudinary 500 (Internal Server Error)
```

Это происходит из-за того, что в локальной среде используются тестовые учетные данные Cloudinary, которые не работают для создания изображений.

## Решение

1. Создайте аккаунт на [Cloudinary](https://cloudinary.com/) (если у вас его еще нет)
2. Получите ваши учетные данные Cloudinary:
   - Cloud Name
   - API Key
   - API Secret

3. Обновите файл `server/.env` с вашими учетными данными:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=krovli38_preset
```

4. Обновите файл `docker/.env.local` с теми же учетными данными:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Перезапустите сервер:

```bash
# Если вы используете Docker
docker-compose -f docker/docker-compose.local.yml down
docker-compose -f docker/docker-compose.local.yml up -d

# Если вы запускаете сервер напрямую
cd server
npm run dev
```

## Проверка настройки

После настройки учетных данных Cloudinary, вы можете проверить, что все работает правильно:

1. Откройте админ-панель
2. Перейдите в раздел "Галерея" или "Изображения"
3. Попробуйте загрузить новое изображение

Если все настроено правильно, изображение должно успешно загрузиться и появиться в галерее.

## Дополнительная информация

- Cloudinary используется для хранения и управления изображениями в проекте
- Все изображения физически хранятся в Cloudinary, а в базе данных хранятся только ссылки на них
- Для работы с Cloudinary в проекте используется официальная библиотека `cloudinary`
- Конфигурация Cloudinary находится в файле `server/src/config/cloudinary.ts` 