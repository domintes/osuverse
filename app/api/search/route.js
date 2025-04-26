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
        const mapper = searchParams.get('mapper');
        const status = searchParams.get('status');
        const mode = searchParams.get('mode');

        // Build the osu! API query parameters
        let q = '';
        if (query) q += query;
        if (artist) q += (q ? ' ' : '') + `artist=${artist}`;
        if (mapper) q += (q ? ' ' : '') + `creator=${mapper}`;

        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (mode && mode !== 'all') params.append('m', mode);

        let beatmaps = [];
        if (status === 'all' || !status) {
            // Fetch all except graveyard
            const res1 = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${params.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res1.ok) throw new Error('Failed to fetch from osu! API');
            const data1 = await res1.json();
            beatmaps = data1.beatmapsets;

            // Fetch graveyard
            const graveParams = new URLSearchParams(params);
            graveParams.set('s', 'graveyard');
            const res2 = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${graveParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res2.ok) {
                const data2 = await res2.json();
                // Avoid duplicates
                const graveIds = new Set(data2.beatmapsets.map(b => b.id));
                beatmaps = [
                    ...beatmaps,
                    ...data2.beatmapsets.filter(b => !beatmaps.some(m => m.id === b.id))
                ];
            }
        } else {
            if (status && status !== 'all') params.append('s', status);
            const res = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch from osu! API');
            }
            const data = await res.json();
            beatmaps = data.beatmapsets;
        }
        return Response.json({ beatmaps });

    } catch (error) {
        console.error('Search API error:', error);
        return Response.json({ error: 'Failed to fetch beatmaps' }, { status: 500 });
    }
}
