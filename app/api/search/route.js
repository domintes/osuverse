import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const token = req.headers.get("Authorization");

    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const res = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/search?q=${query}`, {
        headers: { Authorization: token },
    });

    if (!res.ok) return NextResponse.json({ error: "Search failed" }, { status: 500 });

    const data = await res.json();
    return NextResponse.json({ beatmaps: data.beatmapsets });
}
