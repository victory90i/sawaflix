import { BACKEND_URL } from '../lib/apiConfig';
import { createClient } from '../utils/supabase/client';

export interface PlaybackRestriction {
  mustPay: boolean;
  limitSeconds: number;
  tier: 'free' | 'preview' | 'premium';
  reason?: string;
}

export interface PlaybackResponse {
  playbackUrl: string;
  restriction: PlaybackRestriction;
  assetId: string;
  expiresAt: number;
}

export const playbackService = {
  async getPlaybackSource(assetId: string, fallbackUrl?: string): Promise<PlaybackResponse> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const visitorId = typeof window !== 'undefined' ? localStorage.getItem('sawaflix_visitor_id') : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
      ...(visitorId ? { 'x-visitor-id': visitorId } : {})
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/content/play/${encodeURIComponent(assetId)}`, {
        headers
      });

      if (res.status === 404 && fallbackUrl) {
        console.warn(`[Playback] Asset ${assetId} not found in Gatekeeper. Falling back to free playback.`);
        return {
          playbackUrl: fallbackUrl,
          restriction: { mustPay: false, limitSeconds: 0, tier: 'free' },
          assetId,
          expiresAt: Date.now() + 2 * 60 * 60 * 1000
        };
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch playback source (Status: ${res.status})`);
      }

      const data = await res.json();
      
      return {
        playbackUrl: data.playbackUrl,
        restriction: {
          mustPay: data.restriction?.mustPay ?? false,
          limitSeconds: data.restriction?.limitSeconds ?? 0,
          tier: data.restriction?.tier ?? 'free',
          reason: data.restriction?.reason
        },
        assetId,
        expiresAt: data.expiresAt || (Date.now() + 2 * 60 * 60 * 1000)
      };
    } catch (err) {
      if (fallbackUrl) {
        console.warn('[Playback] Gatekeeper failed. Using fallback:', err);
        return {
          playbackUrl: fallbackUrl,
          restriction: { mustPay: false, limitSeconds: 0, tier: 'free' },
          assetId,
          expiresAt: Date.now() + 2 * 60 * 60 * 1000
        };
      }
      throw err;
    }
  },

  /**
   * Verification of payment and re-fetching the playback source
   */
  async verifyPayment(assetId: string, transactionId: string): Promise<PlaybackResponse> {
    // In a real app, we might call a verify endpoint or just re-call getPlaybackSource
    // after the backend has processed the webhook.
    // For this implementation, we'll wait 2 seconds then re-call getPlaybackSource.
    await new Promise(resolve => setTimeout(resolve, 2000));
    return this.getPlaybackSource(assetId);
  }
};
