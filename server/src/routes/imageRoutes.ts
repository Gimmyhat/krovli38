import express, { Router } from 'express';
import { 
  getImages, 
  getImageById, 
  updateImage, 
  deleteImageById,
  uploadSingleImage,
  uploadMultipleImages,
  scanAndMigrateImages
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

// Маршрут для сканирования и миграции изображений
// @ts-ignore - временное решение проблем с типами
router.get('/scan', authenticateJWT, requireAdmin, scanAndMigrateImages);

// Маршрут для сохранения изображений из Cloudinary
// @ts-ignore - временное решение проблем с типами
router.post('/cloudinary', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { assets } = req.body;
    
    if (!assets || !Array.isArray(assets)) {
      return res.status(400).json({ message: 'Отсутствуют данные об изображениях (assets)' });
    }
    
    // TODO: Реализовать сохранение изображений из Cloudinary в базу данных
    // Здесь нужно будет:
    // 1. Преобразовать assets в формат Image из модели
    // 2. Сохранить изображения в MongoDB
    
    // Временная заглушка для тестирования
    console.log('Received Cloudinary assets:', assets);
    
    res.status(200).json({ 
      message: 'Изображения из Cloudinary получены успешно', 
      count: assets.length,
      // В дальнейшем тут будут возвращаться сохраненные изображения
      images: assets.map(asset => ({
        _id: 'temp_id_' + Math.random().toString(36).substring(7),
        publicId: asset.public_id,
        url: asset.url,
        secureUrl: asset.secure_url
      }))
    });
  } catch (error: any) {
    console.error('Ошибка при обработке изображений из Cloudinary:', error);
    res.status(500).json({ message: 'Ошибка при обработке изображений', error: error.message });
  }
});

export default router; 