import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AuctionStatus, UserRole, Bid } from '../types';
import { Button, Card, Badge, Input, TextArea } from '../components/UI';

export const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auctions, getBidsByAuction, placeBid, invalidateBid } = useData();
  const { currentUser } = useAuth();
  
  const auction = auctions.find(a => a.id === id);
  // Get all bids, including invalidated ones for history
  const allBids = auction ? getBidsByAuction(auction.id) : [];
  
  // Filter valid bids for calculation
  const validBids = allBids.filter(b => !b.isInvalidated);
  
  // State for placing bid
  const [bidAmount, setBidAmount] = useState<string>('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Invalidating bid (Admin)
  const [bidToInvalidate, setBidToInvalidate] = useState<Bid | null>(null);
  const [invalidationReason, setInvalidationReason] = useState('');

  // Force re-render every second for timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!auction || !currentUser) {
    return <div className="p-4 text-center">Leilão não encontrado.</div>;
  }

  const currentVal = validBids.length > 0 ? validBids[0].amount : auction.initialValue;
  
  // Logic updated: Closed if Status is CLOSED OR Time has passed
  const isExpired = Date.now() > auction.expiresAt;
  const isClosed = auction.status === AuctionStatus.CLOSED || isExpired;
  
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  // Winner is the top valid bid if closed
  const winner = isClosed && validBids.length > 0 ? validBids[0] : null;

  // Calculate Time Left
  const getTimeLeft = () => {
    const difference = auction.expiresAt - Date.now();
    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const timeLeft = getTimeLeft();

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const val = parseFloat(bidAmount);
      
      if (isNaN(val)) {
        setError('Insira um valor numérico válido.');
        setIsSubmitting(false);
        return;
      }

      if (val <= currentVal) {
        setError(`O lance deve ser maior que R$ ${currentVal.toFixed(2)}`);
        setIsSubmitting(false);
        return;
      }

      if (isClosed) {
        setError('Este leilão já está encerrado.');
        setIsSubmitting(false);
        return;
      }

      const success = await placeBid(auction.id, currentUser.id, val);
      
      if (success) {
        setSuccessMsg(`Lance de R$ ${val.toFixed(2)} registrado com sucesso!`);
        setBidAmount('');
      } else {
        setError('Não foi possível registrar o lance. O valor pode ter sido superado ou o leilão expirou.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro inesperado ao processar lance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInvalidateModal = (bid: Bid) => {
    setBidToInvalidate(bid);
    setInvalidationReason('');
  };

  const confirmInvalidation = () => {
    if (bidToInvalidate && invalidationReason) {
      invalidateBid(bidToInvalidate.id, invalidationReason);
      setBidToInvalidate(null);
      setInvalidationReason('');
    }
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <Button variant="outline" onClick={() => navigate('/')} className="mb-2">
        ← Voltar para Lista
      </Button>

      {/* Hero Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-64 sm:h-80 bg-slate-200 relative">
          <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4">
             <Badge status={isClosed ? 'CLOSED' : 'OPEN'} />
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
             <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">{auction.title}</h1>
             
             {/* Date & Timer Container */}
             <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-lg flex flex-col items-end min-w-[180px]">
                <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Encerramento</span>
                <span className={`font-semibold text-sm ${isClosed ? 'text-red-600' : 'text-slate-800'}`}>
                    {new Date(auction.expiresAt).toLocaleString('pt-BR')}
                </span>
                
                {/* Countdown Timer */}
                {!isClosed && timeLeft && (
                  <div className="mt-2 flex items-center gap-1.5 bg-slate-800 text-white px-2 py-1 rounded text-xs font-mono font-bold shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {timeLeft.days > 0 && <span className="mr-1">{timeLeft.days}d</span>}
                      {String(timeLeft.hours).padStart(2, '0')}:
                      {String(timeLeft.minutes).padStart(2, '0')}:
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                )}
             </div>
          </div>

          <p className="text-slate-600 leading-relaxed mb-6">{auction.description}</p>
          
          {auction.rules && (
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
               <h4 className="font-semibold text-slate-700 mb-2 text-sm uppercase">Regras e Termos</h4>
               <p className="text-sm text-slate-600">{auction.rules}</p>
             </div>
          )}

          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-6">
                <div>
                <p className="text-sm text-slate-500 font-semibold uppercase">Valor Atual</p>
                <p className="text-4xl font-bold text-slate-800">R$ {currentVal.toFixed(2)}</p>
                {validBids.length > 0 && (
                    <p className="text-sm text-slate-500 mt-1">Último lance: <span className="font-semibold text-slate-700">Apto {validBids[0].userName}</span></p>
                )}
                </div>

                {isClosed && (
                <div className="bg-slate-100 px-6 py-3 rounded-lg text-slate-700 font-medium text-center w-full sm:w-auto">
                    Leilão Encerrado
                </div>
                )}
            </div>
            
            {!isClosed && !isAdmin && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-slate-700 mb-3">Dar um Lance</h3>
                  <form onSubmit={handleBid} className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 focus:outline-none text-lg"
                                placeholder={(currentVal + 1).toFixed(2)}
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            variant="secondary" 
                            className="whitespace-nowrap min-w-[120px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Enviando...' : 'Confirmar'}
                        </Button>
                    </div>
                    {error && <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">{error}</p>}
                    {successMsg && <p className="text-emerald-700 text-sm font-medium bg-emerald-50 p-2 rounded">{successMsg}</p>}
                    <p className="text-xs text-slate-400">O lance deve ser superior a R$ {currentVal.toFixed(2)}</p>
                  </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Winner Section */}
      {isClosed && winner && (
        <Card className="p-6 bg-emerald-50 border-emerald-200 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900">Vencedor do Leilão</h3>
              <p className="text-emerald-700">
                O item foi arrematado pelo <strong>Apto {winner.userName}</strong> com um lance de <strong>R$ {winner.amount.toFixed(2)}</strong>.
              </p>
            </div>
          </div>
        </Card>
      )}
       
      {isClosed && !winner && (
          <Card className="p-6 bg-slate-100 border-slate-200">
             <p className="text-slate-600 text-center font-medium">Leilão encerrado sem lances.</p>
          </Card>
      )}

      {/* Bid History */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico de Lances</h3>
        {allBids.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center italic">Nenhum lance registrado ainda. Seja o primeiro!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 px-3 text-slate-500 font-medium">Data/Hora</th>
                  <th className="py-2 px-3 text-slate-500 font-medium">Participante</th>
                  <th className="py-2 px-3 text-slate-500 font-medium text-right">Valor</th>
                  {isAdmin && <th className="py-2 px-3 text-slate-500 font-medium text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allBids.map((bid, index) => {
                   // Check validity against current dataset
                   const isCurrentWinner = validBids.length > 0 && validBids[0].id === bid.id;
                   
                   return (
                  <tr key={bid.id} className={bid.isInvalidated ? 'bg-red-50' : (isCurrentWinner ? 'bg-emerald-50/50' : '')}>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap align-top">
                      <div className={bid.isInvalidated ? 'opacity-50' : ''}>
                        {new Date(bid.timestamp).toLocaleDateString('pt-BR')} <span className="text-slate-400 text-xs">{new Date(bid.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {bid.isInvalidated && (
                         <div className="text-xs text-red-600 font-bold mt-1">INVALIDADO: {bid.invalidationReason}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium align-top">
                       <span className={bid.isInvalidated ? 'line-through opacity-50' : ''}>Apto {bid.userName}</span>
                       {isCurrentWinner && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Líder</span>}
                    </td>
                    <td className={`py-3 px-3 text-right font-bold align-top ${bid.isInvalidated ? 'text-red-400 line-through decoration-red-400' : 'text-slate-800'}`}>
                      R$ {bid.amount.toFixed(2)}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-3 text-right align-top">
                        {!bid.isInvalidated && !isClosed && (
                          <button 
                            onClick={() => openInvalidateModal(bid)}
                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                          >
                            Invalidar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL INVALIDATION */}
      {bidToInvalidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fade-in">
             <h3 className="text-lg font-bold text-slate-800 mb-2">Invalidar Lance</h3>
             <p className="text-sm text-slate-600 mb-4">
               Você está invalidando o lance de <strong>R$ {bidToInvalidate.amount.toFixed(2)}</strong> feito pelo <strong>Apto {bidToInvalidate.userName}</strong>.
             </p>
             <TextArea
               label="Motivo da invalidação"
               placeholder="Ex: Erro de digitação, lance duplicado..."
               value={invalidationReason}
               onChange={(e) => setInvalidationReason(e.target.value)}
               autoFocus
             />
             <div className="flex gap-2 justify-end mt-4">
               <Button variant="outline" onClick={() => setBidToInvalidate(null)}>Cancelar</Button>
               <Button variant="danger" onClick={confirmInvalidation} disabled={!invalidationReason}>Confirmar</Button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};