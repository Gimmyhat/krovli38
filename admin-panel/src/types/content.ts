export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  image: string;
}

export interface ContentSection {
  id: string;
  name: string;
  title: string;
  description?: string;
  items?: any[];
}

export interface SiteContent {
  services: Service[];
  benefits: ContentSection;
  types: ContentSection;
  gallery: {
    title: string;
    description?: string;
    images: string[];
  };
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
  };
} 