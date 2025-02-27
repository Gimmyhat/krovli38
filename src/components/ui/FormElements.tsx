import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import InputMask from 'react-input-mask';

interface FormFieldProps {
  label?: string;
  error?: FieldError;
  className?: string;
}

interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'tel' | 'password';
  placeholder?: string;
  register: UseFormRegister<any>;
  name: string;
  mask?: string;
}

interface TextAreaProps extends FormFieldProps {
  placeholder?: string;
  register: UseFormRegister<any>;
  name: string;
  rows?: number;
}

const inputStyles = {
  base: 'w-full px-4 py-2 rounded-lg transition-colors duration-200',
  default: 'bg-white border border-gray-300 focus:border-blue-500 focus:outline-none text-gray-900',
  error: 'border-red-500 focus:border-red-500',
  disabled: 'bg-gray-100 cursor-not-allowed opacity-75'
};

export const FormInput: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type = 'text',
  placeholder,
  register,
  name,
  mask,
  ...props
}) => {
  const inputProps = register(name);
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div>
        {mask ? (
          <InputMask
            mask={mask}
            className={`${inputStyles.base} ${error ? inputStyles.error : inputStyles.default} ${className}`}
            placeholder={placeholder}
            {...inputProps}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={`${inputStyles.base} ${error ? inputStyles.error : inputStyles.default} ${className}`}
            placeholder={placeholder}
            {...inputProps}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export const FormTextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  placeholder,
  register,
  name,
  rows = 4,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`${inputStyles.base} ${error ? inputStyles.error : inputStyles.default} ${className}`}
        placeholder={placeholder}
        rows={rows}
        {...register(name)}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export const FormButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }> = ({
  children,
  className = '',
  disabled,
  isLoading,
  ...props
}) => {
  return (
    <button
      className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold 
        hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed
        flex items-center justify-center ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Отправка...
        </>
      ) : children}
    </button>
  );
}; 