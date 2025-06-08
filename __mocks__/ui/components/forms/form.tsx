import React from 'react';

export const Form = ({ children, ...props }) => (
  <form data-testid="form" {...props}>
    {children}
  </form>
);

export const FormItem = ({ children, ...props }) => (
  <div data-testid="form-item" {...props}>
    {children}
  </div>
);

export const FormLabel = ({ children, ...props }) => (
  <label data-testid="form-label" {...props}>
    {children}
  </label>
);

export const FormControl = ({ children, ...props }) => (
  <div data-testid="form-control" {...props}>
    {children}
  </div>
);

export const FormDescription = ({ children, ...props }) => (
  <div data-testid="form-description" {...props}>
    {children}
  </div>
);

export const FormMessage = ({ children, ...props }) => (
  <div data-testid="form-message" {...props}>
    {children}
  </div>
);

export const FormField = ({ control, name, render }) => {
  const field = {
    name,
    value: '',
    onChange: () => {},
  };

  return render({ field });
};

export default {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
