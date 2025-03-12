/**
 * Вспомогательный скрипт для отладки и исправления проблем с Cloudinary
 */
(function() {
  // Сохраняем оригинальный fetch для использования в перехватчике
  var originalFetch = window.fetch;
  
  // Перехватываем fetch для отладки запросов к Cloudinary и API
  window.fetch = function() {
    var url = arguments[0];
    var options = arguments[1] || {};
    
    // Для запросов к нашему API, добавляем дополнительные заголовки
    if (typeof url === 'string' && url.includes('/api/images/cloudinary')) {
      console.log('Отправка запроса к API Cloudinary:', url, options);
      
      // Добавляем таймаут для уменьшения нагрузки
      return new Promise(function(resolve) {
        setTimeout(function() {
          originalFetch.apply(window, arguments)
            .then(function(response) {
              // Если ответ не успешный, логируем подробности
              if (!response.ok) {
                console.warn('API вернул ошибку:', response.status, response.statusText);
                response.clone().text().then(function(text) {
                  try {
                    console.warn('Содержимое ответа:', text);
                  } catch (e) {
                    console.warn('Не удалось прочитать содержимое ответа');
                  }
                }).catch(function() {});
              }
              resolve(response);
            })
            .catch(function(error) {
              console.error('Ошибка при запросе к API:', error);
              throw error;
            });
        }, 500);
      });
    }
    
    // Пропускаем без изменений все остальные запросы
    return originalFetch.apply(window, arguments);
  };
  
  // Устанавливаем обработчик для отслеживания загрузки Cloudinary
  function checkCloudinaryAvailability() {
    if (typeof window.cloudinary !== 'undefined') {
      console.log('Cloudinary успешно загружен');
      return true;
    }
    return false;
  }
  
  // Проверяем доступность Cloudinary при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(checkCloudinaryAvailability, 2000);
    });
  } else {
    setTimeout(checkCloudinaryAvailability, 2000);
  }
  
  // И при полной загрузке
  window.addEventListener('load', function() {
    setTimeout(checkCloudinaryAvailability, 2000);
  });
  
  console.log('Cloudinary helper успешно инициализирован');
})(); 