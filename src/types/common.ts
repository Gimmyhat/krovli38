import { ReactNode } from 'react';

// Общие типы для навигации
export interface NavItem {
  label: string;
  href: string;
}

// Типы для секции работ
export interface WorkItem {
  icon: ReactNode;
  title: string;
  description: string;
  details: string[];
}

// Типы для форм
export interface ContactFormData {
  name: string;
  phone: string;
  message: string;
}

// Типы для контактной информации
export interface ContactInfo {
  phone: string;
  email: string;
  workHours: string;
}

// Общие типы для компонентов с изображениями
export interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Общие типы для секций
export interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
} 