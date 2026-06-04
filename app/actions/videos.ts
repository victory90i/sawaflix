'use server';

import { BACKEND_URL } from '@/lib/apiConfig';

export async function getVideoByIdAction(id: string) {
  if (!id) return null;

  try {
    // We can call our own internal API or the backend directly
    // Using the internal API ensures consistent mapping
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/videos/${id}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      console.error(`[getVideoByIdAction] Failed to fetch video ${id}: ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`[getVideoByIdAction] Error:`, error);
    return null;
  }
}
