import React from 'react';

export const Card = ({ children, className }) => (
  <div data-testid="card" className={className}>
    {children}
  </div>
);

export const CardHeader = ({ children, className }) => (
  <div data-testid="card-header" className={className}>
    {children}
  </div>
);

export const CardTitle = ({ children, className }) => (
  <div data-testid="card-title" className={className}>
    {children}
  </div>
);

export const CardDescription = ({ children, className }) => (
  <div data-testid="card-description" className={className}>
    {children}
  </div>
);

export const CardContent = ({ children, className }) => (
  <div data-testid="card-content" className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className }) => (
  <div data-testid="card-footer" className={className}>
    {children}
  </div>
);

// Button 모킹 추가
export const Button = ({ children, className, asChild, ...props }) => {
  if (asChild && children) {
    return React.cloneElement(React.Children.only(children), {
      className,
      'data-testid': 'button',
      ...props,
    });
  }

  return (
    <button data-testid="button" className={className} {...props}>
      {children}
    </button>
  );
};

export default {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
};
