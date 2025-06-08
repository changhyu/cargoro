import React from 'react';

export interface CustomButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export const CustomButton = ({ children, className }: CustomButtonProps) => {
  return <div className={className}>{children}</div>;
};
