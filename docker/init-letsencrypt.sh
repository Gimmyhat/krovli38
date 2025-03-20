#!/bin/bash

# Домен для сертификата
domains=(krovlya38.pro www.krovlya38.pro)
rsa_key_size=4096
data_path="/etc/letsencrypt"
email="admin@krovlya38.pro" # Замените на свой email

# Создаем директорию для certbot и настраиваем временные файлы
mkdir -p "$data_path/live/krovlya38.pro"
mkdir -p /var/www/certbot

# Создаем временный самоподписанный сертификат
openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
  -keyout "$data_path/live/krovlya38.pro/privkey.pem" \
  -out "$data_path/live/krovlya38.pro/fullchain.pem" \
  -subj "/CN=${domains[0]}"

# Создаем файлы конфигурации SSL для Nginx
echo "ssl_protocols TLSv1.2 TLSv1.3;" > "$data_path/options-ssl-nginx.conf"
echo "ssl_prefer_server_ciphers off;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_timeout 1d;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_cache shared:SSL:10m;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_tickets off;" >> "$data_path/options-ssl-nginx.conf"

# Создаем DH параметры
openssl dhparam -out "$data_path/ssl-dhparams.pem" 2048

echo "Созданы временные SSL сертификаты и конфигурация"

# Перезапускаем контейнеры
docker compose down
docker compose up -d nginx

echo "Nginx запущен. Подождите немного для инициализации."
sleep 5

# Запускаем certbot для получения реальных сертификатов
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $email \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d ${domains[0]} -d ${domains[1]}

echo "Пытаемся перезапустить Nginx для применения сертификатов"
docker compose exec nginx nginx -s reload

echo "Процесс получения SSL-сертификатов завершен. Проверьте статус сертификатов." 