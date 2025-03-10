#!/bin/sh

# Обновляем настройки логотипа
echo "Updating logo settings..."
node dist/scripts/updateLogoPath.js

# Запускаем сервер
echo "Starting server..."
exec node dist/index.js 