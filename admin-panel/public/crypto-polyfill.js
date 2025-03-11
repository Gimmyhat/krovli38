/**
 * Полифилл для crypto.randomUUID
 * Этот файл должен загружаться ДО всех остальных скриптов
 */
(function() {
  console.log('Инициализация полифилла crypto из внешнего файла...');
  
  // Создаем объект crypto, если он отсутствует
  if (typeof window.crypto === 'undefined') {
    console.log('Полифилл: window.crypto отсутствует, создаем...');
    window.crypto = {};
  }

  // Добавляем полифилл для getRandomValues
  if (typeof window.crypto.getRandomValues !== 'function') {
    console.log('Полифилл: crypto.getRandomValues отсутствует, создаем...');
    window.crypto.getRandomValues = function(array) {
      if (!array) return array;
      
      try {
        const length = array.byteLength || array.length || 0;
        const view = new Uint8Array(array.buffer || array, array.byteOffset || 0, length);
        
        for (let i = 0; i < length; i++) {
          view[i] = Math.floor(Math.random() * 256);
        }
        return array;
      } catch (e) {
        console.error('Ошибка в полифилле getRandomValues:', e);
        // Запасной вариант для обычных массивов
        if (Array.isArray(array)) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
        }
        return array;
      }
    };
  }

  // Добавляем полифилл для randomUUID
  if (typeof window.crypto.randomUUID !== 'function') {
    console.log('Полифилл: crypto.randomUUID отсутствует, создаем...');
    window.crypto.randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }

  // Создаем глобальную переменную для проверки
  window._cryptoPolyfilled = true;
  console.log('Полифилл для crypto.randomUUID успешно установлен:', window.crypto.randomUUID());
})(); 