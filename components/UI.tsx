import React from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', fullWidth = false, className = '', ...props 
}) => {
  const base = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide shadow-sm hover:shadow-md";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 border border-transparent",
    secondary: "bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent", // Mudança para Indigo
    danger: "bg-red-500 text-white hover:bg-red-600 border border-transparent",
    outline: "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button className={`${base} ${variants[variant]} ${widthClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">{label}</label>}
      <input 
        className={`w-full px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-4 transition-all duration-300 ${error 
          ? 'border-red-300 bg-red-50 focus:ring-red-100' 
          : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-100'}`}
        {...props} 
      />
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium">{error}</p>}
    </div>
  );
};

// --- Textarea ---
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">{label}</label>}
      <textarea 
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
        rows={4}
        {...props} 
      />
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const isClosed = status === 'CLOSED';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${isClosed ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-500 text-white border border-emerald-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isClosed ? 'bg-slate-400' : 'bg-white animate-pulse'}`}></span>
      {isClosed ? 'Encerrado' : 'Aberto'}
    </span>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};