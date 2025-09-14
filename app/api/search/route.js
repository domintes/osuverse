export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        // Try to get user session cookie with access token
        let token = null;
        try {
            const cookie = request.cookies.get('osu_session');
            if (cookie?.value) {
                const session = JSON.parse(cookie.value);
                token = session?.access_token || null;
            }
        } catch {}

        // If no token in cookie, try client credentials (public scope)
        if (!token) {
            const clientId = process.env.OSU_API_CLIENT_ID;
            const clientSecret = process.env.OSU_API_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                return Response.json({ error: 'Missing API credentials' }, { status: 500 });
            }
            const authRes = await fetch('https://osu.ppy.sh/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials',
                    scope: 'public'
                })
            });
            if (authRes.ok) {
                const data = await authRes.json();
                token = data.access_token;
            } else {
                return Response.json({ error: 'Failed to authorize with osu! API' }, { status: 500 });
            }
        }
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
                headers: { Authorization: `Bearer ${token}` }
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
