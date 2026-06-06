import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface TicketData {
  orderId: string;
  pack: string;
  nom: string;
  prenom: string;
  cin: string;
  nombrePersonnes: number;
  beneficiaires: { nom: string; prenom: string; cin: string }[];
}

interface TicketDesignProps {
  data: TicketData;
}

export const TicketDesign = forwardRef<HTMLDivElement, TicketDesignProps>(({ data }, ref) => {
  // Mapping des détails par pack pour correspondre au design
  const packDetails = {
    'StandardEtudiant': {
      label: 'ÉTUDIANT',
      sub: 'Standard',
      features: ['Accès Gala'],
      color: 'bg-[#b67954]', // fallback color for overlay
      overlay: 'from-[#C48663]/90 to-[#b67954]/90',
      price: 200,
    },
    'StandardProfessionnel': {
      label: 'PROFESSIONNEL',
      sub: 'Standard',
      features: ['Accès Gala'],
      color: 'bg-[#a76a44]',
      overlay: 'from-[#b07049]/90 to-[#995c37]/90',
      price: 300,
    },
    'VIP': {
      label: 'VIP',
      sub: 'Table 6 pers.',
      features: ['Accès Gala VIP', '6 places réservées'],
      color: 'bg-[#c5a059]',
      overlay: 'from-[#d4b065]/90 to-[#b89146]/90',
      price: 2000,
    }
  };

  const details = packDetails[data.pack as keyof typeof packDetails] || packDetails['StandardEtudiant'];

  // This statue image is the one provided by the user, we assume it's saved in public/statue-bg.png
  const bgImage = '/statue-bg.png';

  // Construction des données du QR code (Format texte lisible)
  const beneficiairesText = data.beneficiaires && data.beneficiaires.length > 0
    ? `\n\n👥 BÉNÉFICIAIRES :\n${data.beneficiaires.map(b => `- ${b.nom} ${b.prenom} (CIN: ${b.cin})`).join('\n')}`
    : '';

  const qrCodeValue = `🎟️ GALA ASEBEM 2026 🎟️
ID: ASEBEM-${data.orderId}
Pack: ${data.pack}

👤 TITULAIRE :
Nom: ${data.nom} ${data.prenom}
CIN: ${data.cin}${beneficiairesText}`;

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl w-[600px] h-[350px] text-white flex flex-col justify-between p-8 ${details.color}`}
      style={{ fontFamily: 'sans-serif' }}
    >
      {/* Background Image with Overlay */}
      <img
        src={bgImage}
        className="absolute inset-0 z-0 w-full h-full object-cover object-center mix-blend-overlay opacity-80"
        alt=""
      />
      <div className={`absolute inset-0 z-0 bg-gradient-to-br ${details.overlay} opacity-80 mix-blend-multiply`} />

      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3">
            <div className="bg-black/40 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit">
              Tridum Culturel
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-0.5 shadow-lg">
                <img src="/logo.png" alt="logo-asebem" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-widest uppercase">{details.label}</h2>
                <div className="bg-black/40 text-white text-xs px-2 py-0.5 rounded-full mt-1 w-fit">
                  {details.sub}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 rounded-lg shadow-lg">
            <QRCodeSVG
              value={qrCodeValue}
              size={80}
              level={"L"}
            />
          </div>
        </div>

        {/* Middle Section */}
        <div className="mt-4">
          <h1 className="text-2xl font-bold mb-2">Gala ASEBEM 2026</h1>
          <div className="space-y-1">
            {details.features.map((feature, idx) => (
              <p key={idx} className="text-sm text-white/90 font-medium">✓ {feature}</p>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/30 border-dashed w-full my-4" />

        {/* Bottom Section */}
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1 text-white/80">Tarif</p>
            <p className="text-3xl font-bold">
              {details.price} <span className="text-lg font-normal">DHS</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest mb-1 text-white/80">Places</p>
            <p className="text-2xl font-bold">
              {data.nombrePersonnes} pers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

TicketDesign.displayName = 'TicketDesign';
