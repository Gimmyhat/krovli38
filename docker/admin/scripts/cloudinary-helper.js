/**
 * Вспомогательный скрипт для отладки и исправления проблем с Cloudinary
 */
(function() {
  console.log('Инициализация cloudinary-helper.js');
  
  // Безопасный доступ к window.fetch
  if (typeof window.fetch !== 'function') {
    console.warn('window.fetch не доступен! Невозможно мониторить API запросы.');
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
        console.log('Отправка запроса к API Cloudinary:', url, JSON.stringify(options));
        
        // Добавляем задержку, чтобы не перегружать сервер
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            originalFetch.apply(window, args)
              .then(function(response) {
                // Если ответ не успешный, логируем подробности
                if (!response.ok) {
                  console.warn('API вернул ошибку:', response.status, response.statusText);
                  
                  // Безопасно клонируем и читаем ответ
                  try {
                    var responseClone = response.clone();
                    responseClone.text().then(function(text) {
                      try {
                        console.warn('Содержимое ответа:', text);
                      } catch (e) {
                        console.warn('Не удалось прочитать содержимое ответа');
                      }
                    }).catch(function(err) {
                      console.warn('Не удалось прочитать содержимое ответа:', err);
                    });
                  } catch (err) {
                    console.warn('Ошибка при клонировании ответа:', err);
                  }
                }
                resolve(response);
              })
              .catch(function(error) {
                console.error('Ошибка при запросе к API:', error);
                reject(error);
              });
          }, 500);
        });
      }
      
      // Пропускаем без изменений все остальные запросы
      return originalFetch.apply(window, args);
    } catch (err) {
      console.error('Ошибка перехватчика fetch:', err);
      // Если что-то пошло не так, вызываем оригинальный fetch
      return originalFetch.apply(window, arguments);
    }
  };
  
  // Устанавливаем обработчик для отслеживания загрузки Cloudinary
  function checkCloudinaryAvailability() {
    try {
      if (typeof window.cloudinary !== 'undefined') {
        console.log('Cloudinary успешно загружен');
        return true;
      }
      console.warn('Cloudinary не загружен!');
      return false;
    } catch (err) {
      console.error('Ошибка при проверке Cloudinary:', err);
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
          console.warn('Cloudinary все еще не загружен после 5 секунд ожидания');
        }
      }, 5000);
    } catch (err) {
      console.error('Ошибка при настройке проверки Cloudinary:', err);
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
  
  console.log('Cloudinary helper успешно инициализирован');
})(); 