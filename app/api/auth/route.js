import { NextResponse } from "next/server";

export async function GET() {
    try {
        const clientId = process.env.OSU_API_CLIENT_ID;
        const clientSecret = process.env.OSU_API_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("Missing OSU API credentials");
            return NextResponse.json(
                { error: "Missing API credentials" },
                { status: 500 }
            );
        }

        const response = await fetch("https://osu.ppy.sh/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials",
                scope: "public"
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("OSU API error:", errorData);
            return NextResponse.json(
                { error: "Authentication failed", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Auth endpoint error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
