import React from 'react';

interface CardProps {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, icon, children, className = '', highlight = false }) => {
  const borderClass = highlight ? 'border-l-accent bg-accent/10' : 'border-l-primary bg-dark-grey';
  const titleColorClass = highlight ? 'text-accent' : 'text-primary';

  return (
    <div className={`rounded-xl p-5 mb-4 shadow-md border-l-4 text-white ${borderClass} ${className}`}>
      {title && (
        <div className={`flex items-center mb-4 text-xl font-bold ${titleColorClass}`}>
          {icon && <i className={`fas ${icon} mr-3`}></i>}
          <h3>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};