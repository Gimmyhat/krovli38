# Nginx и SSL для проекта Krovli38

Этот каталог содержит конфигурацию Nginx и SSL для проекта Krovli38.

## Структура каталога

- `conf.d/` - Конфигурационные файлы Nginx
  - `default.conf` - Основная конфигурация для сайта krovlya38.pro
- `logs/` - Журналы Nginx (access.log, error.log)
- `ssl/` - Временная директория для SSL-сертификатов (использовалась ранее)

## Настройка SSL с Let's Encrypt

Проект использует Let's Encrypt для получения бесплатных SSL-сертификатов. Процесс полностью автоматизирован через CI/CD.

### Как сертификаты получаются и обновляются

1. При первом деплое через CI/CD, скрипт `init-letsencrypt.sh` создает самоподписанный сертификат и запускает certbot
2. Certbot получает реальный сертификат от Let's Encrypt через DNS-01 challenge (требуется добавление TXT-записи в DNS)
3. Сертификаты сохраняются в директории `certbot/conf/`
4. Nginx настроен на автоматическую перезагрузку каждые 6 часов, чтобы подхватывать обновленные сертификаты
5. Certbot автоматически пытается обновить сертификаты каждые 12 часов

### Директории для сертификатов

- `/var/www/certbot` - Веб-директория для HTTP-01 вызова (для подтверждения владения доменом)
- `/etc/letsencrypt` - Директория для хранения сертификатов

## Устранение неполадок

### Nginx не запускается

Проверьте логи с помощью:

```bash
docker compose logs nginx
```

### Проблемы с сертификатами

Для диагностики проблем с certbot:

```bash
docker compose logs certbot
```

Для принудительного обновления сертификатов:

```bash
docker compose run --rm certbot certonly --manual --preferred-challenges dns --email admin@krovlya38.pro --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d krovlya38.pro -d www.krovlya38.pro
```

### Если certbot зависает

1. Остановите все контейнеры
   ```bash
   docker compose down
   ```

2. Остановите все процессы certbot
   ```bash
   pkill -f certbot
   ```

3. Запустите получение сертификатов заново
   ```bash
   ./setup-ssl.sh
   ``` 