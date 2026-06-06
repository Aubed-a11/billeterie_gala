import React, { useState } from 'react';
import { Copy, CheckCircle, Check } from 'lucide-react';
import { Button } from './ui/Button';

import cihImg from '../assets/cih.png';
import momoImg from '../assets/MoMo.png';
import cihQr from '../assets/cih-qr.png';

interface PaymentStepProps {
  orderId: string;
  onSuccess: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ orderId, onSuccess }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = () => {
    setIsConfirming(true);
    // Simulate a tiny delay for UX then trigger success
    setTimeout(() => {
      onSuccess();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-serif text-gala-gold">Paiement</h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Votre commande est pré-enregistrée. Veuillez procéder au paiement pour la valider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CIH Bank Card */}
        <div className="glass-card p-8 rounded-3xl border border-gala-gold/20 flex flex-col h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e03131]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <img src={cihImg} alt="CIH Bank" className="h-12 object-contain" />
          </div>
          
          <div className="space-y-4 flex-1 relative z-10">
            <div>
              <p className="text-sm text-slate-400 mb-1">Nom du titulaire du compte</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white">Bureau Asebem</span>
                <button onClick={() => handleCopy("Bureau Asebem", "cih-nom")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "cih-nom" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Numéro de compte</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white font-mono">4615474211005400</span>
                <button onClick={() => handleCopy("4615474211005400", "cih-compte")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "cih-compte" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">RIB</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white font-mono">230 810 4615474211005400 62</span>
                <button onClick={() => handleCopy("230 810 4615474211005400 62", "cih-rib")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "cih-rib" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">IBAN</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white font-mono">MA64 2308 1046 1547 4211 0054 0062</span>
                <button onClick={() => handleCopy("MA64 2308 1046 1547 4211 0054 0062", "cih-iban")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "cih-iban" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* QR Code Cropped */}
            <div className="pt-4 flex justify-center">
              <div className="w-48 h-48 overflow-hidden rounded-2xl bg-white border-4 border-white shadow-xl relative">
                <img 
                  src={cihQr} 
                  alt="QR Code CIH" 
                  className="absolute w-full h-[140%] object-cover object-bottom"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Money Card */}
        <div className="glass-card p-8 rounded-3xl border border-gala-gold/20 flex flex-col h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffcc00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img src={momoImg} alt="Mobile Money" className="h-12 object-contain mb-6 self-start relative z-10" />
          
          <div className="space-y-4 flex-1 relative z-10">
            <div>
              <p className="text-sm text-slate-400 mb-1">Nom du bénéficiaire</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white">Bureau Asebem</span>
                <button onClick={() => handleCopy("Bureau Asebem", "momo-nom")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "momo-nom" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Numéro Mobile Money</p>
              <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <span className="font-medium text-white font-mono">+229 0167415954</span>
                <button onClick={() => handleCopy("+229 0167415954", "momo-numero")} className="text-slate-400 hover:text-white transition-colors">
                  {copiedField === "momo-numero" ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className="glass-card p-8 rounded-3xl border border-gala-gold/20 mt-8 text-center">
        <h3 className="text-xl font-serif text-white mb-4">
          Avez-vous effectué le transfert ?
        </h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Une fois le virement bancaire ou Mobile Money réalisé, cliquez sur le bouton ci-dessous pour confirmer votre réservation. L'administrateur vérifiera ensuite la transaction.
        </p>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleSubmit} isLoading={isConfirming} className="w-full md:w-auto px-12 gap-2 bg-green-600 hover:bg-green-700 shadow-green-500/20">
            <Check className="w-5 h-5" />
            Paiement effectué
          </Button>
        </div>
      </div>
    </div>
  );
};
