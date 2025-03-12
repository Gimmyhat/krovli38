/**
 * Усиленный полифилл для crypto.randomUUID
 * Этот файл должен загружаться ДО всех остальных скриптов
 */
(function() {
  console.log('Усиленный полифилл crypto.randomUUID запущен...');
  
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
  
  // Функция для создания полифилла
  function createCryptoPolyfill() {
    // Создаем объект crypto, если он отсутствует
    if (typeof window.crypto === 'undefined') {
      console.log('Полифилл: window.crypto отсутствует, создаем...');
      try {
        // Используем defineProperty для более надежного определения
        Object.defineProperty(window, 'crypto', {
          value: {},
          writable: true,
          configurable: true
        });
      } catch (e) {
        console.error('Не удалось создать window.crypto:', e);
        // Запасной вариант
        window.crypto = {};
      }
    }
    
    // Добавляем полифилл для getRandomValues
    if (typeof window.crypto.getRandomValues !== 'function') {
      console.log('Полифилл: crypto.getRandomValues отсутствует, создаем...');
      try {
        Object.defineProperty(window.crypto, 'getRandomValues', {
          value: function(array) {
            if (!array) return array;
            
            try {
              const length = array.byteLength !== undefined ? array.byteLength : 
                            (array.length !== undefined ? array.length : 0);
              
              if (length === 0) return array;
              
              const view = array.buffer ? new Uint8Array(array.buffer, array.byteOffset || 0, length) : 
                          (Array.isArray(array) ? array : new Uint8Array(length));
              
              for (let i = 0; i < length; i++) {
                view[i] = Math.floor(Math.random() * 256);
              }
              
              return array;
            } catch (e) {
              console.error('Ошибка в полифилле getRandomValues:', e);
              // Простая реализация для массивов
              if (Array.isArray(array)) {
                for (let i = 0; i < array.length; i++) {
                  array[i] = Math.floor(Math.random() * 256);
                }
              }
              return array;
            }
          },
          writable: true,
          configurable: true
        });
      } catch (e) {
        console.error('Не удалось создать crypto.getRandomValues:', e);
        // Запасной вариант
        window.crypto.getRandomValues = function(array) {
          if (Array.isArray(array)) {
            for (let i = 0; i < array.length; i++) {
              array[i] = Math.floor(Math.random() * 256);
            }
          }
          return array;
        };
      }
    }
    
    // Добавляем полифилл для randomUUID
    if (typeof window.crypto.randomUUID !== 'function') {
      console.log('Полифилл: crypto.randomUUID отсутствует, создаем...');
      try {
        Object.defineProperty(window.crypto, 'randomUUID', {
          value: function() {
            try {
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              });
            } catch (e) {
              console.error('Ошибка в полифилле randomUUID:', e);
              // Запасной вариант
              const d = new Date().getTime();
              return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = (d + Math.random() * 16) % 16 | 0;
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
              });
            }
          },
          writable: true,
          configurable: true
        });
      } catch (e) {
        console.error('Не удалось создать crypto.randomUUID через defineProperty:', e);
        // Запасной вариант
        window.crypto.randomUUID = function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
      }
    }
  }
  
  // Проверка и применение полифилла
  if (!testRandomUUID()) {
    console.log('crypto.randomUUID не работает, применяем полифилл...');
    createCryptoPolyfill();
    
    // Проверяем успешность применения
    if (testRandomUUID()) {
      console.log('Полифилл для crypto.randomUUID успешно применен');
    } else {
      console.error('КРИТИЧЕСКАЯ ОШИБКА: Не удалось применить полифилл для crypto.randomUUID!');
      
      // Последняя попытка - прямое присваивание
      console.log('Последняя попытка - прямое присваивание randomUUID...');
      window.crypto = window.crypto || {};
      window.crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Финальная проверка
      if (testRandomUUID()) {
        console.log('Последняя попытка успешна, полифилл применен');
      } else {
        console.error('ВСЕ ПОПЫТКИ ПРИМЕНИТЬ ПОЛИФИЛЛ ПРОВАЛИЛИСЬ!');
      }
    }
  } else {
    console.log('crypto.randomUUID уже работает, полифилл не требуется');
  }
  
  // Создаем глобальную переменную для проверки
  window._cryptoPolyfilled = true;
  window._cryptoPolyfillVersion = '2.0';
  
  // Перехватываем ошибки crypto.randomUUID
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (message && typeof message === 'string' && message.includes('crypto.randomUUID')) {
      console.warn('Перехвачена ошибка crypto.randomUUID, переприменяем полифилл...');
      createCryptoPolyfill();
      return true; // Предотвращаем стандартную обработку
    }
    return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
  };
  
  // Защита от переопределения crypto
  const originalCrypto = window.crypto;
  const originalRandomUUID = window.crypto.randomUUID;
  
  // Отслеживаем попытки переопределить crypto
  Object.defineProperty(window, 'crypto', {
    get: function() {
      return originalCrypto;
    },
    set: function(newValue) {
      console.warn('Попытка переопределить window.crypto, сохраняем нашу версию');
      
      // Сохраняем оригинальные методы
      if (newValue && typeof newValue === 'object') {
        // Копируем новые свойства, сохраняя наши методы
        for (const key in newValue) {
          if (key !== 'randomUUID' && key !== 'getRandomValues') {
            originalCrypto[key] = newValue[key];
          }
        }
      }
      
      // Гарантируем, что randomUUID не изменится
      if (typeof originalCrypto.randomUUID !== 'function') {
        originalCrypto.randomUUID = originalRandomUUID;
      }
      
      return true;
    },
    configurable: false
  });
  
  console.log('Усиленный полифилл crypto.randomUUID завершен');
})(); 