import { NextResponse } from 'next/server';

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

    // Catboy.best doesn't have a direct user beatmaps endpoint like osu! API
    // We'll need to use osu! API to get the beatmap IDs, then check availability on catboy
    const token = await getOAuthToken();
    let allBeatmaps = [];

    // Fetch from osu! API first to get beatmap list
    if (type === 'ranked' || type === 'all') {
      try {
        const rankedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/ranked?limit=100`;
        const rankedResponse = await fetch(rankedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (rankedResponse.ok) {
          const rankedData = await rankedResponse.json();
          allBeatmaps = [...allBeatmaps, ...rankedData];
        }
      } catch (error) {
        console.error('Error fetching ranked beatmaps:', error);
      }
    }

    if (type === 'graveyard' || type === 'all') {
      try {
        const graveyardUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/graveyard?limit=100`;
        const graveyardResponse = await fetch(graveyardUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (graveyardResponse.ok) {
          const graveyardData = await graveyardResponse.json();
          allBeatmaps = [...allBeatmaps, ...graveyardData];
        }
      } catch (error) {
        console.error('Error fetching graveyard beatmaps:', error);
      }
    }

    if (type === 'favourite') {
      try {
        const favouriteUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/favourite?limit=100`;
        const favouriteResponse = await fetch(favouriteUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (favouriteResponse.ok) {
          const favouriteData = await favouriteResponse.json();
          allBeatmaps = [...allBeatmaps, ...favouriteData];
        }
      } catch (error) {
        console.error('Error fetching favourite beatmaps:', error);
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
