import { useState, useEffect } from 'react';
import { getHomeFeedAction, HomeFeedData } from '@/app/actions/feed';

interface UseHomeFeedResult {
  feed: HomeFeedData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const EMPTY_FEED: HomeFeedData = {
  personalized: [],
  regional: [],
  trending: [],
  discoveries: [],
};

export function useHomeFeed(): UseHomeFeedResult {
  const [feed, setFeed] = useState<HomeFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick(t => t + 1);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeed() {
      setLoading(true);
      setError(null);
      try {
        const data = await getHomeFeedAction();
        if (!cancelled) {
          setFeed(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load home feed');
          setFeed(EMPTY_FEED);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFeed();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { feed, loading, error, refresh };
}
