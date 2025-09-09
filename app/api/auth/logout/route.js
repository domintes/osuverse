import { NextResponse } from "next/server";

export async function GET(request) {
    const cookie = request.cookies.get("osu_session");
    if (cookie && cookie.value) {
        try {
            const session = JSON.parse(cookie.value);
            const accessToken = session.access_token;
            if (accessToken) {
                // Revoke the token
                const clientId = process.env.OSU_API_CLIENT_ID;
                const clientSecret = process.env.OSU_API_CLIENT_SECRET;
                await fetch("https://osu.ppy.sh/oauth/revoke", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        token: accessToken
                    })
                });
            }
        } catch (error) {
            console.error("Error revoking token:", error);
        }
    }
    const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    response.cookies.set("osu_session", "", { path: "/", expires: new Date(0) });
    return response;
}
