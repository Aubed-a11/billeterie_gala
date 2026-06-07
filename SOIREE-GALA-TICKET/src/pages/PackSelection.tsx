import React from 'react';
import { PACKS, type Ticket } from '../models';
import { PackCard } from '../components/PackCard';
import { useOrder } from '../context/OrderContext';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';

interface PackSelectionProps {
  onNext: () => void;
}

export const PackSelection: React.FC<PackSelectionProps> = ({ onNext }) => {
  const { selectedPack, setSelectedPack } = useOrder();

  const handleSelect = (ticket: Ticket) => {
    setSelectedPack(ticket.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12">
      <div className="text-left md:text-center space-y-4 max-w-2xl mx-auto md:mr-auto md:ml-0 lg:ml-12 pt-8">
        <h1 className="font-script text-white leading-none relative">
          <span className="text-5xl md:text-7xl block text-white/90">Soirée</span>
          <span className="text-8xl md:text-9xl block text-gala-gold -mt-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">Gala</span>
        </h1>
        <p className="text-white/80 tracking-[0.3em] font-sans font-light text-xl mt-2 ml-2">
          2026
        </p>
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/70 text-lg font-sans max-w-md">
            Sélectionnez votre ticket pour assister à l'événement le plus prestigieux de l'année.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKS.map((ticket) => (
          <PackCard
            key={ticket.id}
            pack={ticket}
            isSelected={selectedPack === ticket.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!selectedPack}
          className="min-w-[280px] h-16 text-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#C5A059] text-black font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] transition-all duration-200 border-0"
        >
          Continuer
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};
