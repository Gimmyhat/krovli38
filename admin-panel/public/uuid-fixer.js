/**
 * Модуль для исправления ошибок crypto.randomUUID во время выполнения
 * Этот файл должен загружаться после основных скриптов
 */
(function() {
  console.log('Инициализация модуля исправления crypto.randomUUID...');
  
  // Функция для создания UUID v4
  function generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Функция для проверки работоспособности randomUUID
  function testRandomUUID() {
    try {
      if (typeof window.crypto === 'undefined') return false;
      if (typeof window.crypto.randomUUID !== 'function') return false;
      
      const testUUID = window.crypto.randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      return typeof testUUID === 'string' && uuidRegex.test(testUUID);
    } catch (e) {
      console.error('Ошибка при тестировании crypto.randomUUID:', e);
      return false;
    }
  }
  
  // Проверяем и исправляем
  if (!testRandomUUID()) {
    console.warn('crypto.randomUUID не работает, применяем исправление...');
    
    try {
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
        console.log('Создан новый объект crypto');
      }
      
      if (typeof window.crypto.randomUUID !== 'function') {
        window.crypto.randomUUID = generateUUIDv4;
        console.log('Установлен polyfill для crypto.randomUUID');
      }
      
      // Проверяем результат
      if (testRandomUUID()) {
        console.log('crypto.randomUUID успешно исправлен');
      } else {
        console.error('Не удалось исправить crypto.randomUUID');
      }
    } catch (e) {
      console.error('Ошибка при исправлении crypto.randomUUID:', e);
    }
  } else {
    console.log('crypto.randomUUID работает корректно');
  }
  
  // Устанавливаем интервал для регулярной проверки crypto.randomUUID
  setInterval(function() {
    if (!testRandomUUID()) {
      console.warn('crypto.randomUUID перестал работать, восстанавливаем...');
      window.crypto = window.crypto || {};
      window.crypto.randomUUID = generateUUIDv4;
      console.log('crypto.randomUUID восстановлен:', testRandomUUID());
    }
  }, 5000); // Проверяем каждые 5 секунд
  
  // Проверяем наличие Cloudinary и правильность его инициализации
  setTimeout(function() {
    if (typeof window.cloudinary === 'undefined') {
      console.warn('Cloudinary не инициализирован, возможны проблемы с загрузкой файлов');
    } else {
      console.log('Cloudinary инициализирован успешно');
    }
  }, 3000);
  
  console.log('Модуль исправления crypto.randomUUID инициализирован');
})(); 