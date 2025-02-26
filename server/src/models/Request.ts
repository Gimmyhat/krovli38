import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  name: string;
  phone: string;
  message: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>({
  name: {
    type: String,
    required: [true, 'Имя обязательно'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Телефон обязателен'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Сообщение обязательно'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'completed', 'cancelled'],
    default: 'new',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ phone: 1 });

export const Request = mongoose.model<IRequest>('Request', requestSchema); 