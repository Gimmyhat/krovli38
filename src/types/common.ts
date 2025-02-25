import { ReactNode, ButtonHTMLAttributes, ImgHTMLAttributes } from 'react';

// Utility types
export type WithClassName<T = {}> = T & {
  className?: string;
};

export type WithChildren<T = {}> = T & {
  children?: ReactNode;
};

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  isExternal?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

// Work types
export interface WorkItem {
  icon: ReactNode;
  title: string;
  description: string;
  details: string[];
  image?: string;
  tags?: string[];
}

// Form types
export type InputType = 'text' | 'email' | 'tel' | 'textarea';

export interface FormField {
  name: string;
  label?: string;
  type: InputType;
  placeholder?: string;
  required?: boolean;
  validation?: {
    required?: string;
    pattern?: {
      value: RegExp;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
  };
}

export interface ContactFormData {
  name: string;
  phone: string;
  message: string;
  email?: string;
  subject?: string;
}

// Contact information types
export interface ContactInfo {
  phone: string;
  email: string;
  workHours: string;
  address?: string;
  socialLinks?: {
    type: string;
    url: string;
    icon?: ReactNode;
  }[];
}

// Image types
export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  priority?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  category?: string;
  tags?: string[];
  date?: string;
}

// Section types
export interface SectionProps extends WithClassName, WithChildren {
  id?: string;
  title?: string;
  subtitle?: string;
  background?: 'white' | 'gray' | 'dark';
}

// Button types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, WithClassName {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// SEO types
export interface MetaData {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
}

// Service types
export interface ServiceItem {
  icon: ReactNode;
  title: string;
  description: string;
  features?: string[];
  image?: string;
  price?: {
    amount: number;
    currency: string;
    unit?: string;
  };
}

// Benefit types
export interface BenefitItem {
  icon: ReactNode;
  title: string;
  description: string;
} 