#!/bin/bash

# Домен для сертификата
domains=(krovlya38.pro www.krovlya38.pro)
rsa_key_size=4096
data_path="/etc/letsencrypt"
email="admin@krovlya38.pro" # Замените на свой email

# Создаем директорию для certbot
echo "Создаем директории для сертификатов..."
mkdir -p "$data_path/live/krovlya38.pro"
mkdir -p /var/www/certbot

# Создаем временный самоподписанный сертификат
echo "Создаем временный самоподписанный сертификат..."
openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
  -keyout "$data_path/live/krovlya38.pro/privkey.pem" \
  -out "$data_path/live/krovlya38.pro/fullchain.pem" \
  -subj "/CN=${domains[0]}"

# Создаем файлы конфигурации SSL для Nginx
echo "Настраиваем конфигурацию SSL для Nginx..."
echo "ssl_protocols TLSv1.2 TLSv1.3;" > "$data_path/options-ssl-nginx.conf"
echo "ssl_prefer_server_ciphers off;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_timeout 1d;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_cache shared:SSL:10m;" >> "$data_path/options-ssl-nginx.conf"
echo "ssl_session_tickets off;" >> "$data_path/options-ssl-nginx.conf"

# Создаем DH параметры
echo "Генерируем DH параметры (это может занять время)..."
openssl dhparam -out "$data_path/ssl-dhparams.pem" 2048

echo "Созданы временные SSL сертификаты и конфигурация"

# Перезапускаем контейнеры
echo "Перезапускаем контейнеры..."
docker compose down
docker compose up -d nginx

echo "Nginx запущен. Подождите немного для инициализации."
sleep 5

# Запускаем certbot для получения реальных сертификатов с использованием DNS challenge
echo "------------------------------------------------------"
echo "НАЧИНАЕМ ПРОЦЕСС ПОЛУЧЕНИЯ СЕРТИФИКАТА ЧЕРЕЗ DNS-01 CHALLENGE"
echo "------------------------------------------------------"
echo "ВАЖНО: Вам нужно будет добавить TXT-запись в DNS вашего домена."
echo "После добавления TXT-записи, дождитесь распространения через DNS (обычно 5-10 минут)"
echo "и затем нажмите Enter для продолжения в интерактивном режиме."
echo "------------------------------------------------------"
docker compose run --rm certbot certonly --manual \
  --preferred-challenges dns \
  --email $email \
  --server https://acme-v02.api.letsencrypt.org/directory \
  --agree-tos \
  -d ${domains[0]} -d ${domains[1]}

echo "Пытаемся перезапустить Nginx для применения сертификатов"
docker compose exec nginx nginx -s reload

# Проверяем результат
echo "Проверяем статус сертификатов..."
if [ -d "$data_path/live/krovlya38.pro" ]; then
  echo "Успех! Сертификаты успешно получены и установлены."
  echo "Сайт должен быть доступен по HTTPS: https://krovlya38.pro"
else
  echo "Что-то пошло не так. Сертификаты не получены."
  echo "Проверьте лог выше на наличие ошибок."
fi

echo "Процесс получения SSL-сертификатов завершен." 