// src/components/ui/LoadingSkeleton.jsx
import React from 'react';
import GlassCard from './GlassCard';

export const CardSkeleton = () => {
  return (
    <GlassCard className="space-y-4 animate-pulse">
      <div className="h-4 bg-bg-surface rounded-full w-1/3" />
      <div className="h-8 bg-bg-surface rounded-2xl w-2/3" />
      <div className="h-3 bg-bg-surface rounded-full w-1/2" />
    </GlassCard>
  );
};

export const TableSkeleton = ({ rows = 3 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-16 bg-bg-card/40 border border-light rounded-2xl p-4 flex items-center justify-between">
          <div className="h-4 bg-bg-surface rounded-full w-1/4" />
          <div className="h-4 bg-bg-surface rounded-full w-1/3" />
          <div className="h-6 bg-bg-surface rounded-full w-16" />
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
