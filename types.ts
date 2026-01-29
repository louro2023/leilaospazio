
export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
}

export interface User {
  id: string;
  username: string; // "spazio" or Apt number
  password?: string; // Only used for initial check, ideally hashed in real backend
  role: UserRole;
  mustChangePassword?: boolean;
  name: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string; // Apt number usually
  amount: number;
  timestamp: number;
  isInvalidated?: boolean;
  invalidationReason?: string;
}

export enum AuctionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  initialValue: number;
  status: AuctionStatus;
  rules?: string;
  expiresAt: number; // Timestamp do encerramento
  createdAt: number;
  winnerId?: string; // Opcional, calculado dinamicamente se expirado
  winningBidAmount?: number;
}
