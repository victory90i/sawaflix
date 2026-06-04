'use server';

import { BACKEND_URL } from '@/lib/apiConfig';
import { createClient } from '@/utils/supabase/server';

const API_BASE_URL = BACKEND_URL || 'http://localhost:5000';

async function getAuthToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  videoUrl?: string;
  embedUrl?: string;
  likeCount?: string | number;
  viewCount?: string | number;
  origin: 'youtube' | 'sawaflix';
}

export async function getWeightedFeedAction(): Promise<{ data: FeedItem[] }> {
  try {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const feedUrl = `${API_BASE_URL}/api/content/unified-feed`;
    console.log('[Weighted Feed Action] Fetching unified feed from backend:', feedUrl);

    const response = await fetchWithTimeout(feedUrl, { headers });
    if (!response.ok) {
      console.warn('[Weighted Feed Action] Unified feed response not ok:', response.status, response.statusText);
      return { data: [] };
    }

    const json = await response.json();
    const sawaflixItems = Array.isArray(json?.data?.sawaflix)
      ? json.data.sawaflix
      : Array.isArray(json?.sawaflix)
      ? json.sawaflix
      : [];
    const youtubeItems = Array.isArray(json?.data?.youtube)
      ? json.data.youtube
      : Array.isArray(json?.youtube)
      ? json.youtube
      : [];

    const combined: FeedItem[] = [
      ...sawaflixItems.map((item: any) => ({ ...item, origin: 'sawaflix' })),
      ...youtubeItems.map((item: any) => ({ ...item, origin: 'youtube' }))
    ];

    console.log(
      '[Weighted Feed Action] Unified feed counts -> Sawaflix:', sawaflixItems.length,
      'YouTube:', youtubeItems.length,
      'Total:', combined.length
    );

    return { data: combined };
  } catch (error) {
    console.error('[Weighted Feed Action] Fatal error:', error);
    return { data: [] };
  }
}
