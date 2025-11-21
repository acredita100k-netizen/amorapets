import React from 'react';

interface InfoBoxProps {
  icon: string;
  label: string;
  text?: string;
  children?: React.ReactNode;
}

export const InfoBox: React.FC<InfoBoxProps> = ({ icon, label, text, children }) => {
  return (
    <div className="bg-dark-grey border-l-4 border-primary p-4 rounded-lg mb-4 flex items-start">
      <div className="text-primary mt-1 mr-3 text-lg">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="text-sm text-gray-300">
        <strong className="text-white block mb-1">{label}</strong>
        {text && <span>{text}</span>}
        {children}
      </div>
    </div>
  );
};