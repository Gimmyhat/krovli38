import { createElement } from 'react';
import { ClipboardList, Wrench, PenTool } from 'lucide-react';
import { WorkItem } from '../types/common';

export const WORK_ITEMS: WorkItem[] = [
  {
    icon: createElement(ClipboardList, { className: "h-12 w-12 text-blue-600" }),
    title: 'Обследование кровли',
    description: 'Детальная диагностика состояния, выявление дефектов, составление плана работ',
    details: ['Тепловизионное обследование', 'Проверка несущих конструкций', 'Анализ состояния покрытия']
  },
  {
    icon: createElement(Wrench, { className: "h-12 w-12 text-blue-600" }),
    title: 'Текущий ремонт',
    description: 'Устранение локальных повреждений и дефектов кровельного покрытия',
    details: ['Ремонт протечек', 'Восстановление примыканий', 'Очистка водостоков']
  },
  {
    icon: createElement(PenTool, { className: "h-12 w-12 text-blue-600" }),
    title: 'Капитальный ремонт',
    description: 'Полная замена кровельного пирога с использованием современных материалов',
    details: ['Демонтаж старого покрытия', 'Устройство пароизоляции', 'Монтаж утеплителя']
  }
]; 