/// <reference types="vite/client" />

import { 
  CloudinaryMediaLibraryOptions, 
  CloudinaryMediaLibraryResult, 
  CloudinaryMediaLibrary,
  CloudinaryUploadWidgetOptions, 
  CloudinaryUploadWidgetResult, 
  CloudinaryUploadWidget
} from './types/cloudinary';

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Расширение глобального типа Window для Cloudinary
interface Window {
  cloudinary: {
    createMediaLibrary(
      options: CloudinaryMediaLibraryOptions, 
      callbacks: { insertHandler: (data: CloudinaryMediaLibraryResult) => void }
    ): CloudinaryMediaLibrary;
    createUploadWidget(
      options: CloudinaryUploadWidgetOptions, 
      callback: (error: Error | null, result: CloudinaryUploadWidgetResult) => void
    ): CloudinaryUploadWidget;
  };
}
