/**
 * Расширения для глобальных типов
 */

// Расширяем интерфейс Crypto, добавляя randomUUID
interface Crypto {
  randomUUID?: () => string;
}

// Расширяем интерфейс Window, чтобы включить crypto
interface Window {
  crypto: Crypto & {
    randomUUID?: () => string;
  };
} 