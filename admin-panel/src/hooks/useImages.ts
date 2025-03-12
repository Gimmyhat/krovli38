import { useState, useCallback } from 'react';
import { fetchImages, ImageData } from '../api/imageApi';

// Объявляем интерфейс для параметров запроса изображений
export interface ImageQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  section?: string;
  search?: string;
  isActive?: boolean;
  tags?: string[];
  sort?: string;
}

export const useImages = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  }>({
    totalItems: 0,
    currentPage: 1,
    totalPages: 0,
    limit: 10
  });

  const getImages = useCallback(async (query?: ImageQueryParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchImages(query);
      setImages(result.images || []);
      setPagination(result.pagination || {
        totalItems: 0,
        currentPage: 1,
        totalPages: 0,
        limit: 10
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке изображений');
      return { 
        images: [], 
        pagination: {
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
          limit: 10
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    images,
    loading,
    error,
    totalCount: pagination.totalItems,
    pagination,
    getImages
  };
}; 