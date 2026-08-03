// src/components/ui/MetricCard.jsx
import React from 'react';
import Card from './Card';
import { cn } from '../../utils/cn';

const MetricCard = ({ label, value, valueColor = 'text-primary', subtitle, icon: Icon, onClick, className = '' }) => {
  return (
    <Card hoverable={!!onClick} onClick={onClick} className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-xs text-subdued uppercase tracking-widest font-semibold">
        <span>{label}</span>
        {Icon && <Icon size={18} className="text-sage shrink-0" />}
      </div>
      <p className={cn('text-3xl font-light tracking-tight', valueColor)}>{value}</p>
      {subtitle && <p className="text-xs text-subdued">{subtitle}</p>}
    </Card>
  );
};

export default MetricCard;
