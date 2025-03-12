#!/bin/sh
set -e

# Создаем директории для загрузки, если они не существуют
echo "Checking upload directories..."
mkdir -p public/uploads
mkdir -p public/uploads/thumbnails
chmod -R 755 public/uploads
echo "Upload directories ready"

# Проверяем наличие скомпилированных файлов
if [ ! -f "dist/scripts/updateLogoPath.js" ]; then
    echo "Error: updateLogoPath.js not found!"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "Error: index.js not found!"
    exit 1
fi

# Обновляем настройки логотипа
echo "Updating logo settings..."
node dist/scripts/updateLogoPath.js || {
    echo "Warning: Failed to update logo settings, continuing anyway..."
}

# Запускаем сервер
echo "Starting server..."
exec node dist/index.js 