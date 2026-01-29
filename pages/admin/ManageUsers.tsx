import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Button, Card, Input } from '../../components/UI';
import { User, UserRole } from '../../types';
import * as XLSX from 'xlsx';

type ActionType = 'RESET_PASSWORD' | 'DELETE' | null;

export const ManageUsers: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const [formData, setFormData] = useState({ username: '', password: '', name: '' });
  
  // Estado para controlar os Modais de Ação
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<ActionType>(null);
  const [newPassword, setNewPassword] = useState('');

  // Ref para input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    // Check if user exists
    if (users.some(u => u.username === formData.username)) {
      alert('Usuário já existe!');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: formData.username,
      password: formData.password,
      name: formData.name || `Apto ${formData.username}`,
      role: UserRole.RESIDENT,
      mustChangePassword: true,
    };

    addUser(newUser);
    setFormData({ username: '', password: '', name: '' });
  };

  // --- Handlers de Importação em Massa ---

  const handleDownloadTemplate = () => {
    // Define headers and sample data
    const headers = ["Usuário", "Nome", "Função"];
    const sampleData = [
      ["101", "João Silva", "Morador"],
      ["102", "Maria Santos", "Morador"],
      ["sindico", "Carlos", "Administrador"]
    ];

    // Create worksheet and workbook
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");

    // Generate file
    XLSX.writeFile(wb, "modelo_usuarios_spazio.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = event.target?.result;
        if (!data) return;

        try {
          // Read workbook
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to array of arrays
          const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (rows.length < 2) {
            alert('A planilha parece estar vazia ou sem cabeçalho.');
            return;
          }

          let successCount = 0;
          let failCount = 0;

          // Process rows, skipping header (index 0)
          for (let i = 1; i < rows.length; i++) {
              const row = rows[i];
              // Ensure row has data
              if (!row || row.length === 0) continue;

              // Extract columns based on: Usuário (0), Nome (1), Função (2)
              const rawUsername = row[0];
              const rawName = row[1];
              const rawRole = row[2];

              if (!rawUsername) continue;

              // Clean data
              const username = String(rawUsername).trim();
              const name = rawName ? String(rawName).trim() : `Apto ${username}`;
              const roleStr = rawRole ? String(rawRole).trim().toLowerCase() : '';

              // Check duplicates
              if (users.some(u => u.username === username)) {
                  failCount++;
                  continue;
              }

              const role = (roleStr.includes('admin') || roleStr.includes('administrador') || roleStr.includes('síndico')) 
                  ? UserRole.ADMIN 
                  : UserRole.RESIDENT;

              const newUser: User = {
                  id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                  username: username,
                  // Senha padrão é igual ao usuário na importação em massa
                  password: username, 
                  name: name,
                  role: role,
                  mustChangePassword: true // Força troca de senha no primeiro login
              };

              addUser(newUser);
              successCount++;
          }

          alert(`Processamento concluído!\n\n✅ Usuários criados: ${successCount}\n⚠️ Ignorados (já existentes): ${failCount}`);
        } catch (error) {
          console.error("Erro ao ler arquivo Excel:", error);
          alert("Erro ao ler o arquivo. Certifique-se que é um arquivo Excel (.xlsx) válido.");
        }
        
        // Limpar input
        if(fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  // --- Handlers de Abertura de Modal ---

  const openResetPassword = (user: User) => {
    setActiveUser(user);
    setActionType('RESET_PASSWORD');
    setNewPassword(''); // Limpa campo
  };

  const openDeleteConfirm = (user: User) => {
    setActiveUser(user);
    setActionType('DELETE');
  };

  const closeAction = () => {
    setActiveUser(null);
    setActionType(null);
    setNewPassword('');
  };

  // --- Handlers de Execução ---

  const executeResetPassword = () => {
    if (activeUser && newPassword) {
      updateUser({ ...activeUser, password: newPassword, mustChangePassword: true });
      closeAction();
    }
  };

  const executeDelete = () => {
    if (activeUser) {
      deleteUser(activeUser.id);
      closeAction();
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Usuários</h1>
        <p className="text-slate-500">Cadastre moradores individualmente ou em massa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário Individual */}
        <Card className="p-6 h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            Cadastro Individual
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              className="mb-0"
              label="Apto / Usuário" 
              placeholder="Ex: 204"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
            />
            <Input 
               className="mb-0"
               label="Nome (Opcional)"
               placeholder="Ex: Família Silva"
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <Input 
               className="mb-0"
               label="Senha Inicial"
               type="text"
               placeholder="Senha"
               value={formData.password}
               onChange={e => setFormData({...formData, password: e.target.value})}
               required
            />
            <Button type="submit" fullWidth className="mt-2">Adicionar Usuário</Button>
          </form>
        </Card>

        {/* Importação em Massa */}
        <Card className="p-6 h-full bg-slate-50 border-dashed border-2 border-slate-300">
           <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
             Importação em Massa
           </h2>
           <p className="text-sm text-slate-600 mb-4">
             Faça upload de uma planilha Excel (.xlsx) para criar vários usuários de uma vez.
             <br/>
             <span className="text-xs text-slate-500 mt-1 block">
               * A senha inicial será igual ao nome de usuário.
             </span>
           </p>

           <div className="flex flex-col gap-3">
              <Button type="button" variant="outline" onClick={handleDownloadTemplate} className="text-sm">
                📥 Baixar Modelo (.xlsx)
              </Button>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept=".xlsx"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="xlsx-upload"
                />
                <label 
                  htmlFor="xlsx-upload" 
                  className="flex items-center justify-center w-full px-4 py-3 bg-white border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors text-slate-700 font-semibold text-sm shadow-sm"
                >
                  📂 Selecionar Arquivo Excel
                </label>
              </div>
              <p className="text-[10px] text-center text-slate-400">
                Formato: Usuário | Nome | Função
              </p>
           </div>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-600">Usuário</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Nome</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Função</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="py-3 px-4 text-slate-800 font-medium">{user.username}</td>
                  <td className="py-3 px-4 text-slate-600">{user.name}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs uppercase">{user.role}</td>
                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    {user.role !== UserRole.ADMIN && (
                      <>
                        <Button 
                          variant="outline" 
                          className="px-2 py-1 text-xs" 
                          onClick={() => openResetPassword(user)}
                        >
                          Senha
                        </Button>
                        <Button 
                          variant="danger" 
                          className="px-2 py-1 text-xs" 
                          onClick={() => openDeleteConfirm(user)}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {activeUser && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
            
            {/* Modal de Reset de Senha */}
            {actionType === 'RESET_PASSWORD' && (
              <>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Alterar Senha</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Defina a nova senha para o usuário <strong>{activeUser.username}</strong>.
                </p>
                <Input 
                  label="Nova Senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  autoFocus
                />
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" onClick={closeAction}>Cancelar</Button>
                  <Button onClick={executeResetPassword} disabled={!newPassword}>Salvar</Button>
                </div>
              </>
            )}

            {/* Modal de Exclusão */}
            {actionType === 'DELETE' && (
              <>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar Exclusão</h3>
                <p className="text-sm text-slate-600 mb-6">
                  Tem certeza que deseja remover o usuário <strong>{activeUser.username}</strong>? Essa ação não pode ser desfeita.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={closeAction}>Cancelar</Button>
                  <Button variant="danger" onClick={executeDelete}>Excluir Usuário</Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
};