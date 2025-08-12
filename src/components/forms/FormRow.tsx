import React from 'react';

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

const getAlignClasses = (align: string) => {
  switch (align) {
    case 'start': return 'items-start';
    case 'center': return 'items-center';
    case 'end': return 'items-end';
    case 'stretch': return 'items-stretch';
    default: return 'items-start';
  }
};

const getGapClasses = (gap: string) => {
  switch (gap) {
    case 'sm': return 'gap-2';
    case 'md': return 'gap-4';
    case 'lg': return 'gap-6';
    default: return 'gap-4';
  }
};

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className = '',
  align = 'start',
  gap = 'md',
  wrap = true
}) => {
  return (
    <div className={`flex ${getAlignClasses(align)} ${getGapClasses(gap)} ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${className}`}>
      {children}
    </div>
  );
};