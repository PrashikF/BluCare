// src/components/ui/PageContainer.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const PageContainer = ({ children, className = '' }) => {
  return (
    <div className={cn('space-y-8 animate-fade-in', className)}>
      {children}
    </div>
  );
};

export default PageContainer;
