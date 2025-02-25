import React, { createContext, useContext, useState } from 'react';

interface FormContextState {
  submittedForms: {
    [key: string]: {
      lastSubmitted: Date;
      data: any;
    };
  };
  isSubmitting: boolean;
  submitForm: (formId: string, data: any) => Promise<void>;
  getFormData: (formId: string) => any;
}

const FormContext = createContext<FormContextState | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [submittedForms, setSubmittedForms] = useState<FormContextState['submittedForms']>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (formId: string, data: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Здесь будет реальная отправка формы на сервер
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmittedForms(prev => ({
        ...prev,
        [formId]: {
          lastSubmitted: new Date(),
          data
        }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormData = (formId: string) => {
    return submittedForms[formId]?.data;
  };

  return (
    <FormContext.Provider value={{
      submittedForms,
      isSubmitting,
      submitForm,
      getFormData
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
} 