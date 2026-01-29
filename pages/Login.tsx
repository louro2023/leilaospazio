import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { Logo } from '../components/Logo';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    // Simular um pequeno delay para sensação de processamento
    await new Promise(r => setTimeout(r, 600));

    const success = await login(username, password);
    setLoading(false);
    
    if (success) {
      navigate('/');
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-12 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
             <Logo className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Leilão Condomínio</h1>
          <h2 className="text-xl font-light text-indigo-200">Spazio Mario Guimarães</h2>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl animate-fade-in border border-white/50" style={{animationDelay: '100ms'}}>
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-slate-800">Acesso ao Morador</h3>
            <p className="text-sm text-slate-500">Entre com seu apartamento e senha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Apartamento / Usuário" 
              placeholder="Ex: 102"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="mb-4"
            />
            
            <Input 
              label="Senha de Acesso" 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth variant="primary" disabled={loading} className="py-4 text-base shadow-lg shadow-slate-900/20">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </span>
                ) : 'Entrar no Sistema'}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-xs font-medium mb-1">
            &copy; {new Date().getFullYear()} Sistema de Gestão Interna
          </p>
          <p className="text-slate-500/60 text-[10px]">
            desenvolvido por Henrique dos Santos Louro
          </p>
        </div>
      </div>
    </div>
  );
};