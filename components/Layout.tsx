import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <>{children}</>;
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-slate-900 p-2 rounded-lg text-white group-hover:scale-105 transition-transform duration-200">
              <Logo className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 leading-none">Spazio</span>
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Mario Guimarães</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:block text-right border-r border-slate-200 pr-4 mr-1">
                <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-600">{isAdmin ? 'Administrador' : 'Morador'}</p>
             </div>
             
             <Link 
               to="/change-password" 
               className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
               title="Alterar Senha"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
               </svg>
             </Link>

             <button 
               onClick={logout} 
               className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
               title="Sair"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
               </svg>
             </button>
          </div>
        </div>
        
        {/* Subnav for Admins */}
        {isAdmin && (
          <div className="border-t border-slate-100 bg-white/50">
             <nav className="max-w-4xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar">
               <Link to="/" className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${location.pathname === '/' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                 Visão Geral
               </Link>
               <Link to="/admin/auctions" className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${location.pathname.includes('/admin/auctions') ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                 Gerenciar Itens
               </Link>
               <Link to="/admin/users" className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${location.pathname.includes('/admin/users') ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                 Gerenciar Usuários
               </Link>
             </nav>
          </div>
        )}
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>
      
      <footer className="bg-slate-100 border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4 opacity-30 grayscale">
            <Logo className="w-6 h-6 text-slate-900" dark />
          </div>
          <p className="text-slate-500 text-sm font-medium">Condomínio Spazio Mario Guimarães</p>
          <p className="text-slate-400 text-xs mt-1">Sistema Interno de Leilões &copy; {new Date().getFullYear()}</p>
          <p className="text-slate-400 text-[10px] mt-1 opacity-75">desenvolvido por Henrique dos Santos Louro</p>
        </div>
      </footer>
    </div>
  );
};