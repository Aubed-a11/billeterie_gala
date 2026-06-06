export type PackType = 'StandardEtudiant' | 'StandardProfessionnel' | 'VIP';

export type Pack = {
  id: PackType;
  name: string;
  price: number;
  maxPeople: number;
  description: string;
  color: string;
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

export const PACKS: Pack[] = [
  {
    id: 'StandardEtudiant',
    name: 'Ticket Standard Étudiant',
    price: 200,
    maxPeople: 1,
    description: 'Accès standard pour étudiant.',
    color: 'border-[#CD7F32] bg-[#CD7F32]/10 text-[#CD7F32]',
  },
  {
    id: 'StandardProfessionnel',
    name: 'Ticket Standard Professionnel',
    price: 300,
    maxPeople: 1,
    description: 'Accès standard pour professionnel.',
    color: 'border-[#b87333] bg-[#b87333]/10 text-[#b87333]',
  },
  {
    id: 'VIP',
    name: 'Ticket VIP',
    price: 2000,
    maxPeople: 6,
    description: 'Table VIP pour 6 personnes.',
    color: 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]',
  }
];
