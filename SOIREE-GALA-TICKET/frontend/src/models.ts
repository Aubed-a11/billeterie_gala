export type TicketType = 'StandardEtudiant' | 'StandardProfessionnel' | 'VIP' | 'Deplacement';

export type Ticket = {
  id: TicketType;
  name: string;
  price: number;
  maxPeople: number;
  description: string;
  color: string;
  emoji: string;
};

export type Beneficiary = {
  nom: string;
  prenom: string;
  cin: string;
};

export interface OrderData {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  cin: string;
  isBeninois: boolean;
  idAsebem?: string;
  pack: string;
  nombrePersonnes: number;
  receiptUrl?: string;
  beneficiaires: Beneficiary[];
};

// Alias pour compatibilité
export type PackType = TicketType;
export type Pack = Ticket;

export const PACKS: Ticket[] = [
  {
    id: 'StandardEtudiant',
    name: 'Ticket Standard Étudiant',
    price: 200,
    maxPeople: 1,
    description: 'Accès à la soirée de gala pour un étudiant.',
    color: 'border-[#CD7F32] bg-[#CD7F32]/10 text-[#CD7F32]',
    emoji: '🎟️',
  },
  {
    id: 'StandardProfessionnel',
    name: 'Ticket Standard Professionnel',
    price: 300,
    maxPeople: 1,
    description: 'Accès à la soirée de gala pour un professionnel.',
    color: 'border-[#b87333] bg-[#b87333]/10 text-[#b87333]',
    emoji: '🎟️',
  },
  {
    id: 'VIP',
    name: 'Ticket VIP',
    price: 2000,
    maxPeople: 6,
    description: 'Table VIP pour 6 personnes avec accès privilégié.',
    color: 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]',
    emoji: '👑',
  },
  {
    id: 'Deplacement',
    name: 'Ticket Déplacement',
    price: 100,
    maxPeople: 1,
    description: 'Participation aux frais de déplacement.',
    color: 'border-[#60a5fa] bg-[#60a5fa]/10 text-[#60a5fa]',
    emoji: '🚌',
  },
];
