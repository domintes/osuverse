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
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const token = await getOAuthToken();
    
    // Search for users using osu! API v2
    const searchUrl = `https://osu.ppy.sh/api/v2/search?mode=user&query=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('osu! API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to search users',
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Get detailed information for each user
    const users = data.user?.data || [];
    
    // Fetch extended user data to get beatmap counts and favourites
    const detailedUsers = await Promise.all(
      users.slice(0, 10).map(async (user) => {
        try {
          const userDetailUrl = `https://osu.ppy.sh/api/v2/users/${user.id}`;
          const userResponse = await fetch(userDetailUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            return {
              id: userData.id,
              username: userData.username,
              avatar_url: userData.avatar_url,
              country: userData.country,
              country_code: userData.country_code,
              ranked_beatmapset_count: userData.ranked_beatmapset_count || 0,
              loved_beatmapset_count: userData.loved_beatmapset_count || 0,
              pending_beatmapset_count: userData.pending_beatmapset_count || 0,
              graveyard_beatmapset_count: userData.graveyard_beatmapset_count || 0,
              favourite_beatmapset_count: userData.favourite_beatmapset_count || 0,
              guest_beatmapset_count: userData.guest_beatmapset_count || 0
            };
          }
          
          // Fallback to basic user data if detailed fetch fails
          return {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            country_code: user.country_code,
            ranked_beatmapset_count: 0,
            favourite_beatmapset_count: 0
          };
        } catch (error) {
          console.error(`Error fetching user ${user.id}:`, error);
          return {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            country_code: user.country_code,
            ranked_beatmapset_count: 0,
            favourite_beatmapset_count: 0
          };
        }
      })
    );

    return NextResponse.json({ 
      users: detailedUsers,
      total: data.user?.total || 0
    });

  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}
