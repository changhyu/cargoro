'use client';

import * as React from 'react';
// import * as LabelPrimitive from '@radix-ui/react-label';
// import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerFieldState,
  ControllerProps,
  ControllerRenderProps,
  FieldErrors,
  FieldPath,
  FieldValues,
  // FormProvider,
  UseFormProps,
  UseFormReturn,
  UseFormStateReturn,
  // useFormContext,
  useForm as useHookForm,
} from 'react-hook-form';
import { Label } from '../label';
import { cn } from '../../utils';

const Form = React.forwardRef<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => {
    return <form ref={ref} className={cn('flex flex-col space-y-6', className)} {...props} />;
  }
);
Form.displayName = 'Form';

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return <Label ref={ref} className={cn(className)} {...props} />;
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => {
  return <div ref={ref} {...props} />;
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />;
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return children ? (
    <p ref={ref} className={cn('text-sm font-medium text-red-500', className)} {...props}>
      {children}
    </p>
  ) : null;
});
FormMessage.displayName = 'FormMessage';

// React Hook Form 훅과 통합된 useForm
function useForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown>(
  props?: UseFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext> {
  return useHookForm<TFieldValues, TContext>(props);
}

// 에러 메시지 포매팅 헬퍼 함수
const getFormErrorMessage = (errors: FieldErrors, name: string): string | undefined => {
  const error = errors[name];
  return error?.message as string | undefined;
};

// FormField 컴포넌트 - React Hook Form의 Controller를 래핑
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error('useFormField은 FormField 내부에서만 사용해야 합니다.');
  }

  return {
    id: itemContext.id,
    name: fieldContext.name,
  };
};

// FormField Props 타입을 별도로 정의하여 export 문제 해결
interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<ControllerProps<TFieldValues, TName>, 'render'> {
  render: (props: {
    field: ControllerRenderProps<TFieldValues, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ render, name, ...props }: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} {...props} render={renderProps => render(renderProps)} />
    </FormFieldContext.Provider>
  );
}

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  getFormErrorMessage,
  useForm,
  useFormField,
};

// 타입도 export (선택적)
export type { FormFieldProps };
