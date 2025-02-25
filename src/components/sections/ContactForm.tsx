import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from 'react-input-mask';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Введите телефон в формате +7 (XXX) XXX-XX-XX'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });

  const onSubmit = (data: ContactFormData) => {
    console.log(data);
    // TODO: Добавить отправку формы
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Ваше имя"
          className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Controller
          name="phone"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <InputMask
              mask="+7 (999) 999-99-99"
              value={field.value}
              onChange={field.onChange}
              className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
                errors.phone ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="+7 (___) ___-__-__"
            />
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <textarea
          placeholder="Сообщение"
          rows={4}
          className={`w-full px-4 py-2 rounded-lg bg-gray-800 border ${
            errors.message ? 'border-red-500' : 'border-gray-700'
          }`}
          {...register('message')}
        ></textarea>
        {errors.message && (
          <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Отправить заявку
      </button>
    </form>
  );
};

export default ContactForm; 