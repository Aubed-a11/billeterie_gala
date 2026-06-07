import React, { useState } from 'react';
import { adminLogin, adminSignup } from '../api/admin';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, UserPlus } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isSignup) {
        await adminSignup(username, password);
        setSuccess('Compte créé ! Vous pouvez maintenant vous connecter.');
        setIsSignup(false);
        setPassword('');
      } else {
        const data = await adminLogin(username, password);
        localStorage.setItem('adminToken', data.token);
        onLogin(data.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass-card p-8 rounded-3xl space-y-8 relative">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gala-gold/10 rounded-full flex items-center justify-center mx-auto">
            {isSignup ? <UserPlus className="w-8 h-8 text-gala-gold" /> : <Lock className="w-8 h-8 text-gala-gold" />}
          </div>
          <h2 className="text-2xl font-serif text-white">
            {isSignup ? 'Créer un compte Admin' : 'Connexion Admin'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg text-sm text-center">
              {success}
            </div>
          )}
          
          <Input 
            label="Nom d'utilisateur" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <Input 
            label="Mot de passe" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          <Button type="submit" isLoading={loading} className="w-full bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#C5A059] text-black font-bold border-0">
            {isSignup ? "S'inscrire" : "Se connecter"}
          </Button>
        </form>

        <div className="text-center pt-4">
          <button 
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setSuccess('');
            }}
            className="text-sm text-gala-gold hover:text-white transition-colors underline"
          >
            {isSignup ? "J'ai déjà un compte, me connecter" : "Je n'ai pas de compte, m'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
};
