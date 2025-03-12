/**
 * Глобальный полифилл для crypto.randomUUID
 * Этот файл будет загружен до всех остальных скриптов
 */
(function() {
  // Перехватываем ошибки и логируем их
  var originalConsoleError = console.error;
  console.error = function() {
    var args = Array.from(arguments);
    var errorStr = args.join(' ');
    
    // Перехватываем ошибки, связанные с crypto
    if (typeof errorStr === 'string' && errorStr.includes('crypto') && errorStr.includes('randomUUID')) {
      console.warn('Перехвачена ошибка, связанная с crypto.randomUUID:', errorStr);
      ensureCryptoSupport();
    }
    
    // Вызываем оригинальный метод
    return originalConsoleError.apply(console, args);
  };
  
  // Функция для гарантированного создания UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Функция убеждается, что crypto и randomUUID доступны
  function ensureCryptoSupport() {
    try {
      // Если window.crypto не существует, создаем его
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
        console.log('Создан объект crypto');
      }
      
      // Если crypto.getRandomValues не существует, создаем его
      if (typeof window.crypto.getRandomValues !== 'function') {
        window.crypto.getRandomValues = function(array) {
          if (!array) return array;
          
          var length = array.length;
          for (var i = 0; i < length; i++) {
            // Для любого типизированного массива
            if (array.BYTES_PER_ELEMENT) {
              array[i] = Math.floor(Math.random() * 256) % Math.pow(2, 8 * array.BYTES_PER_ELEMENT);
            } else {
              array[i] = Math.floor(Math.random() * 256);
            }
          }
          return array;
        };
        console.log('Создан метод crypto.getRandomValues');
      }
      
      // Если crypto.randomUUID не существует, создаем его
      if (typeof window.crypto.randomUUID !== 'function') {
        Object.defineProperty(window.crypto, 'randomUUID', {
          enumerable: true,
          configurable: true,
          writable: true,
          value: generateUUID
        });
        console.log('Создан метод crypto.randomUUID');
      }
      
      // Проверяем, что все работает
      var testValue = new Uint8Array(10);
      window.crypto.getRandomValues(testValue);
      var testUUID = window.crypto.randomUUID();
      
      console.log('Полифилл успешно применен:');
      console.log('- getRandomValues тест:', Array.from(testValue));
      console.log('- randomUUID тест:', testUUID);
      
      return true;
    } catch (err) {
      console.error('Ошибка при настройке crypto полифилла:', err);
      return false;
    }
  }
  
  // Сразу применяем полифилл при загрузке скрипта
  ensureCryptoSupport();
  
  // Устанавливаем интервал для периодической проверки
  var interval = setInterval(function() {
    ensureCryptoSupport();
  }, 1000);
  
  // Останавливаем интервал через 30 секунд
  setTimeout(function() {
    clearInterval(interval);
  }, 30000);
  
  // Добавляем обработчик ошибок
  window.addEventListener('error', function(event) {
    if (event && event.error && event.error.message && 
        event.error.message.includes('crypto.randomUUID')) {
      console.warn('Перехвачена ошибка window.error:', event.error.message);
      ensureCryptoSupport();
      event.preventDefault();
    }
  }, true);
  
  // Добавляем обработчик для состояния готовности документа
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureCryptoSupport);
  } else {
    ensureCryptoSupport();
  }
  
  // Добавляем обработчик для полной загрузки страницы
  window.addEventListener('load', ensureCryptoSupport);
  
  // Устанавливаем глобальный флаг
  window._cryptoPolyfilled = true;
  
  console.log('Глобальный полифилл для crypto успешно инициализирован');
})(); 