import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auction, AuctionStatus, Bid, User, UserRole } from '../types';

interface DataContextType {
  users: User[];
  auctions: Auction[];
  bids: Bid[];
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addAuction: (auction: Auction) => void;
  updateAuction: (auction: Auction) => void;
  deleteAuction: (id: string) => void;
  placeBid: (auctionId: string, userId: string, amount: number) => Promise<boolean>;
  invalidateBid: (bidId: string, reason: string) => void;
  getBidsByAuction: (auctionId: string) => Bid[];
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SEED_USERS: User[] = [
  { id: '1', username: 'spazio', password: 'spazio', role: UserRole.ADMIN, name: 'Administrador', mustChangePassword: true },
  { id: '2', username: '101', password: '101', role: UserRole.RESIDENT, name: 'Apto 101' },
  { id: '3', username: '102', password: '102', role: UserRole.RESIDENT, name: 'Apto 102' },
];

const SEED_AUCTIONS: Auction[] = [
  {
    id: 'a1',
    title: 'Vaga de Garagem Extra (Térreo)',
    description: 'Vaga de garagem localizada próxima ao bloco B, disponível para aluguel por 1 ano.',
    imageUrl: 'https://picsum.photos/seed/parking/400/300',
    initialValue: 150.00,
    status: AuctionStatus.OPEN,
    expiresAt: Date.now() + 172800000, // +2 dias
    createdAt: Date.now(),
    rules: 'Pagamento mensal via boleto condominial. Válido por 12 meses.'
  },
  {
    id: 'a2',
    title: 'Salão de Festas - Ano Novo',
    description: 'Reserva exclusiva do salão de festas para a virada do ano.',
    imageUrl: 'https://picsum.photos/seed/party/400/300',
    initialValue: 500.00,
    status: AuctionStatus.CLOSED,
    expiresAt: Date.now() - 10000000, // Passado
    createdAt: Date.now() - 20000000,
    winnerId: '2',
    winningBidAmount: 650.00
  },
  {
    id: 'a3',
    title: 'Esteira Ergométrica Profissional',
    description: 'Esteira da marca Movement, modelo antigo da academia. Em funcionamento, ideal para uso doméstico moderado.',
    imageUrl: 'https://picsum.photos/seed/gym/400/300',
    initialValue: 300.00,
    status: AuctionStatus.OPEN,
    expiresAt: Date.now() + 432000000, // +5 dias
    createdAt: Date.now(),
    rules: 'Venda no estado em que se encontra (sem garantia). Retirada no local pelo arrematante em até 7 dias.'
  },
  {
    id: 'a4',
    title: 'Salão de Festas - Natal',
    description: 'Reserva do Salão de Festas para o dia 24/12 e 25/12. Celebre o Natal com sua família no condomínio.',
    imageUrl: 'https://picsum.photos/seed/christmas/400/300',
    initialValue: 600.00,
    status: AuctionStatus.OPEN,
    expiresAt: Date.now() + 604800000, // +7 dias
    createdAt: Date.now(),
    rules: 'Uso exclusivo das 18h do dia 24/12 até às 22h do dia 25/12. Limpeza inclusa na taxa de condomínio.'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('spazio_users');
    return stored ? JSON.parse(stored) : SEED_USERS;
  });

  const [auctions, setAuctions] = useState<Auction[]>(() => {
    const stored = localStorage.getItem('spazio_auctions');
    return stored ? JSON.parse(stored) : SEED_AUCTIONS;
  });

  const [bids, setBids] = useState<Bid[]>(() => {
    const stored = localStorage.getItem('spazio_bids');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('spazio_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('spazio_auctions', JSON.stringify(auctions));
  }, [auctions]);

  useEffect(() => {
    localStorage.setItem('spazio_bids', JSON.stringify(bids));
  }, [bids]);

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addAuction = (auction: Auction) => {
    setAuctions(prev => [auction, ...prev]);
  };

  const updateAuction = (updatedAuction: Auction) => {
    setAuctions(prev => prev.map(a => a.id === updatedAuction.id ? updatedAuction : a));
  };

  const deleteAuction = (id: string) => {
    setAuctions(prev => prev.filter(a => a.id !== id));
  };

  const getBidsByAuction = (auctionId: string) => {
    return bids
      .filter(b => b.auctionId === auctionId)
      .sort((a, b) => b.amount - a.amount);
  };

  const invalidateBid = (bidId: string, reason: string) => {
    setBids(prev => prev.map(b => 
      b.id === bidId 
        ? { ...b, isInvalidated: true, invalidationReason: reason } 
        : b
    ));
  };

  const placeBid = async (auctionId: string, userId: string, amount: number): Promise<boolean> => {
    const auction = auctions.find(a => a.id === auctionId);
    
    // Check Status AND Expiration
    if (!auction || auction.status === AuctionStatus.CLOSED) return false;
    if (Date.now() > auction.expiresAt) return false;

    // Ensure we are working with numbers
    const bidValue = Number(amount);
    
    // Get current highest VALID bid
    const currentBids = bids
      .filter(b => b.auctionId === auctionId && !b.isInvalidated)
      .sort((a, b) => b.amount - a.amount);
      
    const highestBid = currentBids.length > 0 ? Number(currentBids[0].amount) : Number(auction.initialValue);

    if (bidValue <= highestBid) {
      console.warn('Lance menor ou igual ao atual:', bidValue, highestBid);
      return false;
    }

    const user = users.find(u => u.id === userId);
    if (!user) return false;

    const newBid: Bid = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      auctionId,
      userId,
      userName: user.username,
      amount: bidValue,
      timestamp: Date.now(),
      isInvalidated: false
    };

    // 1. Atualizar a lista de lances
    setBids(prev => {
      const updated = [newBid, ...prev];
      return updated;
    });

    // 2. Adicionar 5 minutos ao prazo do leilão (Anti-sniping / Extensão dinâmica)
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const updatedAuction = {
      ...auction,
      expiresAt: auction.expiresAt + FIVE_MINUTES_MS
    };

    setAuctions(prev => prev.map(a => a.id === auctionId ? updatedAuction : a));
    
    // Simular delay de rede para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  };

  const resetData = () => {
    setUsers(SEED_USERS);
    setAuctions(SEED_AUCTIONS);
    setBids([]);
  }

  return (
    <DataContext.Provider value={{
      users, auctions, bids,
      addUser, updateUser, deleteUser,
      addAuction, updateAuction, deleteAuction,
      placeBid, invalidateBid, getBidsByAuction, resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};