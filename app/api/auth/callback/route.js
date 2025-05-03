import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    if (error) {
        return NextResponse.redirect("/auth/error?error=" + encodeURIComponent(error));
    }
    if (!code) {
        return NextResponse.redirect("/auth/error?error=Missing+code");
    }
    // Exchange code for access token
    const clientId = process.env.OSU_API_CLIENT_ID;
    const clientSecret = process.env.OSU_API_CLIENT_SECRET;
    const redirectUri = process.env.OSU_REDIRECT_URI;
    const tokenRes = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri
        })
    });
    if (!tokenRes.ok) {
        return NextResponse.redirect("/auth/error?error=Token+exchange+failed");
    }
    const tokenData = await tokenRes.json();
    // Fetch user info
    const userRes = await fetch("https://osu.ppy.sh/api/v2/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    if (!userRes.ok) {
        return NextResponse.redirect("/auth/error?error=Failed+to+fetch+user");
    }
    const user = await userRes.json();
    // Set session cookie (simple, not secure for production)
    const response = NextResponse.redirect("/");
    response.cookies.set("osu_session", JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        user: {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            country: user.country?.name,
            country_code: user.country?.code
        }
    }), { path: "/", httpOnly: false });
    return response;
}
