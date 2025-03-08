import express from 'express';
import { protect } from '../middleware/authMiddleware';
import CloudinaryService from '../services/cloudinaryService';

const router = express.Router();

/**
 * @route GET /api/cloudinary/config
 * @desc Получить конфигурацию Cloudinary для frontend
 * @access Private
 */
router.get('/config', protect, async (req, res) => {
  try {
    const config = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    };
    
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка получения конфигурации Cloudinary', error: error.message });
  }
});

/**
 * @route GET /api/cloudinary/signature
 * @desc Получить подпись для загрузки на Cloudinary
 * @access Private
 */
router.get('/signature', protect, async (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = CloudinaryService.generateSignature({
      timestamp,
      // Можно добавить дополнительные параметры, например:
      // folder: 'krovli38',
      // eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop'
    });
    
    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Ошибка генерации подписи', error: error.message });
  }
});

export default router; 