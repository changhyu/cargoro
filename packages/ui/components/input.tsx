import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={`rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ''}`}
      {...props}
    />
  );
};
