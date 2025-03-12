/**
 * Надежный полифилл для crypto.randomUUID
 * Использует библиотеку uuid-v4 из CDN для генерации UUID
 */
(function() {
  console.log('Инициализация uuid-polyfill.js с библиотекой uuid-v4');
  
  // Загружаем библиотеку uuid-v4 из CDN
  function loadUuidScript() {
    return new Promise((resolve, reject) => {
      if (window.uuidv4) {
        console.log('uuid-v4 уже загружен');
        resolve(window.uuidv4);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/uuid@9.0.1/dist/index.min.js';
      script.onload = function() {
        console.log('uuid библиотека успешно загружена');
        // UUID из CDN создает глобальную переменную uuid
        if (window.uuid && window.uuid.v4) {
          window.uuidv4 = window.uuid.v4;
          resolve(window.uuidv4);
        } else {
          reject(new Error('uuid библиотека загружена, но функция uuid.v4 не найдена'));
        }
      };
      script.onerror = function(error) {
        console.error('Ошибка при загрузке uuid библиотеки:', error);
        reject(error);
      };
      
      document.head.appendChild(script);
    });
  }
  
  // Функция для генерации UUID без зависимостей
  function generateSimpleUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Функция установки полифилла
  function setupPolyfill(uuidFunc) {
    try {
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
      }
      
      window.crypto.randomUUID = uuidFunc || generateSimpleUUID;
      console.log('Полифилл crypto.randomUUID установлен');
      
      return true;
    } catch (error) {
      console.error('Ошибка при установке полифилла crypto.randomUUID:', error);
      return false;
    }
  }
  
  // Устанавливаем временный полифилл, потом перезапишем его на основе библиотеки
  if (typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') {
    console.log('crypto.randomUUID не обнаружен, устанавливаем временный полифилл');
    setupPolyfill(generateSimpleUUID);
  }
  
  // Пытаемся загрузить библиотеку uuid и обновить полифилл
  loadUuidScript()
    .then(uuidFunc => {
      console.log('Обновляем полифилл crypto.randomUUID с использованием uuid библиотеки');
      setupPolyfill(uuidFunc);
      
      // Тестируем полифилл
      const testUUID = window.crypto.randomUUID();
      console.log('Тест crypto.randomUUID с uuid библиотекой:', testUUID);
    })
    .catch(error => {
      console.warn('Не удалось загрузить uuid библиотеку, используем простой полифилл:', error);
      
      // Тестируем простой полифилл
      const testUUID = window.crypto.randomUUID();
      console.log('Тест crypto.randomUUID с простым полифиллом:', testUUID);
    });
  
  // Периодическая проверка и восстановление полифилла
  setInterval(function() {
    if (typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') {
      console.warn('crypto.randomUUID недоступен, восстанавливаем...');
      setupPolyfill(window.uuidv4 || generateSimpleUUID);
    }
  }, 5000);
  
  console.log('uuid-polyfill.js инициализирован');
})(); 