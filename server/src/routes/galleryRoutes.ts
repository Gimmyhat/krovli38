import express from 'express';
import { Request, Response } from 'express';
import { 
  getAllGalleryItems, 
  getGalleryItemById, 
  createGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem,
  updateGalleryItemsOrder
} from '../controllers/galleryController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Публичные маршруты (доступны без авторизации)
// @ts-ignore - Игнорируем ошибку типов
router.get('/', getAllGalleryItems);
// @ts-ignore - Игнорируем ошибку типов
router.get('/:id', getGalleryItemById);

// Защищенные маршруты (требуют авторизации)
// @ts-ignore - Игнорируем ошибку типов
router.post('/', authenticateJWT, createGalleryItem);
// @ts-ignore - Игнорируем ошибку типов
router.put('/:id', authenticateJWT, updateGalleryItem);
// @ts-ignore - Игнорируем ошибку типов
router.delete('/:id', authenticateJWT, deleteGalleryItem);
// @ts-ignore - Игнорируем ошибку типов
router.post('/order', authenticateJWT, updateGalleryItemsOrder);

export default router; 