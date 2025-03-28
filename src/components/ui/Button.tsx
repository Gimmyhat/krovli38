import React from 'react';
import { ButtonProps } from '../../types/common';
import { Loader2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const { settings } = useSettings();
  const baseStyles = 'font-semibold transition-colors rounded-lg inline-flex items-center justify-center';
  
  // Используем CSS переменные для динамических цветов
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 disabled:bg-opacity-70',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 disabled:bg-opacity-70',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:bg-opacity-10 disabled:border-opacity-50 disabled:text-opacity-50',
    ghost: 'text-primary hover:bg-primary hover:bg-opacity-10 disabled:text-opacity-50'
  };
  
  // Стили для статических цветов как запасной вариант, если контекст с настройками недоступен
  const fallbackVariants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:text-blue-300'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg'
  };

  // Выбираем вариант стилей в зависимости от доступности настроек
  const variantStyle = settings && Object.keys(settings).length > 0
    ? variants[variant]
    : fallbackVariants[variant];

  return (
    <button
      className={`${baseStyles} ${variantStyle} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button; 