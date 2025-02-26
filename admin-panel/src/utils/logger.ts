// Уровни логирования
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Настройки логгера
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableLocalStorage: boolean;
  maxLocalStorageEntries: number;
  localStorageKey: string;
}

// Запись лога
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

// Конфигурация по умолчанию
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  enableConsole: true,
  enableLocalStorage: true,
  maxLocalStorageEntries: 100,
  localStorageKey: 'app_logs'
};

// Уровни логирования в порядке важности
const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Проверка, должен ли лог быть записан в зависимости от уровня
  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[this.config.level];
  }

  // Форматирование сообщения
  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  // Сохранение лога в localStorage
  private saveToLocalStorage(entry: LogEntry): void {
    if (!this.config.enableLocalStorage) return;

    try {
      const logsJson = localStorage.getItem(this.config.localStorageKey) || '[]';
      const logs: LogEntry[] = JSON.parse(logsJson);
      
      logs.push(entry);
      
      // Ограничиваем количество записей
      while (logs.length > this.config.maxLocalStorageEntries) {
        logs.shift();
      }
      
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Ошибка при сохранении логов в localStorage:', error);
    }
  }

  // Вывод в консоль
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { level, message, data, timestamp } = entry;
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '');
        break;
      case 'info':
        console.info(formattedMessage, data || '');
        break;
      case 'warn':
        console.warn(formattedMessage, data || '');
        break;
      case 'error':
        console.error(formattedMessage, data || '');
        break;
    }
  }

  // Публичные методы для разных уровней логирования
  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.formatMessage('debug', message, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.formatMessage('info', message, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.formatMessage('warn', message, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  error(message: string, data?: any): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.formatMessage('error', message, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  // Получение всех логов из localStorage
  getLogs(): LogEntry[] {
    try {
      const logsJson = localStorage.getItem(this.config.localStorageKey) || '[]';
      return JSON.parse(logsJson);
    } catch (error) {
      console.error('Ошибка при получении логов из localStorage:', error);
      return [];
    }
  }

  // Очистка логов в localStorage
  clearLogs(): void {
    try {
      localStorage.removeItem(this.config.localStorageKey);
    } catch (error) {
      console.error('Ошибка при очистке логов в localStorage:', error);
    }
  }
}

// Создаем и экспортируем экземпляр логгера
const logger = new Logger();
export default logger; 