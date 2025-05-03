import { NextResponse } from "next/server";

export async function GET(request) {
    const cookie = request.cookies.get("osu_session");
    if (!cookie || !cookie.value) {
        return NextResponse.json({ loggedIn: false });
    }
    try {
        const session = JSON.parse(cookie.value);
        return NextResponse.json({ loggedIn: true, user: session.user });
    } catch {
        return NextResponse.json({ loggedIn: false });
    }
}
