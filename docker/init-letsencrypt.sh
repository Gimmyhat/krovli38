#!/bin/bash

# Домен для сертификата
domains=(krovlya38.pro www.krovlya38.pro)
rsa_key_size=4096
data_path="./docker/certbot"
email="admin@krovlya38.pro" # Замените на свой email

# Создаем директории для certbot
mkdir -p $data_path/conf/live/$domains
mkdir -p $data_path/www

# Остановим и удалим старые контейнеры
docker compose -f docker/docker-compose.yml down

# Удалим старые сертификаты
rm -rf $data_path/conf/live/$domains

# Создадим временный самоподписанный сертификат для запуска Nginx
mkdir -p "$data_path/conf/live/$domains"
openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
  -keyout "$data_path/conf/live/$domains/privkey.pem" \
  -out "$data_path/conf/live/$domains/fullchain.pem" \
  -subj "/CN=$domains"

# Создадим опции SSL для Nginx
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"

# Запустим контейнеры
docker compose -f docker/docker-compose.yml up -d

# Дождемся запуска Nginx
echo "Ожидаем запуска Nginx..."
sleep 5

# Запросим сертификат Let's Encrypt
docker compose -f docker/docker-compose.yml run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $email \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d ${domains[0]} -d ${domains[1]}

# Перезапустим Nginx
docker compose -f docker/docker-compose.yml exec nginx nginx -s reload

echo "Поздравляем! HTTPS настроен для $domains" 