/**
 * Глобальный полифилл для crypto.randomUUID
 * Этот файл будет загружен до всех остальных скриптов
 */
(function() {
  console.log('Инициализация crypto-polyfill.js');
  
  // Безопасная функция создания UUID (без внешних зависимостей)
  function generateUUID() {
    try {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } catch (err) {
      console.error('Ошибка при генерации UUID:', err);
      // Запасной вариант, если что-то пошло не так
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
  }
  
  // Функция для тестирования полифилла
  function testRandomUUID() {
    try {
      if (typeof window.crypto !== 'undefined' && 
          typeof window.crypto.randomUUID === 'function') {
        var uuid = window.crypto.randomUUID();
        console.log('Тест crypto.randomUUID успешен:', uuid);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Ошибка при тестировании crypto.randomUUID:', err);
      return false;
    }
  }
  
  // Основная функция для установки полифилла
  function setupPolyfill() {
    try {
      // Гарантируем существование объекта crypto
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
        console.log('Создан объект crypto');
      }
      
      // Реализуем getRandomValues, если его нет
      if (typeof window.crypto.getRandomValues !== 'function') {
        window.crypto.getRandomValues = function(array) {
          if (!array) return array;
          
          try {
            for (var i = 0; i < array.length; i++) {
              if (array.BYTES_PER_ELEMENT) {
                array[i] = Math.floor(Math.random() * 256) % 
                           Math.pow(2, 8 * array.BYTES_PER_ELEMENT);
              } else {
                array[i] = Math.floor(Math.random() * 256);
              }
            }
          } catch (err) {
            console.error('Ошибка при заполнении массива случайными значениями:', err);
          }
          
          return array;
        };
        console.log('Добавлен полифилл для crypto.getRandomValues');
      }
      
      // Реализуем randomUUID, если его нет
      if (typeof window.crypto.randomUUID !== 'function') {
        // Использаем прямое присваивание вместо Object.defineProperty
        window.crypto.randomUUID = generateUUID;
        console.log('Добавлен полифилл для crypto.randomUUID');
      }
      
      // Тестируем функциональность
      if (testRandomUUID()) {
        console.log('Полифилл успешно установлен и протестирован');
        return true;
      } else {
        // Еще одна попытка с прямым присваиванием
        window.crypto.randomUUID = generateUUID;
        
        if (testRandomUUID()) {
          console.log('Полифилл успешно установлен со второй попытки');
          return true;
        } else {
          console.error('КРИТИЧЕСКАЯ ОШИБКА: Не удалось применить полифилл для crypto.randomUUID!');
          return false;
        }
      }
    } catch (err) {
      console.error('Критическая ошибка при установке полифилла:', err);
      
      // Последняя попытка - глобальный аварийный режим
      try {
        window.crypto = {
          getRandomValues: function(array) {
            for (var i = 0; i < array.length; i++) {
              array[i] = Math.floor(Math.random() * 256);
            }
            return array;
          },
          randomUUID: generateUUID
        };
        console.log('Установлен аварийный полифилл');
        return testRandomUUID();
      } catch (finalErr) {
        console.error('Все попытки установить полифилл провалились:', finalErr);
        return false;
      }
    }
  }
  
  // Установка полифилла при загрузке скрипта
  var success = setupPolyfill();
  
  // Устанавливаем обработчик для проверки и повторной установки, если нужно
  window.addEventListener('load', function() {
    if (!testRandomUUID()) {
      console.warn('На момент загрузки страницы crypto.randomUUID недоступен, пытаемся переустановить');
      setupPolyfill();
    }
  });
  
  // Обработчик ошибок, связанных с crypto
  window.addEventListener('error', function(event) {
    if (event && event.error && event.error.message && 
        typeof event.error.message === 'string' && 
        event.error.message.includes('crypto') && 
        event.error.message.includes('randomUUID')) {
      console.warn('Перехвачена ошибка crypto:', event.error.message);
      setupPolyfill();
      
      // Предотвращаем дальнейшую обработку ошибки
      event.preventDefault();
    }
  }, true);
  
  // Экспорт статуса для отладки
  window._cryptoPolyfillStatus = {
    installed: success,
    timestamp: new Date().toISOString()
  };
  
  console.log('Инициализация crypto-polyfill.js завершена');
})(); 