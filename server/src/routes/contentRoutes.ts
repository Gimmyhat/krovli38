import express from 'express';
import { getSiteContent, updateService, updateContentSection } from '../controllers/contentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Получение всего контента (доступно без авторизации)
router.get('/', getSiteContent);

// Маршруты, требующие авторизации
router.patch('/services/:id', protect, updateService);
router.patch('/:section', protect, updateContentSection);

export default router; 