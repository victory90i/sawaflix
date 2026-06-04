'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, CreditCard, ShieldCheck, X, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { paymentService, PaymentStatus } from '@/services/paymentService';

interface PremiumPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  movie: {
    title: string;
    image: string;
    id: string;
  };
  limitSeconds: number;
  onUnlockSuccess: () => void;
}

export const PremiumPaywall = ({ isOpen, onClose, movie, limitSeconds, onUnlockSuccess }: PremiumPaywallProps) => {
  const [step, setStep] = useState<'selection' | 'processing' | 'success' | 'error'>('selection');
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('pending');

  const handlePayment = async (method: 'mtn' | 'orange') => {
    setSelectedMethod(method);
    setStep('processing');
    setErrorMessage(null);
    setStatus('pending');
    
    try {
      // 1. Initiate Payment
      const transaction = await paymentService.initiatePayment(movie.id, method);
      
      // 2. Poll for Status
      await paymentService.pollTransactionStatus(transaction.transactionId, (newStatus) => {
        setStatus(newStatus);
      });

      // 3. Handle Result
      setStep('success');
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('[Payment Flow] Error:', err);
      setErrorMessage(err.message || 'Payment failed. Please try again.');
      setStep('error');
    }
  };

  const reset = () => {
    setStep('selection');
    setErrorMessage(null);
    setStatus('pending');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
        />

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0F1117] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        >
          {/* Movie Preview Header */}
          <div className="relative h-56 w-full group">
            <Image 
              src={movie.image} 
              alt={movie.title}
              fill
              className="object-cover opacity-50 grayscale-[30%] scale-105 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full"
                />
                <div className="relative w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl ring-8 ring-red-600/10">
                  <Lock size={36} className="text-white" />
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/20 border border-white/10 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-10 pb-12 pt-6 text-center">
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">{movie.title}</h2>
            
            <AnimatePresence mode="wait">
              {step === 'selection' && (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
                    The <span className="text-white font-bold">{limitSeconds}s preview</span> has ended. 
                    Unlock the full movie instantly with Mobile Money.
                  </p>

                  <div className="space-y-4">
                    <button 
                      onClick={() => handlePayment('mtn')}
                      className="w-full flex items-center justify-between p-5 bg-[#FFCC00]/5 hover:bg-[#FFCC00]/10 border border-[#FFCC00]/20 hover:border-[#FFCC00]/40 rounded-3xl transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#FFCC00] rounded-2xl flex items-center justify-center font-black text-[#004F9F] text-xl italic shadow-lg shadow-[#FFCC00]/20">MTN</div>
                        <div className="text-left">
                          <div className="text-white font-bold text-lg">MTN MoMo</div>
                          <div className="text-xs text-[#FFCC00] font-black uppercase tracking-wider opacity-60">Instant Verification</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FFCC00] transition-all">
                        <Play size={18} className="text-white group-hover:text-black ml-0.5" fill="currentColor" />
                      </div>
                    </button>

                    <button 
                      onClick={() => handlePayment('orange')}
                      className="w-full flex items-center justify-between p-5 bg-[#FF6600]/5 hover:bg-[#FF6600]/10 border border-[#FF6600]/20 hover:border-[#FF6600]/40 rounded-3xl transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#FF6600] rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-[#FF6600]/20">O</div>
                        <div className="text-left">
                          <div className="text-white font-bold text-lg">Orange Money</div>
                          <div className="text-xs text-[#FF6600] font-black uppercase tracking-wider opacity-60">Secure Payment</div>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF6600] transition-all">
                        <Play size={18} className="text-white group-hover:text-white ml-0.5" fill="currentColor" />
                      </div>
                    </button>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-8 text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-green-500" /> SSL SECURE</div>
                    <div className="flex items-center gap-2"><CreditCard size={14} className="text-blue-500" /> NO HIDDEN FEES</div>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div 
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center"
                >
                  <div className="relative w-24 h-24 mb-8">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className={`absolute inset-0 border-4 rounded-full border-t-transparent ${selectedMethod === 'mtn' ? 'border-[#FFCC00]' : 'border-[#FF6600] shadow-[0_0_15px_rgba(255,102,0,0.3)]'}`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`text-2xl font-black ${selectedMethod === 'mtn' ? 'text-[#FFCC00]' : 'text-[#FF6600]'}`}>
                        {status === 'pending' ? '...' : '!'}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white font-black text-2xl mb-4 tracking-tight">Confirm Payment</h3>
                  <p className="text-gray-500 text-sm px-8 leading-relaxed max-w-[320px]">
                    A push notification was sent to your <span className="text-white font-bold uppercase">{selectedMethod}</span> number. 
                    Please enter your PIN to authorize <span className="text-white font-bold">500 XAF</span>.
                  </p>
                  <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Waiting for provider confirmation</span>
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 size={48} className="text-white" />
                  </div>
                  <h3 className="text-white font-black text-2xl mb-4 tracking-tight">Payment Successful!</h3>
                  <p className="text-gray-400 text-sm px-8 leading-relaxed">
                    Transaction verified. The full movie is now unlocked. Enjoy your cinematic experience!
                  </p>
                </motion.div>
              )}

              {step === 'error' && (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center"
                >
                  <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                    <AlertCircle size={48} className="text-white" />
                  </div>
                  <h3 className="text-white font-black text-2xl mb-4 tracking-tight">Payment Error</h3>
                  <p className="text-red-400 text-sm px-10 mb-8 leading-relaxed">
                    {errorMessage}
                  </p>
                  <button 
                    onClick={reset}
                    className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-white/10"
                  >
                    <RefreshCw size={14} /> Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
