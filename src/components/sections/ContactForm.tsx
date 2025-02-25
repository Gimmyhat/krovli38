import React from 'react';
import { z } from 'zod';
import { FormInput, FormTextArea, FormButton } from '../ui/FormElements';
import { useForm } from '../../hooks/useForm';

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

const ContactForm: React.FC = () => {
  const {
    register,
    formState: { errors },
    isSubmitting,
    submitError,
    onSubmit
  } = useForm({
    schema: contactFormSchema,
    async onSubmit(data) {
      // TODO: Реализовать отправку формы
      console.log('Form data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация отправки
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