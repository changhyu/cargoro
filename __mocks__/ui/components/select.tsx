import React from 'react';

export const Select = ({ children, ...props }) => (
  <select data-testid="select" {...props}>
    {children}
  </select>
);

export const SelectTrigger = ({ children, ...props }) => (
  <div data-testid="select-trigger" {...props}>
    {children}
  </div>
);

export const SelectValue = ({ children, ...props }) => (
  <span data-testid="select-value" {...props}>
    {children}
  </span>
);

export const SelectContent = ({ children, ...props }) => (
  <div data-testid="select-content" {...props}>
    {children}
  </div>
);

export const SelectItem = ({ children, value, ...props }) => (
  <div data-testid={`select-item-${value}`} data-value={value} {...props}>
    {children}
  </div>
);

export default {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
