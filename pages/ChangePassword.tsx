import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { useNavigate, Navigate } from 'react-router-dom';

export const ChangePassword: React.FC = () => {
  const { changePassword, currentUser } = useAuth();
  const navigate = useNavigate();
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');

  // Protect route if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isMandatory = currentUser.mustChangePassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (newPass !== confirmPass) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPass === 'spazio') {
      setError('A nova senha não pode ser igual à padrão');
      return;
    }

    changePassword(newPass);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Alterar Senha</h2>
            <p className="text-sm text-slate-500 mt-2">
              {isMandatory 
                ? 'Por segurança, você deve alterar sua senha inicial antes de continuar.' 
                : 'Defina uma nova senha para sua conta.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input 
              label="Nova Senha" 
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
            />
            
            <Input 
              label="Confirmar Nova Senha" 
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button type="submit" fullWidth>
                Salvar Nova Senha
              </Button>
              
              {!isMandatory && (
                <Button type="button" variant="outline" fullWidth onClick={() => navigate('/')}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};