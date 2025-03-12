/**
 * Полифилл для crypto.randomUUID
 * Этот скрипт добавляет поддержку crypto.randomUUID для старых версий браузеров и Node.js
 */
(function() {
  console.log('Инициализация полифилла crypto-polyfill.js');
  
  // Проверяем наличие объекта crypto
  if (typeof window.crypto === 'undefined') {
    console.warn('Объект crypto не найден в window, создаем полифилл');
    window.crypto = {};
  }
  
  // Проверяем наличие метода getRandomValues
  if (typeof window.crypto.getRandomValues !== 'function') {
    console.warn('Метод crypto.getRandomValues не найден, создаем полифилл');
    window.crypto.getRandomValues = function(array) {
      if (!array) return array;
      
      // Безопасное получение длины массива
      const len = array.byteLength || 0;
      // Обрабатываем массив как Uint8Array
      const uint8Array = new Uint8Array(array.buffer, array.byteOffset, len);
      
      for (let i = 0; i < len; i++) {
        uint8Array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
  
  // Проверяем наличие метода randomUUID
  if (typeof window.crypto.randomUUID !== 'function') {
    console.warn('Метод crypto.randomUUID не найден, создаем полифилл');
    window.crypto.randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
  
  // Проверяем работу полифилла
  try {
    const testUUID = window.crypto.randomUUID();
    console.log('Полифилл crypto.randomUUID успешно установлен:', testUUID);
    window._cryptoPolyfilled = true;
  } catch (error) {
    console.error('Ошибка при проверке полифилла crypto.randomUUID:', error);
  }
  
  console.log('Полифилл crypto-polyfill.js инициализирован');
})(); 