import { BACKEND_URL } from '../lib/apiConfig';
import { createClient } from '../utils/supabase/client';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'expired';

export interface Transaction {
  transactionId: string;
  status: PaymentStatus;
  assetId: string;
  method: 'mtn' | 'orange';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  async initiatePayment(assetId: string, method: 'mtn' | 'orange', amount: number = 500): Promise<Transaction> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('sawaflix_visitor_id') : null;

    if (!session) throw new Error('Authentication required for payment');

    const res = await fetch(`${BACKEND_URL}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...(visitorId ? { 'x-visitor-id': visitorId } : {})
      },
      body: JSON.stringify({ assetId, method, amount, currency: 'XAF' })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to initiate payment');
    }

    return res.json();
  },

  async getTransactionStatus(transactionId: string): Promise<Transaction> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${BACKEND_URL}/api/payments/status/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch transaction status');
    }

    return res.json();
  },

  /**
   * Polls the transaction status until it reaches a terminal state (success, failed, etc.)
   */
  async pollTransactionStatus(
    transactionId: string, 
    onStatusUpdate?: (status: PaymentStatus) => void,
    maxAttempts = 30,
    intervalMs = 3000
  ): Promise<Transaction> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const transaction = await this.getTransactionStatus(transactionId);
          onStatusUpdate?.(transaction.status);

          if (transaction.status === 'success' || transaction.status === 'failed' || transaction.status === 'cancelled' || transaction.status === 'expired') {
            resolve(transaction);
            return;
          }

          attempts++;
          if (attempts >= maxAttempts) {
            reject(new Error('Payment verification timed out. Please check your transaction history.'));
            return;
          }

          setTimeout(poll, intervalMs);
        } catch (err) {
          reject(err);
        }
      };

      poll();
    });
  }
};
