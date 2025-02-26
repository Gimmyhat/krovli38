import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '../utils/logger';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { Request as RequestModel } from '../models/Request';

const router = express.Router();

// Получение всех заявок
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.get('/', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await RequestModel.find().sort({ createdAt: -1 });
    res.json({ requests });
  } catch (error) {
    logger.error('Ошибка при получении заявок', { error });
    res.status(500).json({ message: 'Ошибка при получении заявок' });
  }
}) as RequestHandler);

// Получение заявки по ID
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.get('/:id', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await RequestModel.findById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Заявка не найдена' });
      return;
    }
    res.json({ request });
  } catch (error) {
    logger.error('Ошибка при получении заявки', { error, id: req.params.id });
    res.status(500).json({ message: 'Ошибка при получении заявки' });
  }
}) as RequestHandler);

// Создание новой заявки (публичный доступ)
router.post('/', function(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const { name, phone, message } = req.body;
      
      if (!name || !phone || !message) {
        res.status(400).json({ message: 'Необходимо заполнить все поля' });
        return;
      }
      
      const request = await RequestModel.create({
        name,
        phone,
        message,
        status: 'new'
      });
      
      logger.info('Создана новая заявка', { requestId: request._id });
      res.status(201).json({ message: 'Заявка успешно создана', request });
    } catch (error) {
      logger.error('Ошибка при создании заявки', { error });
      res.status(500).json({ message: 'Ошибка при создании заявки' });
    }
  })();
});

// Обновление статуса заявки
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.patch('/:id', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, notes } = req.body;
    
    const request = await RequestModel.findById(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Заявка не найдена' });
      return;
    }
    
    if (status) request.status = status;
    if (notes !== undefined) request.notes = notes;
    
    await request.save();
    
    logger.info('Обновлен статус заявки', { 
      requestId: request._id, 
      status: request.status,
      userId: req.user.id
    });
    
    res.json({ message: 'Заявка успешно обновлена', request });
  } catch (error) {
    logger.error('Ошибка при обновлении заявки', { error, id: req.params.id });
    res.status(500).json({ message: 'Ошибка при обновлении заявки' });
  }
}) as RequestHandler);

// Удаление заявки
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.delete('/:id', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const request = await RequestModel.findByIdAndDelete(req.params.id);
    if (!request) {
      res.status(404).json({ message: 'Заявка не найдена' });
      return;
    }
    
    logger.info('Удалена заявка', { 
      requestId: req.params.id,
      userId: req.user.id
    });
    
    res.json({ message: 'Заявка успешно удалена' });
  } catch (error) {
    logger.error('Ошибка при удалении заявки', { error, id: req.params.id });
    res.status(500).json({ message: 'Ошибка при удалении заявки' });
  }
}) as RequestHandler);

export default router; 