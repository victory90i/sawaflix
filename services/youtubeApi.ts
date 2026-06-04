import type { VideoSearchResponse, VideoDetails, Comment } from '@/types/youtube';
import { 
    searchVideosAction, 
    getVideoDetailsAction, 
    getVideoCommentsAction,
    likeYouTubeVideoAction,
    followYouTubeChannelAction,
    commentYouTubeVideoAction,
    getUnifiedFeedAction
} from '@/app/actions/youtube';

export class YouTubeApiService {
    async getUnifiedFeed() {
        console.log('[API] Invoking server action to fetch unified feed');
        return getUnifiedFeedAction();
    }

    async searchVideos(
        query: string,
        pageToken: string | null = null,
        maxResults: number = 10
    ): Promise<VideoSearchResponse> {
        console.log('[API] Invoking server action to fetch videos for:', query);
        return searchVideosAction(query, pageToken, maxResults);
    }

    async getVideoDetails(videoId: string): Promise<VideoDetails> {
        console.log('[API] Invoking server action to fetch details for:', videoId);
        return getVideoDetailsAction(videoId);
    }

    async getVideoComments(videoId: string): Promise<Comment[]> {
        console.log('[API] Invoking server action to fetch comments for:', videoId);
        return getVideoCommentsAction(videoId);
    }

    async likeVideo(videoId: string, origin: 'youtube' | 'sawaflix' = 'youtube') {
        console.log('[API] Invoking server action to like video:', videoId, '| origin:', origin);
        return likeYouTubeVideoAction(videoId, origin);
    }

    async followChannel(channelId: string) {
        console.log('[API] Invoking server action to follow channel:', channelId);
        return followYouTubeChannelAction(channelId);
    }

    async commentOnVideo(videoId: string, text: string, origin: 'youtube' | 'sawaflix' = 'youtube') {
        console.log('[API] Invoking server action to comment on video:', videoId, '| origin:', origin);
        return commentYouTubeVideoAction(videoId, text, origin);
    }
}

export const youtubeApi = new YouTubeApiService();