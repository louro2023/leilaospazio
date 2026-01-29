import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Button, Card, Input, TextArea, Badge } from '../../components/UI';
import { Auction, AuctionStatus } from '../../types';

export const ManageAuctions: React.FC = () => {
  const { auctions, addAuction, updateAuction, deleteAuction, getBidsByAuction } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal state for deletion
  const [itemToDelete, setItemToDelete] = useState<Auction | null>(null);

  // Helper to format timestamp to datetime-local string (YYYY-MM-DDThh:mm)
  const formatTimestampForInput = (timestamp: number) => {
    const date = new Date(timestamp);
    // Adjust for local timezone offset to show correct local time in input
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const getTomorrowDefault = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default 1 week
    return date.getTime();
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Auction>>({
    title: '', 
    description: '', 
    imageUrl: 'https://picsum.photos/400/300', 
    initialValue: 0, 
    rules: '',
    expiresAt: getTomorrowDefault()
  });

  const [dateInput, setDateInput] = useState(formatTimestampForInput(getTomorrowDefault()));

  const resetForm = () => {
    const nextWeek = getTomorrowDefault();
    setFormData({ 
      title: '', 
      description: '', 
      imageUrl: 'https://picsum.photos/400/300', 
      initialValue: 0, 
      rules: '',
      expiresAt: nextWeek
    });
    setDateInput(formatTimestampForInput(nextWeek));
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (auction: Auction) => {
    setFormData(auction);
    setDateInput(formatTimestampForInput(auction.expiresAt));
    setEditingId(auction.id);
    setIsEditing(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDateInput(val);
    if (val) {
      const timestamp = new Date(val).getTime();
      setFormData(prev => ({ ...prev, expiresAt: timestamp }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.initialValue) return;

    if (isEditing && editingId) {
      updateAuction({
        ...formData as Auction,
        id: editingId,
      });
    } else {
      addAuction({
        ...formData as Auction,
        id: Date.now().toString(),
        status: AuctionStatus.OPEN,
        createdAt: Date.now(),
      });
    }
    resetForm();
  };

  const handleToggleStatus = (auction: Auction) => {
    const newStatus = auction.status === AuctionStatus.OPEN ? AuctionStatus.CLOSED : AuctionStatus.OPEN;
    updateAuction({
      ...auction,
      status: newStatus,
    });
  };

  const handleDeleteClick = (auction: Auction) => {
    setItemToDelete(auction);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteAuction(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit check
        alert('A imagem é muito grande. Tente uma imagem menor que 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Itens</h1>
        <p className="text-slate-500">Crie ou encerre itens.</p>
      </div>

      {/* Form */}
      <Card className="p-6 bg-slate-50 border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">{isEditing ? 'Editar Item' : 'Novo Item'}</h2>
        <form onSubmit={handleSubmit}>
          <Input 
            label="Título do Item" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="Ex: Vaga de Garagem"
            required
          />
          <TextArea 
            label="Descrição" 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Detalhes do item..."
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Valor Inicial (R$)" 
              type="number"
              step="0.01"
              value={formData.initialValue} 
              onChange={e => setFormData({...formData, initialValue: parseFloat(e.target.value)})}
              required
            />
             
             <Input 
              label="Data de Encerramento" 
              type="datetime-local"
              value={dateInput}
              onChange={handleDateChange}
              required
            />
            
            {/* Image Selection Logic */}
            <div className="space-y-2 col-span-1 md:col-span-2">
                <Input 
                label="URL da Imagem" 
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                placeholder="https://..."
                />
                <div className="text-xs text-slate-500 text-center uppercase font-bold">- OU -</div>
                <div className="mb-4">
                   <label className="block text-slate-700 text-sm font-semibold mb-2">Carregar Imagem (Max 2MB)</label>
                   <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                   />
                </div>
            </div>
          </div>
          <TextArea 
            label="Regras/Termos (Opcional)" 
            value={formData.rules} 
            onChange={e => setFormData({...formData, rules: e.target.value})}
            placeholder="Regras específicas para este item..."
          />
          
          <div className="flex gap-2 justify-end mt-4">
            {isEditing && <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>}
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Criar Item'}</Button>
          </div>
        </form>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {auctions.map(auction => {
            const isExpired = Date.now() > auction.expiresAt;
            return (
          <Card key={auction.id} className="p-4 flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-32 h-32 bg-slate-200 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={auction.imageUrl} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="flex-grow">
               <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 text-lg">{auction.title}</h3>
                  <Badge status={auction.status === AuctionStatus.OPEN && !isExpired ? 'OPEN' : 'CLOSED'} />
               </div>
               <p className="text-sm text-slate-500 mb-1">Valor Inicial: R$ {auction.initialValue.toFixed(2)}</p>
               <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-slate-600'}`}>
                 Encerra em: {new Date(auction.expiresAt).toLocaleString('pt-BR')}
               </p>
               
               <div className="flex flex-wrap gap-2 mt-4">
                  <Button type="button" variant="outline" className="text-xs py-1 px-3" onClick={() => handleEdit(auction)}>
                    Editar
                  </Button>
                  <Button 
                    type="button"
                    variant={auction.status === AuctionStatus.OPEN ? "danger" : "secondary"} 
                    className="text-xs py-1 px-3" 
                    onClick={() => handleToggleStatus(auction)}
                  >
                    {auction.status === AuctionStatus.OPEN ? 'Encerrar Manualmente' : 'Reabrir'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="text-xs py-1 px-3 text-red-600 border-red-200 hover:bg-red-50" 
                    onClick={() => handleDeleteClick(auction)}
                  >
                    Excluir
                  </Button>
               </div>
             </div>
          </Card>
        )})}
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Item</h3>
             <p className="text-sm text-slate-600 mb-6">
               Tem certeza que deseja excluir o item <strong>{itemToDelete.title}</strong>? Esta ação não pode ser desfeita.
             </p>
             <div className="flex gap-2 justify-end">
               <Button variant="outline" onClick={() => setItemToDelete(null)}>Cancelar</Button>
               <Button variant="danger" onClick={confirmDelete}>Excluir Definitivamente</Button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};