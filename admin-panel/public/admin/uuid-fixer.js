/**
 * UUID Fixer: Скрипт для мониторинга и восстановления функции crypto.randomUUID
 * в случае её потери или замены во время работы приложения
 */
(function() {
  console.log('Инициализация uuid-fixer.js');
  
  // Оригинальная реализация для восстановления
  const originalRandomUUID = window.crypto && window.crypto.randomUUID 
    ? window.crypto.randomUUID.bind(window.crypto) 
    : function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
  
  // Функция для восстановления crypto.randomUUID
  function ensureRandomUUID() {
    if (typeof window.crypto === 'undefined' || typeof window.crypto.randomUUID !== 'function') {
      console.warn('uuid-fixer: Обнаружено, что crypto.randomUUID отсутствует, восстанавливаем');
      
      if (typeof window.crypto === 'undefined') {
        console.warn('uuid-fixer: Объект crypto отсутствует, создаем его');
        window.crypto = {};
      }
      
      // Восстанавливаем функцию randomUUID
      window.crypto.randomUUID = originalRandomUUID;
      
      console.log('uuid-fixer: crypto.randomUUID восстановлен');
      return true;
    }
    return false;
  }
  
  // Периодически проверяем и восстанавливаем, если необходимо
  const checkInterval = setInterval(function() {
    const fixed = ensureRandomUUID();
    if (fixed) {
      console.log('uuid-fixer: Автоматически восстановили crypto.randomUUID');
    }
  }, 2000); // Проверка каждые 2 секунды
  
  // Обработчик ошибок, связанных с crypto.randomUUID
  window.addEventListener('error', function(event) {
    if (event && event.error && typeof event.error.message === 'string' && 
        event.error.message.includes('crypto.randomUUID')) {
      console.warn('uuid-fixer: Перехвачена ошибка, связанная с crypto.randomUUID:', event.error.message);
      ensureRandomUUID();
      
      // Предотвращаем стандартную обработку ошибки
      event.preventDefault();
    }
  }, true);
  
  // Сохраняем активную ссылку на checkInterval для возможности очистки
  window._uuidFixerInterval = checkInterval;
  
  console.log('uuid-fixer.js инициализирован');
})(); 