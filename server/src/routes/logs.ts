import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Получение списка доступных лог-файлов
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.get('/files', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logDir = path.join(__dirname, '../../logs');
    
    // Проверяем существование директории
    if (!fs.existsSync(logDir)) {
      res.status(404).json({ message: 'Директория с логами не найдена' });
      return;
    }
    
    // Получаем список файлов
    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .map(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      });
    
    res.json({ files });
  } catch (error) {
    logger.error('Ошибка при получении списка лог-файлов', { error });
    res.status(500).json({ message: 'Ошибка при получении списка лог-файлов' });
  }
}) as RequestHandler);

// Получение содержимого лог-файла
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.get('/content/:filename', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const logDir = path.join(__dirname, '../../logs');
    const filePath = path.join(logDir, filename);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Файл не найден' });
      return;
    }
    
    // Проверяем, что файл находится в директории логов
    if (!filePath.startsWith(logDir) || !filename.endsWith('.log')) {
      res.status(403).json({ message: 'Доступ запрещен' });
      return;
    }
    
    // Получаем содержимое файла
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Парсим JSON-логи
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          return { raw: line };
        }
      });
    
    res.json({ logs });
  } catch (error) {
    logger.error('Ошибка при чтении лог-файла', { error, filename: req.params.filename });
    res.status(500).json({ message: 'Ошибка при чтении лог-файла' });
  }
}) as RequestHandler);

// Очистка лог-файла
// @ts-expect-error - Express типы не учитывают возвращаемое значение res.json()
router.delete('/clear/:filename', authenticateJWT, requireAdmin, (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filename } = req.params;
    const logDir = path.join(__dirname, '../../logs');
    const filePath = path.join(logDir, filename);
    
    // Проверяем существование файла
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Файл не найден' });
      return;
    }
    
    // Проверяем, что файл находится в директории логов
    if (!filePath.startsWith(logDir) || !filename.endsWith('.log')) {
      res.status(403).json({ message: 'Доступ запрещен' });
      return;
    }
    
    // Очищаем файл
    fs.writeFileSync(filePath, '', 'utf8');
    
    logger.info(`Лог-файл ${filename} был очищен`);
    res.json({ message: 'Файл успешно очищен' });
  } catch (error) {
    logger.error('Ошибка при очистке лог-файла', { error, filename: req.params.filename });
    res.status(500).json({ message: 'Ошибка при очистке лог-файла' });
  }
}) as RequestHandler);

export default router; 