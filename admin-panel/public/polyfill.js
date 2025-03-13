// Полифилл для crypto.randomUUID
(function() {
  // Проверяем наличие объекта crypto
  if (typeof window !== 'undefined') {
    if (!window.crypto) {
      console.log('Полифилл: window.crypto не существует, создаем объект');
      window.crypto = {};
    }
    
    // Проверяем наличие метода getRandomValues
    if (!window.crypto.getRandomValues) {
      console.log('Полифилл: crypto.getRandomValues не существует, создаем метод');
      window.crypto.getRandomValues = function(array) {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      };
    }
    
    // Проверяем наличие метода randomUUID
    if (!window.crypto.randomUUID) {
      console.log('Полифилл: crypto.randomUUID не существует, создаем метод');
      window.crypto.randomUUID = function() {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
          (c ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
      };
    }
    
    console.log('Полифилл для crypto.randomUUID успешно установлен');
  }
})(); 