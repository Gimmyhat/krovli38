/**
 * Типы для Cloudinary Media Library виджета
 */
interface CloudinaryMediaLibraryOptions {
  cloud_name: string;
  api_key: string;
  multiple: boolean;
  max_files?: number;
  insert_caption?: string;
  inline_container?: string;
  default_transformations?: [];
  remove_header?: boolean;
  search?: {
    expressions?: string[];
  };
  searchByAssetID?: boolean;
  asset?: {
    resource_type?: string;
    type?: string;
  }
}

interface CloudinaryMediaLibraryResult {
  assets: {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
    type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}

interface CloudinaryMediaLibrary {
  show(options: CloudinaryMediaLibraryOptions): void;
  hide(): void;
  on(event: string, callback: (data: any) => void): void;
}

/**
 * Типы для Cloudinary Upload Widget
 */
interface CloudinaryUploadWidgetOptions {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  sources?: string[];
  multiple?: boolean;
  maxFiles?: number;
  cropping?: boolean;
  croppingAspectRatio?: number;
  croppingDefaultSelectionRatio?: number;
  croppingCoordinatesMode?: string;
  croppingShowDimensions?: boolean;
  folder?: string;
  tags?: string[];
  resourceType?: string;
  context?: Record<string, any>;
  theme?: string;
  styles?: Record<string, any>;
  language?: string;
  text?: Record<string, any>;
  showUploadMoreButton?: boolean;
  singleUploadAutoClose?: boolean;
  queue?: boolean;
  [key: string]: any;
}

interface CloudinaryUploadWidgetResult {
  event: string;
  info: {
    id?: string;
    batchId?: string;
    public_id?: string;
    asset_id?: string;
    bytes?: number;
    width?: number;
    height?: number;
    format?: string;
    resource_type?: string;
    created_at?: string;
    tags?: string[];
    original_filename?: string;
    path?: string;
    url?: string;
    secure_url?: string;
    thumbnail_url?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface CloudinaryUploadWidget {
  open(options?: CloudinaryUploadWidgetOptions): void;
  close(options?: { quiet: boolean }): void;
  update(options: Partial<CloudinaryUploadWidgetOptions>): void;
  destroy(): void;
  isShowing(): boolean;
  minimize(): void;
  isMinimized(): boolean;
}

/**
 * Расширяем глобальный объект window
 */
interface Window {
  cloudinary: {
    createMediaLibrary(options: CloudinaryMediaLibraryOptions, callbacks: { insertHandler: (data: CloudinaryMediaLibraryResult) => void }): CloudinaryMediaLibrary;
    createUploadWidget(options: CloudinaryUploadWidgetOptions, callback: (error: Error | null, result: CloudinaryUploadWidgetResult) => void): CloudinaryUploadWidget;
  };
}

export {
  CloudinaryMediaLibraryOptions,
  CloudinaryMediaLibraryResult,
  CloudinaryMediaLibrary,
  CloudinaryUploadWidgetOptions,
  CloudinaryUploadWidgetResult,
  CloudinaryUploadWidget
}; 