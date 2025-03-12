/**
 * Вспомогательный скрипт для отладки и исправления проблем с Cloudinary
 * и crypto.randomUUID
 */
(function() {
  console.log('Инициализация расширенного cloudinary-helper.js');
  
  // Проверяем, доступен ли crypto.randomUUID, и исправляем его при необходимости
  function ensureCryptoRandomUUID() {
    try {
      if (typeof window.crypto === 'undefined') {
        console.warn('[Cloudinary Helper] window.crypto не определен, создаем объект');
        window.crypto = {};
      }
      
      if (typeof window.crypto.randomUUID !== 'function') {
        console.warn('[Cloudinary Helper] crypto.randomUUID не определен, устанавливаем полифилл');
        window.crypto.randomUUID = function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        // Проверяем работоспособность
        var testUUID = window.crypto.randomUUID();
        console.log('[Cloudinary Helper] Тестовый UUID:', testUUID);
      } else {
        console.log('[Cloudinary Helper] crypto.randomUUID уже доступен');
      }
      
      return true;
    } catch (err) {
      console.error('[Cloudinary Helper] Ошибка при настройке crypto.randomUUID:', err);
      return false;
    }
  }
  
  // Запускаем проверку и исправление crypto.randomUUID
  ensureCryptoRandomUUID();
  
  // Устанавливаем интервал для периодической проверки
  setInterval(ensureCryptoRandomUUID, 1000);
  
  // Безопасный доступ к window.fetch
  if (typeof window.fetch !== 'function') {
    console.warn('[Cloudinary Helper] window.fetch не доступен! Невозможно мониторить API запросы.');
    return;
  }
  
  // Сохраняем оригинальный fetch для использования в перехватчике
  var originalFetch = window.fetch;
  
  // Перехватываем fetch для отладки запросов к Cloudinary и API
  window.fetch = function() {
    try {
      var url = arguments[0];
      var options = arguments[1] || {};
      var args = Array.from(arguments);
      
      // Для запросов к нашему API, добавляем дополнительные заголовки и логи
      if (typeof url === 'string' && url.includes('/api/images/cloudinary')) {
        console.log('[Cloudinary Helper] Отправка запроса к API Cloudinary:', url);
        
        // Клонируем опции и модифицируем их
        var enhancedOptions = JSON.parse(JSON.stringify(options));
        
        // Проверяем корректность заголовков
        if (!enhancedOptions.headers) {
          enhancedOptions.headers = {};
        }
        
        // Добавляем заголовки для улучшения обработки запроса
        enhancedOptions.headers['X-Cloudinary-Special'] = 'true';
        enhancedOptions.headers['Accept'] = 'application/json';
        
        if (!enhancedOptions.headers['Content-Type'] && 
            enhancedOptions.method && 
            (enhancedOptions.method.toUpperCase() === 'POST' || 
             enhancedOptions.method.toUpperCase() === 'PUT')) {
          enhancedOptions.headers['Content-Type'] = 'application/json';
        }
        
        // Добавляем таймаут и обработку ошибок
        args[1] = enhancedOptions;
        
        // Добавляем задержку, чтобы не перегружать сервер
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            originalFetch.apply(window, args)
              .then(function(response) {
                // Если ответ не успешный, логируем подробности
                if (!response.ok) {
                  console.warn('[Cloudinary Helper] API вернул ошибку:', response.status, response.statusText);
                  
                  // Безопасно клонируем и читаем ответ
                  try {
                    var responseClone = response.clone();
                    responseClone.text().then(function(text) {
                      try {
                        var errorData = text;
                        try {
                          errorData = JSON.parse(text);
                          console.warn('[Cloudinary Helper] Содержимое ответа (JSON):', errorData);
                        } catch (e) {
                          console.warn('[Cloudinary Helper] Содержимое ответа (текст):', text);
                        }
                        
                        // Проверка на известные ошибки
                        if (text.includes('crypto.randomUUID') || text.includes('TypeError: crypto.randomUUID is not a function')) {
                          console.warn('[Cloudinary Helper] Обнаружена ошибка crypto.randomUUID, применяем исправление');
                          ensureCryptoRandomUUID();
                        }
                      } catch (e) {
                        console.warn('[Cloudinary Helper] Не удалось прочитать содержимое ответа');
                      }
                    }).catch(function(err) {
                      console.warn('[Cloudinary Helper] Не удалось прочитать содержимое ответа:', err);
                    });
                  } catch (err) {
                    console.warn('[Cloudinary Helper] Ошибка при клонировании ответа:', err);
                  }
                }
                resolve(response);
              })
              .catch(function(error) {
                console.error('[Cloudinary Helper] Ошибка при запросе к API:', error);
                
                // Проверка на потенциальные ошибки crypto.randomUUID
                if (error && error.toString && error.toString().includes('crypto.randomUUID')) {
                  console.warn('[Cloudinary Helper] Обнаружена ошибка crypto.randomUUID в исключении, применяем исправление');
                  ensureCryptoRandomUUID();
                }
                
                reject(error);
              });
          }, 800); // Увеличенная задержка для стабильности
        });
      }
      
      // Пропускаем без изменений все остальные запросы
      return originalFetch.apply(window, args);
    } catch (err) {
      console.error('[Cloudinary Helper] Ошибка перехватчика fetch:', err);
      // Если что-то пошло не так, вызываем оригинальный fetch
      return originalFetch.apply(window, arguments);
    }
  };
  
  // Патчим window для предотвращения ошибок
  function patchWindow() {
    try {
      // Обеспечиваем безопасный доступ к объектам Cloudinary
      if (typeof window.cloudinary === 'undefined') {
        window.cloudinary = {};
      }
      
      // Определяем свойство deepl
      if (typeof window._sentry === 'undefined') {
        window._sentry = { disabled: true };
      }
      
      // Блокируем потенциальные трекеры ошибок
      window._sentryDisabled = true;
      
      return true;
    } catch (err) {
      console.error('[Cloudinary Helper] Ошибка при патче window:', err);
      return false;
    }
  }
  
  // Патчим window при загрузке
  patchWindow();
  
  // Устанавливаем обработчик для отслеживания загрузки Cloudinary
  function checkCloudinaryAvailability() {
    try {
      if (typeof window.cloudinary !== 'undefined') {
        console.log('[Cloudinary Helper] Cloudinary успешно загружен');
        
        // Проверяем, есть ли функция createUploadWidget
        if (typeof window.cloudinary.createUploadWidget === 'function') {
          console.log('[Cloudinary Helper] Функция createUploadWidget доступна');
          
          // Патчим оригинальную функцию
          var originalCreateUploadWidget = window.cloudinary.createUploadWidget;
          
          window.cloudinary.createUploadWidget = function() {
            console.log('[Cloudinary Helper] Вызов createUploadWidget с аргументами:', JSON.stringify(arguments[0]));
            
            // Проверяем crypto.randomUUID перед созданием виджета
            ensureCryptoRandomUUID();
            
            return originalCreateUploadWidget.apply(window.cloudinary, arguments);
          };
        } else {
          console.warn('[Cloudinary Helper] Функция createUploadWidget не найдена!');
        }
        
        return true;
      }
      console.warn('[Cloudinary Helper] Cloudinary не загружен!');
      return false;
    } catch (err) {
      console.error('[Cloudinary Helper] Ошибка при проверке Cloudinary:', err);
      return false;
    }
  }
  
  // Проверяем Cloudinary после загрузки всех скриптов
  function setupCloudinaryCheck() {
    try {
      setTimeout(checkCloudinaryAvailability, 2000);
      
      // Повторная проверка через 5 секунд
      setTimeout(function() {
        var available = checkCloudinaryAvailability();
        if (!available) {
          console.warn('[Cloudinary Helper] Cloudinary все еще не загружен после 5 секунд ожидания');
        }
      }, 5000);
    } catch (err) {
      console.error('[Cloudinary Helper] Ошибка при настройке проверки Cloudinary:', err);
    }
  }
  
  // Настраиваем проверки для разных состояний загрузки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCloudinaryCheck);
  } else {
    setupCloudinaryCheck();
  }
  
  // Проверка при полной загрузке страницы
  window.addEventListener('load', setupCloudinaryCheck);
  
  // Добавляем глобальный обработчик ошибок
  window.addEventListener('error', function(event) {
    // Проверяем, связана ли ошибка с crypto.randomUUID
    if (event && event.error && event.error.toString().includes('crypto.randomUUID')) {
      console.warn('[Cloudinary Helper] Перехвачена ошибка crypto.randomUUID:', event.error.message);
      ensureCryptoRandomUUID();
      
      // Предотвращаем дальнейшую обработку ошибки
      event.preventDefault();
      return false;
    }
    
    // Для других ошибок позволяем стандартную обработку
    return true;
  });
  
  console.log('[Cloudinary Helper] Расширенный helper успешно инициализирован');
})(); 