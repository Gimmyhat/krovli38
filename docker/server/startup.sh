#!/bin/sh
set -e

# Проверяем наличие скомпилированных файлов
if [ ! -f "dist/scripts/updateLogoPath.js" ]; then
    echo "Error: updateLogoPath.js not found!"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "Error: index.js not found!"
    exit 1
fi

# Проверяем наличие скрипта миграции контента
if [ -f "dist/scripts/migrateContentToMongoDB.js" ]; then
    echo "Running content migration script..."
    node dist/scripts/migrateContentToMongoDB.js || {
        echo "Warning: Failed to migrate content, continuing anyway..."
    }
else
    echo "Warning: Content migration script not found, skipping migration..."
fi

# Обновляем настройки логотипа
echo "Updating logo settings..."
node dist/scripts/updateLogoPath.js || {
    echo "Warning: Failed to update logo settings, continuing anyway..."
}

# Запускаем сервер
echo "Starting server..."
exec node dist/index.js 