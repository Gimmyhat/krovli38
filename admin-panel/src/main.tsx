// Функция для проверки доступности favicon
function checkFavicons() {
  console.log("Проверка доступности иконок...");
  
  // Список иконок для проверки
  const iconPaths = [
    '/favicon.svg',
    '/vite.svg',
    '/favicon.png'
  ];
  
  // Проверяем каждую иконку
  iconPaths.forEach(path => {
    fetch(path)
      .then(response => {
        if (!response.ok) {
          console.warn(`Иконка по пути ${path} недоступна (статус ${response.status})`);
        } else {
          console.log(`Иконка по пути ${path} доступна`);
        }
      })
      .catch(error => {
        console.error(`Ошибка при проверке иконки ${path}:`, error);
      });
  });
}

// Запускаем проверку при загрузке страницы
if (typeof window !== 'undefined') {
  window.addEventListener('load', checkFavicons);
}

// Основной код приложения
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/axios'
import './index.css'
import App from './App.tsx'
import { initUuidPolyfill } from './utils/crypto-uuid-helper'

// Инициализируем полифилл для crypto.randomUUID
initUuidPolyfill();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
