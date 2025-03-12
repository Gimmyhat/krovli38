/**
 * Модуль мониторинга и исправления ошибок
 * Этот файл должен загружаться после полифилла, но до основных скриптов
 */
(function() {
  console.log('Модуль мониторинга ошибок запущен...');
  
  // Отслеживаем deepl.com ошибки
  let deeplErrorCount = 0;
  const MAX_DEEPL_ERRORS = 3;
  
  // Сохраняем оригинальный fetch
  const originalFetch = window.fetch;
  
  // Перехватываем fetch запросы
  window.fetch = function(resource, options) {
    try {
      // Проверяем URL на наличие deepl.com
      const url = resource.toString();
      if (url.includes('deepl.com') || url.includes('errortracking')) {
        console.warn('Обнаружен запрос к errortracking сервису:', url);
        
        // Увеличиваем счетчик ошибок
        deeplErrorCount++;
        
        // Отключаем отправку ошибок после достижения лимита
        if (deeplErrorCount > MAX_DEEPL_ERRORS) {
          console.warn(`Отключаем отправку ошибок на ${url} (превышен лимит ${MAX_DEEPL_ERRORS})`);
          window._sentryUrl = url;
          window._sentryDisabled = true;
          
          // Возвращаем имитацию успешного ответа
          return Promise.resolve(new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
      }
    } catch (e) {
      console.error('Ошибка в перехвате fetch:', e);
    }
    
    // Вызываем оригинальный fetch
    return originalFetch.apply(this, arguments);
  };
  
  // Перехватываем ошибки
  window.addEventListener('error', function(event) {
    try {
      // Проверяем, является ли ошибка связанной с crypto.randomUUID
      const errorStr = event.message || '';
      if (errorStr.includes('crypto.randomUUID')) {
        console.warn('Перехвачена ошибка crypto.randomUUID:', errorStr);
        
        // Повторно применяем полифилл
        if (window._cryptoPolyfilled && typeof window.crypto !== 'undefined') {
          console.log('Повторно применяем полифилл для crypto.randomUUID');
          
          window.crypto.randomUUID = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
          
          // Предотвращаем дальнейшую обработку ошибки
          event.stopPropagation();
          event.preventDefault();
          return false;
        }
      }
      
      // Проверяем другие ошибки, связанные с загрузкой фавиконок
      if (errorStr.includes('favicon') || errorStr.includes('vite.svg')) {
        console.warn('Перехвачена ошибка загрузки фавиконки:', errorStr);
        // Мы можем просто игнорировать эти ошибки
        event.stopPropagation();
        event.preventDefault();
        return false;
      }
    } catch (e) {
      console.error('Ошибка в обработчике ошибок:', e);
    }
  }, true);
  
  // Отключаем отправку ошибок на errortracking.deepl.com
  Object.defineProperty(window, 'Sentry', {
    get: function() {
      if (window._sentryDisabled) {
        console.warn('Доступ к Sentry заблокирован');
        return {
          init: function() { console.log('Sentry.init заблокирован'); },
          captureException: function() { console.log('Sentry.captureException заблокирован'); },
          captureMessage: function() { console.log('Sentry.captureMessage заблокирован'); }
        };
      }
      return undefined;
    },
    set: function(value) {
      console.warn('Попытка установить Sentry:', value);
      if (window._sentryDisabled) {
        console.warn('Установка Sentry заблокирована');
        return true;
      }
      return true;
    },
    configurable: true
  });
  
  console.log('Модуль мониторинга ошибок завершил инициализацию');
})(); 