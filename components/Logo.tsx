import React from 'react';

export const Logo: React.FC<{ className?: string, dark?: boolean }> = ({ className = "w-8 h-8", dark = false }) => {
  const color = dark ? "#1e293b" : "#ffffff"; // Slate-800 or White
  
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M3 21H21" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M5 21V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V21" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9 10C9 9.44772 9.44772 9 10 9H14C14.5523 9 15 9.44772 15 10V12C15 12.5523 14.5523 13 14 13H10C9.44772 13 9 12.5523 9 12V10Z" 
        fill={color} 
        fillOpacity="0.2" 
        stroke={color} 
        strokeWidth="1.5"
      />
      <path 
        d="M9 16H15" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M12 3V5" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round"
      />
    </svg>
  );
};