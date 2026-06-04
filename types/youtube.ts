export interface Video {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    videoUrl: string;
    embedUrl: string;
<<<<<<< HEAD
    likeCount?: string | number;
    commentCount?: string | number;
    viewCount?: string | number;
    origin?: 'youtube' | 'sawaflix';
    tier?: string;
=======
    likeCount?: string;
    commentCount?: string;
    viewCount?: string;
    contentType?: string;
    origin?: 'youtube' | 'sawaflix';
>>>>>>> origin/refactored-code
}

export interface VideoSearchResponse {
    items: Video[];
    nextPageToken: string | null;
    prevPageToken?: string | null;
    totalResults?: number;
    error?: {
        message: string;
    };

}

export interface VideoDetails {
    id: string;
    title: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
    duration: string;
    publishedAt: string;
    channelId?: string;
    channelTitle?: string;
}

export interface Comment {
    id: string;
    author: string;
    authorProfileImage: string;
    text: string;
    likeCount: number;
    publishedAt: string;
}

export interface ApiError {
    error: string;
    statusCode: number;
}
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    loading: boolean;
}

export interface Category {
    id: 'cameroon' | 'cameroon music' | 'cameroon comedy' | 'cameroon news';
    label: string;
    query: string;
}

export interface ParsedDuration {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    formatted: string;
}
