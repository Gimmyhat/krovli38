# Настройка Cloudinary для локальной разработки

## Проблема

При попытке загрузить изображения локально вы можете столкнуться с ошибкой 500 Internal Server Error. Это происходит потому что для работы с изображениями проект использует Cloudinary, и необходимо настроить правильные учетные данные.

## Решение

В проекте уже настроены учетные данные Cloudinary для продакшн-среды. Для локальной разработки вам нужно использовать те же учетные данные:

1. Обновите файл `server/.env` со следующими настройками Cloudinary:

```
CLOUDINARY_CLOUD_NAME=dr0hjlr79
CLOUDINARY_API_KEY=586934817968136
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=krovli38_preset
```

2. Обновите файл `docker/.env.local` со следующими настройками Cloudinary:

```
CLOUDINARY_CLOUD_NAME=dr0hjlr79
CLOUDINARY_API_KEY=586934817968136
CLOUDINARY_API_SECRET=your_api_secret
VITE_CLOUDINARY_CLOUD_NAME=dr0hjlr79
VITE_CLOUDINARY_API_KEY=586934817968136
VITE_CLOUDINARY_UPLOAD_PRESET=krovli38_preset
```

> **Примечание**: Вам нужно получить значение `CLOUDINARY_API_SECRET` от администратора проекта, так как оно не включено в репозиторий по соображениям безопасности.

## Перезапуск сервера

После обновления файлов конфигурации, перезапустите сервер:

### Для Docker:

```bash
docker-compose -f docker/docker-compose.local.yml down
docker-compose -f docker/docker-compose.local.yml up -d
```

### Для прямого запуска сервера:

```bash
cd server
npm run dev
```

## Проверка

После перезапуска сервера, попробуйте загрузить изображение через админ-панель. Если всё настроено правильно, изображение должно успешно загрузиться.

## Дополнительная информация

Cloudinary используется в проекте для хранения и обработки изображений. Изображения загружаются на серверы Cloudinary, а в базе данных хранятся только ссылки на эти изображения.

Конфигурация Cloudinary находится в файле `server/src/config/cloudinary.js`, который использует библиотеку `cloudinary` для взаимодействия с API Cloudinary. 