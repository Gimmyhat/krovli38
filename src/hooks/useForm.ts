import { useState } from 'react';
import { useForm as useHookForm, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface UseFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  onSubmit: (data: T) => Promise<void> | void;
  defaultValues?: Partial<T>;
}

interface FormReturn<T extends FieldValues> extends Omit<UseFormReturn<T>, 'handleSubmit'> {
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useForm<T extends FieldValues>({
  schema,
  onSubmit,
  defaultValues
}: UseFormProps<T>): FormReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useHookForm<T>({
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