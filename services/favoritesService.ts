import { createClient } from '../utils/supabase/client';

export interface FavoriteItem {
  id: string;
  contentId: string;
  type?: string;
  title?: string;
  thumbnail?: string;
  [key: string]: any;
}

export const favoritesService = {
  async getFavorites(): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('getFavorites: not logged in or error', error);
        return [];
      }

      const favorites = user.user_metadata?.favorites || [];
      return Array.isArray(favorites) ? favorites : [];
    } catch (err) {
      console.error('getFavorites error:', err);
      return [];
    }
  },

  async addFavorite(content: any): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      let contentId = content.id || content.contentId || content.videoId || content.title;
      if (!contentId) throw new Error('Missing contentId');
      
      // Slugify title if used as ID to avoid URL issues
      contentId = String(contentId).trim().replace(/\s+/g, '-').toLowerCase();

      const currentFavorites: FavoriteItem[] = user.user_metadata?.favorites || [];
      
      // Prevent duplicates
      if (currentFavorites.some(f => f.contentId === contentId || f.id === contentId)) {
        return currentFavorites;
      }

      const newFavorite: FavoriteItem = {
        ...content,
        id: contentId,
        contentId: contentId,
        title: content.title || '',
        thumbnail: content.thumbnail || content.poster || '',
        type: content.type || 'video',
      };

      const updatedFavorites = [...currentFavorites, newFavorite];

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { favorites: updatedFavorites }
      });

      if (updateError) {
        throw new Error(`Failed to update favorites: ${updateError.message}`);
      }

      return updatedUser.user.user_metadata.favorites;
    } catch (err: any) {
      console.error('addFavorite error:', err);
      throw err;
    }
  },

  async removeFavorite(contentId: string): Promise<FavoriteItem[]> {
    if (!contentId) throw new Error('Missing contentId');
    
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      const currentFavorites: FavoriteItem[] = user.user_metadata?.favorites || [];
      const updatedFavorites = currentFavorites.filter(f => f.contentId !== contentId && f.id !== contentId);

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { favorites: updatedFavorites }
      });

      if (updateError) {
        throw new Error(`Failed to update favorites: ${updateError.message}`);
      }

      return updatedUser.user.user_metadata.favorites;
    } catch (err: any) {
      console.error('removeFavorite error:', err);
      throw err;
    }
  },

  async clearFavorites(): Promise<FavoriteItem[]> {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User must be logged in to manage favorites');
      }

      const { data: updatedUser, error: updateError } = await supabase.auth.updateUser({
        data: { favorites: [] }
      });

      if (updateError) {
        throw new Error(`Failed to clear favorites: ${updateError.message}`);
      }

      return [];
    } catch (err: any) {
      console.error('clearFavorites error:', err);
      throw err;
    }
  }
};
