import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.OSU_API_CLIENT_ID;
    const redirectUri = process.env.OSU_REDIRECT_URI;
    const state = Math.random().toString(36).substring(2);
    const osuAuthUrl = `https://osu.ppy.sh/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify+public&state=${state}`;
    // Optionally: set state in cookie for CSRF protection
    return NextResponse.redirect(osuAuthUrl);
}
