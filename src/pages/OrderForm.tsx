import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderSchemaType } from '../schemas/orderSchema';
import { useOrder } from '../context/OrderContext';
import { PACKS } from '../models';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CheckCircle, AlertCircle, ArrowLeft, User, Users } from 'lucide-react';
import { createOrder } from '../api/orders';
import { PaymentStep } from '../components/PaymentStep';
import { cn } from '../utils/cn';

interface OrderFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onBack, onSuccess }) => {
  const { selectedPack, setOrderResult, setLastOrderData } = useOrder();
  const packInfo = PACKS.find(p => p.id === selectedPack);
  const [apiError, setApiError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderSchemaType>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      isBeninois: true,
      pack: selectedPack || 'StandardEtudiant',
      nombrePersonnes: 1,
      beneficiaires: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "beneficiaires",
  });

  const nombrePersonnes = watch("nombrePersonnes");
  const isBeninois = watch("isBeninois");

  useEffect(() => {
    if (packInfo && packInfo.maxPeople > 1) {
      const currentBeneficiaries = watch("beneficiaires") || [];
      const targetCount = Math.max(0, nombrePersonnes - 1);
      
      if (currentBeneficiaries.length < targetCount) {
        for (let i = currentBeneficiaries.length; i < targetCount; i++) {
          append({ nom: "", prenom: "", cin: "" });
        }
      } else if (currentBeneficiaries.length > targetCount) {
        for (let i = currentBeneficiaries.length; i > targetCount; i--) {
          remove(i - 1);
        }
      }
    } else {
      replace([]);
    }
  }, [nombrePersonnes, packInfo, append, remove, replace, watch]);

  const onSubmit = async (data: OrderSchemaType) => {
    try {
      setApiError(null);
      const result = await createOrder(data as any);
      setOrderResult(result);
      setLastOrderData(data);
      setCreatedOrderId(result.orderId);
      setStep(2);
    } catch (error) {
      console.error("API Error:", error);
      setApiError("Impossible de se connecter au serveur. Assurez-vous que l'API distante est en ligne.");
    }
  };

  if (step === 2 && createdOrderId) {
    return (
      <div className="pt-32 pb-24 px-4 min-h-screen relative z-10">
        <PaymentStep 
          orderId={createdOrderId} 
          onSuccess={() => setStep(3)} 
        />
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="pt-32 pb-24 px-4 min-h-screen relative z-10">
        <div className="max-w-2xl mx-auto glass-card p-12 rounded-3xl text-center space-y-6">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-serif text-gala-gold">Paiement en cours de vérification</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Votre confirmation de paiement a été prise en compte. Veuillez patienter pendant que l'administrateur vérifie votre transaction. Une fois validée, vous recevrez un e-mail contenant votre ticket.
          </p>
        </div>
      </div>
    );
  }

  if (!packInfo) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-8 pl-2 pr-4 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux packs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-white">Finalisez votre commande</h2>
            <p className="text-white/70">Veuillez remplir les informations suivantes pour obtenir vos billets.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {apiError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gala-gold/10 rounded-lg">
                  <User className="w-5 h-5 text-gala-gold" />
                </div>
                <h3 className="text-lg font-serif text-white">Informations principales</h3>
              </div>

              <div className="space-y-4 pb-4 border-b border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300">Quelle est votre nationalité ?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="isBeninois"
                      onChange={() => {
                        setValue("isBeninois", true, { shouldValidate: true });
                      }}
                      checked={isBeninois === true}
                      className="accent-[#C5A059] w-4 h-4"
                    />
                    <span className="text-white">Béninoise</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="isBeninois"
                      onChange={() => {
                        setValue("isBeninois", false, { shouldValidate: true });
                        setValue("idAsebem", "", { shouldValidate: true });
                      }}
                      checked={isBeninois === false}
                      className="accent-[#C5A059] w-4 h-4"
                    />
                    <span className="text-white">Autre</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  placeholder="Votre nom"
                  {...register("nom")}
                  error={errors.nom?.message}
                />
                <Input
                  label="Prénom"
                  placeholder="Votre prénom"
                  {...register("prenom")}
                  error={errors.prenom?.message}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                {...register("email")}
                error={errors.email?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="CIN"
                  placeholder="Ex: AB123456"
                  {...register("cin")}
                  error={errors.cin?.message}
                />
                {isBeninois && (
                  <Input
                    label="ID ASEBEM"
                    placeholder="Ex: ASEBEM-2026-A41755"
                    {...register("idAsebem")}
                    error={errors.idAsebem?.message}
                  />
                )}
              </div>

              {packInfo.maxPeople > 1 && (
                <div className="pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-300">Nombre de personnes</label>
                    <div className="flex items-center gap-4 bg-slate-800 rounded-full px-2 py-1 border border-slate-700">
                      <button
                        type="button"
                        onClick={() => setValue("nombrePersonnes", Math.max(1, nombrePersonnes - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-700 text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="w-4 text-center font-bold text-white">{nombrePersonnes}</span>
                      <button
                        type="button"
                        onClick={() => setValue("nombrePersonnes", Math.min(packInfo.maxPeople, nombrePersonnes + 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-700 text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {fields.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gala-gold/10 rounded-lg">
                    <Users className="w-5 h-5 text-gala-gold" />
                  </div>
                  <h3 className="text-lg font-serif text-white">Bénéficiaires supplémentaires</h3>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="glass-card p-6 rounded-2xl border-l-4 border-l-gala-gold space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-gala-gold tracking-wider">Bénéficiaire #{index + 2}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nom"
                        placeholder="Nom"
                        {...register(`beneficiaires.${index}.nom` as const)}
                        error={errors.beneficiaires?.[index]?.nom?.message}
                      />
                      <Input
                        label="Prénom"
                        placeholder="Prénom"
                        {...register(`beneficiaires.${index}.prenom` as const)}
                        error={errors.beneficiaires?.[index]?.prenom?.message}
                      />
                    </div>
                    <Input
                      label="CIN"
                      placeholder="CIN"
                      {...register(`beneficiaires.${index}.cin` as const)}
                      error={errors.beneficiaires?.[index]?.cin?.message}
                    />
                  </div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              className="w-full h-16 text-xl bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#C5A059] text-black font-bold shadow-[0_4px_15px_rgba(212,175,55,0.3)] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] transition-all duration-200 border-0"
            >
              Réserver mes billets
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="glass-card p-6 rounded-3xl border-gala-gold/30">
              <h3 className="text-lg font-serif text-white mb-6">Récapitulatif</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-slate-400 shrink-0">Pack sélectionné</span>
                  <span className={cn("font-bold text-right", packInfo.color.split(' ')[2])}>{packInfo.name}</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-slate-400 shrink-0">Nombre de places</span>
                  <span className="text-white font-medium text-right">{nombrePersonnes}</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-slate-400 shrink-0">Prix unitaire</span>
                  <span className="text-white font-medium text-right">{packInfo.price} DHS</span>
                </div>
                <div className="pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-2xl font-serif text-gala-gold">{packInfo.price * nombrePersonnes} DHS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
