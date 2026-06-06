import { useState } from 'react';
import { OrderProvider } from './context/OrderContext';
import { PackSelection } from './pages/PackSelection';
import { OrderForm } from './pages/OrderForm';
import { Confirmation } from './pages/Confirmation';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import whatsappImg from './assets/whatsapp.png';

type Step = 'selection' | 'form' | 'confirmation';

function AppContent() {
  const [step, setStep] = useState<Step>('selection');

  return (
    <div 
      className="min-h-screen text-slate-200 selection:bg-gala-gold/30 selection:text-white relative bg-fixed bg-cover bg-[position:70%_center]"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Background Overlay to ensure text readability like the flyer, lighter on the right to see glasses */}
      <div className="fixed inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 pointer-events-none" />

      <main className="relative z-10">
        {step === 'selection' && (
          <PackSelection onNext={() => setStep('form')} />
        )}

        {step === 'form' && (
          <OrderForm 
            onBack={() => setStep('selection')} 
            onSuccess={() => setStep('confirmation')} 
          />
        )}

        {step === 'confirmation' && (
          <Confirmation onReset={() => setStep('selection')} />
        )}
      </main>

      <footer className="relative z-10 py-12 border-t border-slate-800/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gold-gradient" />
            <span className="font-bold text-white tracking-tight">GALA ASEBEM 2026</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 Gala ASEBEM. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-primary-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/2290167415954" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-transform duration-300 drop-shadow-2xl"
        title="Contactez-nous sur WhatsApp"
      >
        <img src={whatsappImg} alt="WhatsApp" className="w-20 h-20 object-contain drop-shadow-lg" />
      </a>
    </div>
  );
}


function AdminSection() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-gala-gold/30 selection:text-white relative bg-fixed bg-cover bg-center" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="fixed inset-0 bg-black/80 pointer-events-none" />
      <main className="relative z-10">
        {!token ? (
          <AdminLogin onLogin={setToken} />
        ) : (
          <AdminDashboard token={token} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
}

function App() {
  const isAdminPath = window.location.pathname === '/admin';

  if (isAdminPath) {
    return <AdminSection />;
  }

  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  );
}

export default App;

