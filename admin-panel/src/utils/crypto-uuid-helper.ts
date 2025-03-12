import { v4 as uuidv4 } from 'uuid';

/**
 * Надежный генератор UUID, использующий crypto.randomUUID если доступно,
 * иначе использует библиотеку uuid
 */
export function generateUUID(): string {
  try {
    // Пытаемся использовать нативный crypto.randomUUID
    if (typeof window !== 'undefined' && 
        window.crypto && 
        typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    
    // Fallback на библиотеку uuid
    return uuidv4();
  } catch (error) {
    console.warn('Ошибка при генерации UUID через crypto.randomUUID:', error);
    
    // Гарантированно вернем UUID через библиотеку
    return uuidv4();
  }
}

/**
 * Проверяем и устанавливаем полифилл при необходимости
 */
export function ensureCryptoRandomUUID(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Создаем объект crypto, если он отсутствует
    if (typeof window.crypto === 'undefined') {
      (window as any).crypto = {};
    }
    
    // Устанавливаем полифилл для randomUUID, если функция отсутствует
    if (typeof window.crypto.randomUUID !== 'function') {
      // Создаем функцию, которая соответствует сигнатуре randomUUID
      window.crypto.randomUUID = () => uuidv4();
      
      console.log('Установлен полифилл для crypto.randomUUID с использованием uuid библиотеки');
    }
  } catch (error) {
    console.error('Не удалось установить полифилл для crypto.randomUUID:', error);
  }
}

/**
 * Инициализация полифилла - можно вызвать в entry-point приложения
 */
export function initUuidPolyfill(): void {
  ensureCryptoRandomUUID();
  
  // При необходимости можно добавить периодическую проверку
  const checkInterval = setInterval(() => {
    if (typeof window === 'undefined') {
      clearInterval(checkInterval);
      return;
    }
    
    if (!window.crypto || typeof window.crypto.randomUUID !== 'function') {
      console.warn('crypto.randomUUID недоступен, восстанавливаем...');
      ensureCryptoRandomUUID();
    }
  }, 5000); // Проверка каждые 5 секунд
  
  // Очистка интервала при размонтировании
  if (typeof window !== 'undefined') {
    window.addEventListener('unload', () => {
      clearInterval(checkInterval);
    });
  }
} 