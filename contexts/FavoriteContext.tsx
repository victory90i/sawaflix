'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { favoritesService } from '../services/favoritesService';
import { createClient } from '../utils/supabase/client';

interface FavoriteItem {
  id: string;
  contentId: string;
  type?: string;
  title?: string;
  thumbnail?: string;
  [key: string]: any;
}

interface FavoriteContextType {
  favorites: FavoriteItem[];
  loading: boolean;
  toggleFavorite: (content: any) => Promise<void>;
  isFavorite: (contentId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    fetchFavorites();

    // Listen for auth changes to re-fetch
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        // Use the session user metadata if available directly, or re-fetch
        if (session?.user?.user_metadata?.favorites) {
          setFavorites(session.user.user_metadata.favorites);
        } else {
          fetchFavorites();
        }
      } else if (event === 'SIGNED_OUT') {
        setFavorites([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getContentId = (content: any) => {
    const rawId = content.id || content.contentId || content.videoId || content.title;
    if (!rawId) return '';
    return String(rawId).trim().replace(/\s+/g, '-').toLowerCase();
  };

  const isFavorite = (contentId: string) => {
    return favorites.some(fav => {
      const favId = getContentId(fav);
      return favId === contentId;
    });
  };

  const toggleFavorite = async (content: any) => {
    const contentId = getContentId(content);
    if (!contentId) {
      console.error('Cannot toggle favorite: Missing contentId', content);
      return;
    }

    const currentlyFavorite = isFavorite(contentId);
    
    // Optimistic Update
    const prevFavorites = [...favorites];
    if (currentlyFavorite) {
      setFavorites(favorites.filter(fav => fav.contentId !== contentId && fav.id !== contentId));
    } else {
      setFavorites([...favorites, { ...content, contentId, id: contentId }]);
    }

    try {
      if (currentlyFavorite) {
        await favoritesService.removeFavorite(contentId);
      } else {
        await favoritesService.addFavorite(content);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Rollback on error
      setFavorites(prevFavorites);
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite, refreshFavorites: fetchFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
}
