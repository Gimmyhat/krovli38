import express, { Router } from 'express';
import { 
  getImages, 
  getImageById, 
  updateImage, 
  deleteImageById,
  uploadSingleImage,
  uploadMultipleImages
} from '../controllers/imageController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { uploadSingleImage as uploadMiddleware, uploadMultipleImages as uploadMultipleMiddleware, handleMulterError } from '../middleware/upload';

const router: Router = express.Router();

/**
 * Маршруты API для работы с изображениями
 * Все пути начинаются с /api/images
 */

// Публичные эндпоинты
// @ts-ignore - временное решение проблем с типами
router.get('/', getImages);
// @ts-ignore - временное решение проблем с типами
router.get('/:id', getImageById);

// Защищенные эндпоинты (только для админов)
// @ts-ignore - временное решение проблем с типами
router.put('/:id', authenticateJWT, requireAdmin, updateImage);
// @ts-ignore - временное решение проблем с типами
router.delete('/:id', authenticateJWT, requireAdmin, deleteImageById);

// Маршруты для загрузки изображений
// @ts-ignore - временное решение проблем с типами
router.post('/upload', authenticateJWT, requireAdmin, uploadMiddleware, handleMulterError, uploadSingleImage);
// @ts-ignore - временное решение проблем с типами
router.post('/upload/multiple', authenticateJWT, requireAdmin, uploadMultipleMiddleware, handleMulterError, uploadMultipleImages);

export default router; 