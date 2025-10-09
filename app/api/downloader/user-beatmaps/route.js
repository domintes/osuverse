import { NextResponse } from 'next/server';

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
    const type = searchParams.get('type') || 'ranked'; // 'ranked', 'favourite', 'all'

    if (!userId) {
      return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
    }

    const token = await getOAuthToken();
    let allBeatmaps = [];

    // Fetch ranked beatmaps
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

    // Fetch loved beatmaps
    if (type === 'all') {
      try {
        const lovedUrl = `https://osu.ppy.sh/api/v2/users/${userId}/beatmapsets/loved?limit=100`;
        const lovedResponse = await fetch(lovedUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (lovedResponse.ok) {
          const lovedData = await lovedResponse.json();
          allBeatmaps = [...allBeatmaps, ...lovedData];
        }
      } catch (error) {
        console.error('Error fetching loved beatmaps:', error);
      }
    }

    // Fetch favourite beatmaps
    if (type === 'favourite' || type === 'all') {
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

    return NextResponse.json({ 
      beatmaps: formattedBeatmaps,
      count: formattedBeatmaps.length,
      type: type
    });

  } catch (error) {
    console.error('User beatmaps error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}
