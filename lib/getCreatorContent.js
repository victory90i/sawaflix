import { createClient } from "../utils/supabase/server";
import { BACKEND_URL } from "./apiConfig";

/**
 * Fetches real content from the backend API for the current logged-in creator.
 * Falls back to an empty array if the fetch fails.
 * @param {string} [creatorId] - Optional creator ID to filter by. If not provided, uses the logged-in user's ID.
 */
export async function getCreatorContent(creatorId) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    // If no creatorId was passed, use the logged-in user's ID
    const userId = creatorId || session?.user?.id;

    if (!userId) {
      console.warn("[getCreatorContent] No user ID available, returning empty array.");
      return [];
    }

    // Fetch all content from the backend
    const res = await fetch(`${BACKEND_URL}/api/content`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Disable Next.js caching so we always get fresh data after uploads
      cache: "no-store",
    });

    let allContent = [];
    if (res.ok) {
      try {
        const json = await res.json();
        allContent = json.data || json || [];
      } catch (e) {
        console.error("[getCreatorContent] JSON parse error:", e);
      }
    } else {
      console.warn(`[getCreatorContent] Backend returned status ${res.status}, using Supabase fallback.`);
    }

    // 2. Fallback: Fetch directly from Supabase tables
    // This ensures content uploaded via direct-to-supabase fallback is also visible
    try {
      const { data: supabaseContent, error: contentError } = await supabase
        .from('content')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      const { data: supabaseMovies, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false });

      if (!contentError && supabaseContent) {
        supabaseContent.forEach(item => {
          if (!allContent.find(c => c.id === item.id)) {
            allContent.push(item);
          }
        });
      }
      
      if (!moviesError && supabaseMovies) {
        supabaseMovies.forEach(item => {
          if (!allContent.find(c => c.id === item.id)) {
            // Map movie fields to content fields
            allContent.push({
              ...item,
              creator_id: item.uploaded_by,
              cover_url: item.thumbnail || item.video_url?.replace(/\.[^/.]+$/, ".jpg"),
              category: 'video',
              content_type: 'video'
            });
          }
        });
      }
    } catch (e) {
      console.error("[getCreatorContent] Supabase fallback error:", e);
    }

    // Map backend fields to the format ContentCard/ContentManager expect
    return allContent
      .filter(item => item.creator_id === userId || item.uploaded_by === userId)
      .map((item) => ({
        id: item.id,
        title: item.title || "Untitled",
        description: item.description || "",
        thumbnail: item.cover_url || item.thumbnail || null,
        type: item.category || item.content_type || "content",
        views: 0,
        status: item.visibility === "public" ? "approved" : "draft",
        created_at: item.created_at,
        media_url: item.media_url || item.video_url || item.file_path,
        content_type: item.content_type,
        category: item.category,
        tags: item.tags || [],
      }));
  } catch (err) {
    console.error("[getCreatorContent] Error fetching content:", err);
    return [];
  }
}