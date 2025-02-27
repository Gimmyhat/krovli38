import React from 'react';
import { z } from 'zod';
import axios from 'axios';
import { FormInput, FormTextArea, FormButton } from '../ui/FormElements';
import { useForm } from '../../hooks/useForm';
import { API_URL } from '../../config';

const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов'),
  phone: z.string()
    .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите телефон в формате +7 (XXX) XXX-XX-XX'),
  message: z.string()
    .min(10, 'Сообщение должно содержать минимум 10 символов')
    .max(500, 'Сообщение не должно превышать 500 символов')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  onSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess }) => {
  const {
    register,
    formState: { errors },
    isSubmitting,
    submitError,
    onSubmit,
    reset
  } = useForm<ContactFormData>({
    schema: contactFormSchema,
    async onSubmit(data) {
      try {
        const response = await axios.post(`${API_URL}/requests`, data);
        if (response.status === 201) {
          reset(); // Очищаем форму после успешной отправки
          if (onSuccess) {
            onSuccess(); // Закрываем модальное окно
          }
          // Показываем уведомление об успехе
          const successMessage = document.createElement('div');
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
          successMessage.textContent = 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.';
          document.body.appendChild(successMessage);
          setTimeout(() => {
            successMessage.classList.add('animate-fade-out');
            setTimeout(() => {
              document.body.removeChild(successMessage);
            }, 300);
          }, 5000);
          return response.data;
        }
        throw new Error('Ошибка при отправке формы');
      } catch (error) {
        console.error('Error submitting form:', error);
        throw new Error('Не удалось отправить заявку. Пожалуйста, попробуйте позже.');
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormInput
        name="name"
        label="Ваше имя"
        placeholder="Введите ваше имя"
        register={register}
        error={errors.name}
      />

      <FormInput
        name="phone"
        label="Телефон"
        placeholder="+7 (___) ___-__-__"
        mask="+7 (999) 999-99-99"
        register={register}
        error={errors.phone}
      />

      <FormTextArea
        name="message"
        label="Сообщение"
        placeholder="Опишите ваш вопрос"
        register={register}
        error={errors.message}
      />

      {submitError && (
        <div className="text-red-500 text-sm">{submitError}</div>
      )}

      <FormButton type="submit" isLoading={isSubmitting}>
        Отправить заявку
      </FormButton>
    </form>
  );
};

export default ContactForm; 