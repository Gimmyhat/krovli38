// Немедленный полифилл для crypto.randomUUID
// Этот скрипт выполняется в head, до загрузки любых других скриптов
(function() {
  try {
    // Убеждаемся, что crypto существует
    if (typeof window.crypto === 'undefined') {
      window.crypto = {};
    }
    
    // Предоставляем простую реализацию randomUUID, если она отсутствует
    if (typeof window.crypto.randomUUID !== 'function') {
      window.crypto.randomUUID = function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0;
          var v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      console.log('Meta polyfill активирован');
    }
  } catch (e) {
    // Если что-то пошло не так, предоставляем глобальную замену
    console.error('Ошибка при установке мета-полифилла:', e);
    window.crypto = {
      randomUUID: function() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
      }
    };
    console.log('Аварийный meta polyfill активирован');
  }
})(); 