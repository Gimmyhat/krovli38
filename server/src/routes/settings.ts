import express, { Router } from 'express';
import { 
  getAllSettings, 
  getSettingByKey, 
  updateSetting, 
  updateSettingsGroup, 
  resetSettings 
} from '../controllers/settingsController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router: Router = express.Router();

/**
 * Маршруты API для работы с настройками сайта
 * Все пути начинаются с /api/settings
 */

// Публичные маршруты (доступны без авторизации)
// @ts-ignore - временное решение проблем с типами
router.get('/', getAllSettings);
// @ts-ignore - временное решение проблем с типами
router.get('/:key', getSettingByKey);

// Защищенные маршруты (только для админов)
// @ts-ignore - временное решение проблем с типами
router.put('/:key', authenticateJWT, requireAdmin, updateSetting);
// @ts-ignore - временное решение проблем с типами
router.put('/group/:group', authenticateJWT, requireAdmin, updateSettingsGroup);
// @ts-ignore - временное решение проблем с типами
router.post('/reset', authenticateJWT, requireAdmin, resetSettings);

export default router; 