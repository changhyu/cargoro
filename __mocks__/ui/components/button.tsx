import React from 'react';

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

export default Button;
