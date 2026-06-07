import React, { useState } from 'react';
import { Copy, CheckCircle, Check, Loader2 } from 'lucide-react';

import cihImg from '../assets/cih.png';
import momoImg from '../assets/MoMo.png';
import cihQr from '../assets/cih-qr.png';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

interface PaymentStepProps {
  orderId: string;
  amountDHS: number;
  onSuccess: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ orderId, amountDHS, onSuccess }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => onSuccess(), 800);
  };

  const CopyBtn = ({ text, field }: { text: string; field: string }) => (
    <button
      type="button"
      onClick={() => handleCopy(text, field)}
      className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
    >
      {copiedField === field
        ? <CheckCircle className="w-5 h-5 text-green-400" />
        : <Copy className="w-5 h-5" />}
    </button>
  );

  const InfoRow = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex justify-between items-center bg-slate-800/60 px-4 py-3 rounded-xl border border-slate-700 gap-3">
        <span className="font-medium text-white font-mono text-sm break-all">{value}</span>
        <CopyBtn text={value} field={field} />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-5xl font-serif text-gala-gold">Paiement</h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Votre commande est pré-enregistrée. Effectuez le virement de{' '}
          <span className="text-gala-gold font-bold">{amountDHS} DH</span>{' '}
          via l'un des deux moyens ci-dessous, puis uploadez votre reçu.
        </p>
      </div>

      {/* Les deux méthodes côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── CIH Bank ── */}
        <div className="glass-card p-7 rounded-3xl border border-gala-gold/20 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img src={cihImg} alt="CIH Bank" className="h-10 object-contain" />
            <h3 className="text-lg font-serif text-white">CIH Bank</h3>
          </div>

          <div className="space-y-3 flex-1">
            <InfoRow label="Titulaire" value="MADEMOISELLE EUNICE AVLESSI" field="cih-nom" />
            <InfoRow label="Numéro de compte" value="4615474211005400" field="cih-compte" />
            <InfoRow label="RIB" value="230 810 4615474211005400 62" field="cih-rib" />
            <InfoRow label="IBAN" value="MA64 2308 1046 1547 4211 0054 0062" field="cih-iban" />
            <InfoRow label="Code SWIFT" value="CIHM MAMC" field="cih-swift" />
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <p className="text-xs text-slate-400">Ou scannez le QR code</p>
            <div className="w-40 h-40 overflow-hidden rounded-2xl bg-white border-4 border-white shadow-xl relative">
              <img
                src={cihQr}
                alt="QR Code CIH"
                className="absolute w-full h-[140%] object-cover object-bottom"
              />
            </div>
          </div>
        </div>

        {/* ── Mobile Money ── */}
        <div className="glass-card p-7 rounded-3xl border border-[#FFCC00]/20 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <img src={momoImg} alt="Mobile Money" className="h-10 object-contain" />
            <h3 className="text-lg font-serif text-white">Mobile Money</h3>
          </div>

          <div className="space-y-3 flex-1">
            <InfoRow label="Bénéficiaire" value="DAKO Davina" field="momo-nom" />
            <InfoRow label="Numéro MTN MoMo" value="+229 0167415954" field="momo-numero" />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300 mt-auto">
            💡 Envoyez exactement <strong>{amountDHS} DH</strong> et notez votre nom en commentaire du transfert.
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="glass-card p-8 rounded-3xl border border-gala-gold/20 text-center space-y-4">
        <h3 className="text-lg font-serif text-white">Avez-vous effectué le virement ?</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Une fois le paiement effectué, cliquez ci-dessous. L'administrateur vérifiera la transaction et vous enverra votre ticket par email.
        </p>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleConfirm}
          className="w-full md:w-auto px-12 h-14 text-lg font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 mx-auto bg-green-600 hover:bg-green-700 text-white shadow-green-500/20 hover:scale-[1.02]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Paiement effectué
            </>
          )}
        </button>
      </div>
    </div>
  );
};
