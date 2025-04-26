export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return Response.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const query = searchParams.get('query');
        const artist = searchParams.get('artist');
        const status = searchParams.get('status');
        const mode = searchParams.get('mode');

        // Build the osu! API query parameters
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (artist) params.append('q', `artist=${artist}`);
        if (status && status !== 'all') params.append('s', status);
        if (mode && mode !== 'all') params.append('m', mode);

        const res = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch from osu! API');
        }

        const data = await res.json();
        return Response.json({ beatmaps: data.beatmapsets });

    } catch (error) {
        console.error('Search API error:', error);
        return Response.json({ error: 'Failed to fetch beatmaps' }, { status: 500 });
    }
}
