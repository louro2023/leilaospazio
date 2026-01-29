import React from 'react';
import { useData } from '../context/DataContext';
import { Card, Badge, Button } from '../components/UI';
import { Auction, AuctionStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const AuctionItemCard: React.FC<{ auction: Auction }> = ({ auction }) => {
  const navigate = useNavigate();
  const { getBidsByAuction } = useData();
  const bids = getBidsByAuction(auction.id);
  const currentVal = bids.length > 0 ? bids[0].amount : auction.initialValue;

  const isExpired = Date.now() > auction.expiresAt;
  const isClosed = auction.status === AuctionStatus.CLOSED || isExpired;
  
  // Format expiration
  const expireDate = new Date(auction.expiresAt);
  const now = new Date();
  const diffHours = (expireDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let timeText = `Encerra em ${expireDate.toLocaleDateString('pt-BR')} às ${expireDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
  let timeColor = "text-slate-500";

  if (isClosed) {
    timeText = "Finalizado";
    timeColor = "text-red-500";
  } else if (diffHours < 24) {
    timeText = `Encerra hoje às ${expireDate.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
    timeColor = "text-orange-600 font-bold";
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/auction/${auction.id}`)}>
      <div className="h-48 bg-slate-200 relative">
        <img src={auction.imageUrl} alt={auction.title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2">
           <Badge status={isClosed ? 'CLOSED' : 'OPEN'} />
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{auction.title}</h3>
        <p className="text-sm text-slate-500 mb-2 line-clamp-2">{auction.description}</p>
        
        <p className={`text-xs mb-4 ${timeColor} flex items-center gap-1`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {timeText}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Valor Atual</p>
            <p className="text-xl font-bold text-slate-800">R$ {currentVal.toFixed(2)}</p>
          </div>
          <Button variant={isClosed ? "outline" : "secondary"} className="text-xs py-2 px-3">
            {isClosed ? 'Ver Resultado' : 'Dar Lance'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { auctions } = useData();

  // Sort: Active first, then by date descending
  const sortedAuctions = [...auctions].sort((a, b) => {
    const aExpired = Date.now() > a.expiresAt || a.status === AuctionStatus.CLOSED;
    const bExpired = Date.now() > b.expiresAt || b.status === AuctionStatus.CLOSED;
    
    if (aExpired === bExpired) {
      return b.expiresAt - a.expiresAt;
    }
    return aExpired ? 1 : -1;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Itens em Leilão</h1>
        <p className="text-slate-500">Acompanhe e participe dos leilões ativos.</p>
      </div>

      {sortedAuctions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500">Nenhum leilão disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sortedAuctions.map(auction => (
            <AuctionItemCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};