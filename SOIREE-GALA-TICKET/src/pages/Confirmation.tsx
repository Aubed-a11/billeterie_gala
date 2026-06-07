import React, { useRef } from 'react';
import { useOrder } from '../context/OrderContext';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Home, Mail, QrCode } from 'lucide-react';
import { TicketDesign } from '../components/TicketDesign';

interface ConfirmationProps {
  onReset: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ onReset }) => {
  const { orderResult, lastOrderData } = useOrder();
  const ticketRef = useRef<HTMLDivElement>(null);


  if (!lastOrderData) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 text-center">
      {/* Hidden ticket component for html-to-image to render */}
      <div className="absolute top-0 left-[-9999px]">
        <TicketDesign
          ref={ticketRef}
          data={{
            orderId: orderResult?.orderId || 'ASEBEM-7782',
            pack: lastOrderData.pack,
            nom: lastOrderData.nom,
            prenom: lastOrderData.prenom,
            cin: lastOrderData.cin,
            nombrePersonnes: lastOrderData.nombrePersonnes,
            beneficiaires: lastOrderData.beneficiaires
          }}
        />
      </div>

      <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>

      <h1 className="text-4xl font-serif text-white mb-4">
        Commande Confirmée !
      </h1>

      <p className="text-slate-400 text-lg mb-12">
        Merci {lastOrderData.prenom}. Votre réservation pour le <span className="text-white font-semibold">Gala ASEBEM 2026</span> a été enregistrée avec succès.
      </p>

      <div className="glass-card p-8 rounded-3xl text-left mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gala-gold/10 -mr-16 -mt-16 rounded-full blur-2xl" />

        <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
          <QrCode className="w-6 h-6 text-gala-gold" />
          Résumé de la commande
        </h3>

        <div className="space-y-4 relative z-10">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Numéro de commande</p>
              <p className="text-white font-mono text-lg">{orderResult?.orderId || "ASEBEM-7782"}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Pack</p>
              <p className="text-white font-bold text-lg">{lastOrderData.pack}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Places</p>
              <p className="text-white font-bold text-lg">{lastOrderData.nombrePersonnes} Personne(s)</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Statut</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                En attente de validation
              </span>
            </div>
          </div>

          {lastOrderData.beneficiaires.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-bold mb-3">Bénéficiaires</p>
              <div className="space-y-2">
                <p className="text-sm text-slate-300">• {lastOrderData.nom} {lastOrderData.prenom} (Vous)</p>
                {lastOrderData.beneficiaires.map((b, i) => (
                  <p key={i} className="text-sm text-slate-300">• {b.nom} {b.prenom}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-black/50 border border-white/5 p-4 rounded-2xl mb-12 flex items-start gap-4 text-left">
        <div className="bg-amber-500/10 p-3 rounded-xl mt-1">
          <Mail className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="text-white font-bold text-sm mb-1">Que se passe-t-il ensuite ?</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Votre réservation est en cours de traitement. Une fois validée par un administrateur, vous recevrez un email à <strong className="text-white">{lastOrderData.email}</strong> contenant votre billet final avec le QR Code à télécharger pour accéder au Gala.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="secondary" size="lg" onClick={onReset} className="w-full sm:w-auto px-10">
          <Home className="w-5 h-5" />
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
};

