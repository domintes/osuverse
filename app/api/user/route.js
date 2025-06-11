import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");
        const token = searchParams.get("token");
        if (!username || !token) {
            return NextResponse.json({ error: "Missing username or token" }, { status: 400 });
        }
        const osuRes = await fetch(`https://osu.ppy.sh/api/v2/users/${encodeURIComponent(username)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!osuRes.ok) {
            const errorText = await osuRes.text();
            return NextResponse.json({ error: "osu! API error", details: errorText }, { status: osuRes.status });
        }
        const data = await osuRes.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
