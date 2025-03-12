/**
 * Монитор ошибок: отслеживает и перехватывает критические ошибки
 * Также добавляет полифиллы для общих источников ошибок
 */
(function() {
  console.log('Инициализация error-monitor.js');

  // Сохраняем оригинальные функции
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalFetch = window.fetch;
  
  // Перехватчик для console.error
  console.error = function() {
    // Проверяем, связана ли ошибка с crypto.randomUUID
    const args = Array.from(arguments);
    const errorString = args.join(' ');
    
    if (errorString.includes('crypto.randomUUID')) {
      console.warn('error-monitor: Перехвачена ошибка crypto.randomUUID в console.error');
      
      // Пытаемся исправить ошибку
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
      }
      
      if (typeof window.crypto.randomUUID !== 'function') {
        window.crypto.randomUUID = function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
      }
    }
    
    // Вызываем оригинальную функцию
    return originalConsoleError.apply(console, args);
  };
  
  // Перехватчик для fetch, чтобы обрабатывать 404 для иконок
  window.fetch = function() {
    const url = arguments[0];
    if (typeof url === 'string' || url instanceof URL) {
      const urlStr = url.toString();
      // Если запрашиваем иконки и они находятся не в правильном пути,
      // перенаправляем запрос в правильное место
      if (urlStr.includes('favicon.svg') || urlStr.includes('favicon.png') || urlStr.includes('vite.svg')) {
        console.log('error-monitor: Перехвачен запрос на иконку:', urlStr);
        
        // Если запрос идет не по /admin/ пути, перенаправляем
        if (!urlStr.includes('/admin/')) {
          const fileName = urlStr.substring(urlStr.lastIndexOf('/') + 1);
          const newUrl = '/admin/' + fileName;
          console.log('error-monitor: Перенаправляем запрос на:', newUrl);
          
          // Заменяем URL на корректный
          const newArgs = [...arguments];
          newArgs[0] = new URL(newUrl, window.location.origin).toString();
          return originalFetch.apply(window, newArgs);
        }
      }
    }
    
    // Вызываем оригинальную функцию fetch
    return originalFetch.apply(window, arguments);
  };
  
  // Регистрируем обработчик ошибок
  window.addEventListener('error', function(event) {
    console.log('error-monitor: Перехвачена ошибка:', event.message);
    
    // Проверяем тип ошибки и пытаемся исправить
    if (event.message && event.message.includes('crypto.randomUUID')) {
      console.warn('error-monitor: Обнаружена ошибка crypto.randomUUID, применяем исправление');
      
      // Добавляем полифилл
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
      }
      
      if (typeof window.crypto.randomUUID !== 'function') {
        window.crypto.randomUUID = function() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
      }
      
      // Проверяем, что исправление работает
      try {
        const testUUID = window.crypto.randomUUID();
        console.log('error-monitor: Полифилл установлен, тест:', testUUID);
      } catch (e) {
        console.error('error-monitor: Не удалось установить полифилл:', e);
      }
    }
  }, true);
  
  console.log('error-monitor.js инициализирован');
})(); 