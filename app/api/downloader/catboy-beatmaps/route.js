import { NextResponse } from 'next/server';
// In-memory cache for catboy beatmaps
const catboyBeatmapsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PAGE_LIMIT = 100;
const RATE_GUARD_INTERVAL = 400;

let lastOsuRequest = 0;

async function waitForRateLimit() {
  const now = Date.now();
  const elapsed = now - lastOsuRequest;

  if (elapsed < RATE_GUARD_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, RATE_GUARD_INTERVAL - elapsed));
  }

  lastOsuRequest = Date.now();
}

function getCacheKey(userId, type) {
  return `catboy-${userId}-${type}`;
}

function getCachedData(cacheKey) {
  const cached = catboyBeatmapsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(cacheKey, data) {
  catboyBeatmapsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

// Helper to get OAuth token for fallback to osu! API
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
    const type = searchParams.get('type') || 'ranked';

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const cacheKey = getCacheKey(userId, type);
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log(`Using cached catboy data for user ${userId}, type ${type}`);
      return NextResponse.json({ 
        ...cachedData, 
        cached: true 
      });
    }

    // Catboy.best doesn't have a direct user beatmaps endpoint like osu! API
    // We'll need to use osu! API to get the beatmap IDs, then check availability on catboy
    const token = await getOAuthToken();
    let allBeatmaps = [];

    // Fetch from osu! API first to get beatmap list with pagination
    if (type === 'ranked' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          await waitForRateLimit(); // Respect rate limits
          const rankedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/ranked?limit=${PAGE_LIMIT}&offset=${offset}`;
          const rankedResponse = await fetch(rankedUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (rankedResponse.ok) {
            const rankedData = await rankedResponse.json();
            if (rankedData.length > 0) {
              allBeatmaps = [...allBeatmaps, ...rankedData];
              offset += rankedData.length;
              hasMoreResults = rankedData.length === PAGE_LIMIT;
            } else {
              hasMoreResults = false;
            }
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching ranked beatmaps:', error);
      }
    }

    if (type === 'graveyard' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          await waitForRateLimit(); // Respect rate limits
          const graveyardUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/graveyard?limit=${PAGE_LIMIT}&offset=${offset}`;
          const graveyardResponse = await fetch(graveyardUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (graveyardResponse.ok) {
            const graveyardData = await graveyardResponse.json();
            if (graveyardData.length > 0) {
              allBeatmaps = [...allBeatmaps, ...graveyardData];
              offset += graveyardData.length;
              hasMoreResults = graveyardData.length === PAGE_LIMIT;
            } else {
              hasMoreResults = false;
            }
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching graveyard beatmaps:', error);
      }
    }

    if (type === 'favourite') {
      try {
        let offset = 0;
        let hasMoreResults = true;
        
        while (hasMoreResults) {
          await waitForRateLimit(); // Respect rate limits
          const favouriteUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/favourite?limit=${PAGE_LIMIT}&offset=${offset}`;
          const favouriteResponse = await fetch(favouriteUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (favouriteResponse.ok) {
            const favouriteData = await favouriteResponse.json();
            if (favouriteData.length > 0) {
              allBeatmaps = [...allBeatmaps, ...favouriteData];
              offset += favouriteData.length;
              hasMoreResults = favouriteData.length === PAGE_LIMIT;
            } else {
              hasMoreResults = false;
            }
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching favourite beatmaps:', error);
      }
    }

    if (type === 'loved' || type === 'all') {
      try {
        let offset = 0;
        let hasMoreResults = true;

        while (hasMoreResults) {
          await waitForRateLimit();
          const lovedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/loved?limit=${PAGE_LIMIT}&offset=${offset}`;
          const lovedResponse = await fetch(lovedUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (lovedResponse.ok) {
            const lovedData = await lovedResponse.json();
            if (lovedData.length > 0) {
              allBeatmaps = [...allBeatmaps, ...lovedData];
              offset += lovedData.length;
              hasMoreResults = lovedData.length === PAGE_LIMIT;
            } else {
              hasMoreResults = false;
            }
          } else {
            hasMoreResults = false;
          }
        }
      } catch (error) {
        console.error('Error fetching loved beatmaps:', error);
      }
    }

    // Remove duplicates
    const uniqueBeatmaps = Array.from(
      new Map(allBeatmaps.map(item => [item.id, item])).values()
    );

    // Check availability on catboy.best by trying to fetch each beatmapset
    // For performance, we'll assume they're available and rely on download fallback
    // Catboy.best mirror should have most beatmaps available
    const formattedBeatmaps = uniqueBeatmaps.map(beatmap => ({
      id: beatmap.id,
      artist: beatmap.artist,
      title: beatmap.title,
      creator: beatmap.creator,
      status: beatmap.status,
      cover: beatmap.covers?.card || beatmap.covers?.cover
    }));

    return NextResponse.json({ 
      beatmaps: formattedBeatmaps,
      count: formattedBeatmaps.length,
      type: type,
      mirror: 'catboy'
    });

  } catch (error) {
    console.error('Catboy beatmaps error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}
