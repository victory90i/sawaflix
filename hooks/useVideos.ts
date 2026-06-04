/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useVideos.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { youtubeApi } from '@/services/youtubeApi';
import type { Video } from '@/types/youtube';
import { get, set } from 'idb-keyval';

interface UseVideosResult {
    videos: Video[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
    isRefreshing: boolean;
}

export function useVideos(categoryQuery: string): UseVideosResult {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const nextPageTokenRef = useRef<string | null>(null);
    const isLoadingRef = useRef(false);
    const currentCategoryRef = useRef(categoryQuery);

    const mapYouTubeItem = (item: any): Video => ({
        id: typeof item.id === 'object' ? item.id.videoId : item.id,
        title: item.snippet?.title || item.title,
        description: item.snippet?.description || item.description,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.thumbnail,
        channelId: item.snippet?.channelId || item.channelId,
        channelTitle: item.snippet?.channelTitle || item.channelTitle,
        publishedAt: item.snippet?.publishedAt || item.publishedAt,
        videoUrl: `https://www.youtube.com/watch?v=${typeof item.id === 'object' ? item.id.videoId : item.id}`,
        embedUrl: `https://www.youtube.com/embed/${typeof item.id === 'object' ? item.id.videoId : item.id}`,
        likeCount: item.statistics?.likeCount || item.likeCount,
        commentCount: item.statistics?.commentCount || item.commentCount,
        origin: 'youtube'
    });

    const mapSawaflixItem = (item: any): Video => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        thumbnail: item.thumbnail || item.cover_url,
        channelId: 'sawaflix',
        channelTitle: 'Sawaflix',
        publishedAt: item.created_at || item.publishedAt,
        videoUrl: item.videoUrl || item.media_url,
        embedUrl: item.videoUrl || item.media_url,
        likeCount: item.likes || 0,
        commentCount: 0,
        origin: 'sawaflix',
        contentType: item.contentType || item.content_type || (item.media_url?.match(/\.(mp3|wav|ogg|flac|aac)$/i) ? 'music' : 'video')
    });

    const refresh = useCallback(async () => {
        if (isLoadingRef.current) return;

        setIsRefreshing(true);
        setError(null);
        isLoadingRef.current = true;

        try {
            // Check IndexedDB cache first so the UI instantly shows videos without loaders
            const CACHE_KEY = `sawaflix:feed:${categoryQuery.replace(/\s+/g, '_')}`;
            if (videos.length === 0) {
                try {
                    const cachedStr = await get(CACHE_KEY);
                    if (cachedStr) {
                        const parsed = typeof cachedStr === 'string' ? JSON.parse(cachedStr) : cachedStr;
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setVideos(parsed);
                        }
                    }
                } catch (e) {
                    console.warn('[useVideos] Failed to read from IndexedDB cache', e);
                }
            }

            nextPageTokenRef.current = null;
            setHasMore(true);
            currentCategoryRef.current = categoryQuery;

            let finalVideos: Video[] = [];

            const isDefaultFeed = categoryQuery === 'Cameroon music hits 2026';
            const isMusicQuery = categoryQuery.toLowerCase().includes('music');

            // If the user is on the default feed (All 237), fetch the fast unified feed!
            if (isDefaultFeed) {
                const response = await youtubeApi.getUnifiedFeed();
                const sawaflixVideos = (response.data?.sawaflix || [])
                    .map(mapSawaflixItem)
                    .filter(v => v.contentType !== 'music' && v.contentType !== 'audio'); // Exclude audio from "All"

                const ytVideos = (response.data?.youtube || []).map(mapYouTubeItem);

                // Mix them up for a dynamic feel
                finalVideos = [...sawaflixVideos, ...ytVideos].sort(() => Math.random() - 0.5);
                
                // Set the token so infinite scroll knows to continue with YouTube search
                nextPageTokenRef.current = 'use-youtube-fallback'; 
                setHasMore(true);
            } else {
                // Specific category search
                const response = await youtubeApi.searchVideos(categoryQuery, null, 10);
                const rawList = Array.isArray(response) ? response : (response as any).items || [];
                const ytVideos = rawList
                    .filter((item: any) => !!(typeof item.id === 'object' ? item.id.videoId : item.id))
                    .map(mapYouTubeItem);

                let sawaflixVideos: Video[] = [];
                if (isMusicQuery) {
                    // Fetch Sawaflix music to include in music contexts
                    try {
                        const sfResponse = await youtubeApi.getUnifiedFeed();
                        sawaflixVideos = (sfResponse.data?.sawaflix || [])
                            .map(mapSawaflixItem)
                            .filter(v => v.contentType === 'music' || v.contentType === 'audio');
                    } catch (e) {
                        console.error('[useVideos] Failed to fetch Sawaflix music:', e);
                    }
                }

                finalVideos = [...ytVideos, ...sawaflixVideos].sort(() => Math.random() - 0.5);

                nextPageTokenRef.current = (response as any).nextPageToken || null;
                setHasMore(!!(response as any).nextPageToken);
            }

            if (finalVideos.length === 0) {
                throw new Error('No videos found');
            }

            // Ensure we don't completely wipe out the user's current view if background fetch was quick
            setVideos(finalVideos);
            
            // Save to IndexedDB for instant load next time
            try {
                const CACHE_KEY = `sawaflix:feed:${categoryQuery.replace(/\s+/g, '_')}`;
                await set(CACHE_KEY, finalVideos);
            } catch (e) {
                console.warn('[useVideos] Failed to save to IndexedDB cache', e);
            }

            console.log(`[useVideos] Refreshed: ${finalVideos.length} videos`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to refresh videos';
            setError(errorMessage);
            console.error('[useVideos] Refresh failed:', err);
        } finally {
            setIsRefreshing(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery]);

    const loadMore = useCallback(async () => {
        if (isLoadingRef.current) return;
        if (!hasMore) return;
        if (!nextPageTokenRef.current) return;
        if (currentCategoryRef.current !== categoryQuery) return;

        setLoading(true);
        isLoadingRef.current = true;

        try {
            // When infinite scrolling after unified feed, fallback to regular youtube search
            const tokenToUse = nextPageTokenRef.current === 'use-youtube-fallback' ? null : nextPageTokenRef.current;
            const queryToUse = categoryQuery === 'Cameroon music hits 2026' ? 'trending entertainment Cameroon' : categoryQuery;

            const response = await youtubeApi.searchVideos(queryToUse, tokenToUse, 10);
            const rawList = Array.isArray(response) ? response : (response as any).items || [];
            
            const newVideos = rawList
                .filter((item: any) => !!(typeof item.id === 'object' ? item.id.videoId : item.id))
                .map(mapYouTubeItem);

            setVideos(prev => {
                const existingIds = new Set(prev.map(v => v.id));
                const uniqueNew = newVideos.filter((v: Video) => !existingIds.has(v.id));
                return [...prev, ...uniqueNew];
            });

            nextPageTokenRef.current = (response as any).nextPageToken || null;
            setHasMore(!!(response as any).nextPageToken);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load more videos';
            setError(errorMessage);
            console.error('[useVideos] Load more failed:', err);
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [categoryQuery, hasMore]);

    useEffect(() => {
        refresh();
    }, [categoryQuery, refresh]);

    return {
        videos,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        isRefreshing,
    };
}