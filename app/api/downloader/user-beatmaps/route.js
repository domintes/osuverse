import { NextResponse } from 'next/server';
import { safeOsuApiCall } from '@/utils/circuitBreaker';

// In-memory cache for user beatmaps
const userBeatmapsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(userId, type) {
  return `${userId}-${type}`;
}

function getCachedData(cacheKey) {
  const cached = userBeatmapsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(cacheKey, data) {
  userBeatmapsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

// Helper to get OAuth token
async function getOAuthToken() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth`);
    if (!res.ok) {
      throw new Error('Failed to get OAuth token');
    }
    const data = await res.json();
    return data.access_token;
  } catch (error) {
    console.error('OAuth token error:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'ranked'; // 'ranked', 'favourite', 'graveyard', 'all'
    const PAGE_LIMIT = 100;

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const cacheKey = getCacheKey(userId, type);
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Using cached data for user ${userId}, type ${type}`);
      return NextResponse.json({ 
        ...cachedData, 
        cached: true 
      });
    }

    const token = await getOAuthToken();
    let allBeatmaps = [];

    // Fetch ranked beatmaps with pagination
    if (type === 'ranked' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          const rankedData = await safeOsuApiCall(async () => {
            const rankedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/ranked?limit=${PAGE_LIMIT}&offset=${offset}`;
            const rankedResponse = await fetch(rankedUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (!rankedResponse.ok) {
              if (rankedResponse.status === 429) {
                throw new Error('429 Too Many Requests - Rate limited by osu! API');
              }
              throw new Error(`HTTP ${rankedResponse.status}: ${rankedResponse.statusText}`);
            }

            return await rankedResponse.json();
          }, `Fetching ranked beatmaps for user ${userId}, offset ${offset}`);

          if (rankedData && rankedData.length > 0) {
            allBeatmaps = [...allBeatmaps, ...rankedData];
            offset += rankedData.length;
            // If we got less than 51 results, we've reached the end
            hasMoreResults = rankedData.length === PAGE_LIMIT;
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching ranked beatmaps:', error);
        // Continue with other types even if this fails
      }
    }

  // Fetch loved beatmaps with pagination
  if (type === 'loved' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          const lovedData = await safeOsuApiCall(async () => {
            const lovedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/loved?limit=${PAGE_LIMIT}&offset=${offset}`;
            const lovedResponse = await fetch(lovedUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (!lovedResponse.ok) {
              if (lovedResponse.status === 429) {
                throw new Error('429 Too Many Requests - Rate limited by osu! API');
              }
              throw new Error(`HTTP ${lovedResponse.status}: ${lovedResponse.statusText}`);
            }

            return await lovedResponse.json();
          }, `Fetching loved beatmaps for user ${userId}, offset ${offset}`);

          if (lovedData && lovedData.length > 0) {
            allBeatmaps = [...allBeatmaps, ...lovedData];
            offset += lovedData.length;
            hasMoreResults = lovedData.length === PAGE_LIMIT;
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching loved beatmaps:', error);
      }
    }

    // Fetch favourite beatmaps with pagination
    if (type === 'favourite' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          const favouriteData = await safeOsuApiCall(async () => {
            const favouriteUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/favourite?limit=${PAGE_LIMIT}&offset=${offset}`;
            const favouriteResponse = await fetch(favouriteUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (!favouriteResponse.ok) {
              if (favouriteResponse.status === 429) {
                throw new Error('429 Too Many Requests - Rate limited by osu! API');
              }
              throw new Error(`HTTP ${favouriteResponse.status}: ${favouriteResponse.statusText}`);
            }

            return await favouriteResponse.json();
          }, `Fetching favourite beatmaps for user ${userId}, offset ${offset}`);

          if (favouriteData && favouriteData.length > 0) {
            allBeatmaps = [...allBeatmaps, ...favouriteData];
            offset += favouriteData.length;
            hasMoreResults = favouriteData.length === PAGE_LIMIT;
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching favourite beatmaps:', error);
      }
    }

    // Fetch graveyard beatmaps with pagination
    if (type === 'graveyard' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          const graveyardData = await safeOsuApiCall(async () => {
            const graveyardUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/graveyard?limit=${PAGE_LIMIT}&offset=${offset}`;
            const graveyardResponse = await fetch(graveyardUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });

            if (!graveyardResponse.ok) {
              if (graveyardResponse.status === 429) {
                throw new Error('429 Too Many Requests - Rate limited by osu! API');
              }
              throw new Error(`HTTP ${graveyardResponse.status}: ${graveyardResponse.statusText}`);
            }

            return await graveyardResponse.json();
          }, `Fetching graveyard beatmaps for user ${userId}, offset ${offset}`);

          if (graveyardData && graveyardData.length > 0) {
            allBeatmaps = [...allBeatmaps, ...graveyardData];
            offset += graveyardData.length;
            hasMoreResults = graveyardData.length === PAGE_LIMIT;
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching graveyard beatmaps:', error);
      }
    }

    // Remove duplicates based on ID
    const uniqueBeatmaps = Array.from(
      new Map(allBeatmaps.map(item => [item.id, item])).values()
    );

    // Format beatmaps for download
    const formattedBeatmaps = uniqueBeatmaps.map(beatmap => ({
      id: beatmap.id,
      artist: beatmap.artist,
      title: beatmap.title,
      creator: beatmap.creator,
      status: beatmap.status,
      cover: beatmap.covers?.card || beatmap.covers?.cover
    }));

    const responseData = { 
      beatmaps: formattedBeatmaps,
      count: formattedBeatmaps.length,
      type: type,
      cached: false
    };

    // Cache the response
    setCachedData(cacheKey, responseData);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('User beatmaps error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}
