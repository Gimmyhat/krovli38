import { useState } from 'react';
import { useForm as useHookForm, UseFormReturn as HookFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseFormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  defaultValues?: Partial<z.infer<T>>;
}

interface FormReturn<T extends z.ZodType> extends Omit<HookFormReturn<z.infer<T>>, 'handleSubmit'> {
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useForm<T extends z.ZodType>({
  schema,
  onSubmit,
  defaultValues
}: UseFormProps<T>): FormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      setIsSubmitting(true);
      const values = await form.handleSubmit((data) => onSubmit(data))();
      setIsSubmitted(true);
      return values;
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Произошла ошибка');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...form,
    isSubmitting,
    isSubmitted,
    submitError,
    onSubmit: handleSubmit
  };
} 