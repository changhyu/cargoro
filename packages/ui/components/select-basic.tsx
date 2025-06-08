'use client';

import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectBasicProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SelectBasic: React.FC<SelectBasicProps> = ({
  options,
  value,
  onChange,
  className,
  ...rest
}) => {
  return (
    <select
      className={`rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 ${className ?? ''}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...rest}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};
