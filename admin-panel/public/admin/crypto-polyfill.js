/**
 * Улучшенный полифилл для crypto.randomUUID
 * Этот скрипт добавляет поддержку crypto.randomUUID для браузеров
 * и защищает от перезаписи или удаления этой функции
 */
(function() {
  console.log('Инициализация улучшенного полифилла crypto-polyfill.js');
  
  // Функция для генерации UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Функция для проверки и восстановления crypto.randomUUID
  function ensureCryptoFunctions() {
    if (typeof window.crypto === 'undefined') {
      console.warn('Объект crypto не найден в window, создаем полифилл');
      window.crypto = {};
    }
    
    // Проверяем наличие метода getRandomValues
    if (typeof window.crypto.getRandomValues !== 'function') {
      console.warn('Метод crypto.getRandomValues не найден, создаем полифилл');
      window.crypto.getRandomValues = function(array) {
        if (!array) return array;
        
        // Безопасное получение длины массива
        const len = array.byteLength || array.length || 0;
        // Обрабатываем массив как Uint8Array если возможно
        let uint8Array;
        
        try {
          uint8Array = new Uint8Array(array.buffer || array, array.byteOffset || 0, len);
        } catch (e) {
          // Если не можем создать Uint8Array, работаем напрямую с массивом
          uint8Array = array;
        }
        
        for (let i = 0; i < len; i++) {
          if (uint8Array[i] !== undefined) {
            uint8Array[i] = Math.floor(Math.random() * 256);
          }
        }
        return array;
      };
    }
    
    // Проверяем наличие метода randomUUID
    if (typeof window.crypto.randomUUID !== 'function') {
      console.warn('Метод crypto.randomUUID не найден, создаем полифилл');
      
      // Используем Object.defineProperty для защиты от переопределения
      Object.defineProperty(window.crypto, 'randomUUID', {
        configurable: true, // Позволяет переопределить в будущем, если понадобится
        enumerable: true,   // Видимо при перечислении свойств
        writable: false,    // Защита от прямой перезаписи
        value: generateUUID // Наша функция генерации UUID
      });
    }
    
    // Проверяем, что функция работает
    try {
      const testUUID = window.crypto.randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(testUUID)) {
        console.error('Тест не пройден: UUID не соответствует формату', testUUID);
        // Если функция есть, но работает неправильно, исправляем
        Object.defineProperty(window.crypto, 'randomUUID', {
          configurable: true,
          enumerable: true,
          writable: false,
          value: generateUUID
        });
        
        // Проверяем еще раз
        const newTestUUID = window.crypto.randomUUID();
        console.log('Функция заменена, новый UUID:', newTestUUID);
      } else {
        console.log('Полифилл crypto.randomUUID успешно работает:', testUUID);
      }
    } catch (error) {
      console.error('Ошибка при проверке полифилла crypto.randomUUID:', error);
      
      // При ошибке пробуем исправить функцию
      try {
        window.crypto.randomUUID = generateUUID;
        const recoveryUUID = window.crypto.randomUUID();
        console.log('Восстановлен после ошибки, UUID:', recoveryUUID);
      } catch (e) {
        console.error('Не удалось восстановить после ошибки:', e);
      }
    }
  }
  
  // Выполняем проверку и восстановление
  ensureCryptoFunctions();
  
  // Периодически проверяем наличие функции (на случай, если кто-то ее удалит)
  window._cryptoCheckInterval = setInterval(function() {
    if (typeof window.crypto === 'undefined' || 
        typeof window.crypto.randomUUID !== 'function') {
      console.warn('crypto.randomUUID была удалена или переопределена, восстанавливаем...');
      ensureCryptoFunctions();
    }
  }, 1000); // Проверка каждую секунду
  
  // Создаем глобальный объект для управления полифиллом
  window._cryptoPolyfillStatus = {
    installed: true,
    timestamp: new Date().toISOString(),
    check: ensureCryptoFunctions,
    stop: function() {
      if (window._cryptoCheckInterval) {
        clearInterval(window._cryptoCheckInterval);
        console.log('Мониторинг crypto.randomUUID остановлен');
      }
    },
    start: function() {
      window._cryptoPolyfillStatus.stop(); // Останавливаем предыдущий, если был
      window._cryptoCheckInterval = setInterval(ensureCryptoFunctions, 1000);
      console.log('Мониторинг crypto.randomUUID запущен');
    }
  };
  
  console.log('Улучшенный полифилл crypto-polyfill.js инициализирован');
})(); 