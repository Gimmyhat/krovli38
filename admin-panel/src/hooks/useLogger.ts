import { useCallback } from 'react';

interface LoggerOptions {
  module?: string;
  timestamp?: boolean;
}

interface LogData {
  [key: string]: any;
}

export const useLogger = (options: LoggerOptions = {}) => {
  const { module = 'App', timestamp = true } = options;

  const formatMessage = useCallback((level: string, message: string, data?: LogData) => {
    const ts = timestamp ? `[${new Date().toISOString()}]` : '';
    const modulePrefix = `[${module}]`;
    const levelPrefix = `[${level}]`;
    
    let formattedMessage = `${ts} ${modulePrefix} ${levelPrefix} ${message}`;
    
    if (data) {
      try {
        formattedMessage += ` ${JSON.stringify(data)}`;
      } catch (e) {
        formattedMessage += ' [Не удалось сериализовать данные]';
      }
    }
    
    return formattedMessage;
  }, [module, timestamp]);

  const info = useCallback((message: string, data?: LogData) => {
    const formattedMessage = formatMessage('INFO', message, data);
    console.info(formattedMessage);
    
    // Здесь можно добавить отправку логов на сервер
    
    return formattedMessage;
  }, [formatMessage]);

  const error = useCallback((message: string, data?: LogData) => {
    const formattedMessage = formatMessage('ERROR', message, data);
    console.error(formattedMessage);
    
    // Здесь можно добавить отправку логов на сервер
    
    return formattedMessage;
  }, [formatMessage]);

  const warn = useCallback((message: string, data?: LogData) => {
    const formattedMessage = formatMessage('WARN', message, data);
    console.warn(formattedMessage);
    
    // Здесь можно добавить отправку логов на сервер
    
    return formattedMessage;
  }, [formatMessage]);

  const debug = useCallback((message: string, data?: LogData) => {
    const formattedMessage = formatMessage('DEBUG', message, data);
    console.debug(formattedMessage);
    
    // Здесь можно добавить отправку логов на сервер
    
    return formattedMessage;
  }, [formatMessage]);

  return {
    info,
    error,
    warn,
    debug
  };
}; 