import { NextResponse } from "next/server";
import { safeOsuApiCall } from "@/utils/circuitBreaker";

// In-memory token cache
let cachedToken = null;
let tokenExpiry = null;

export async function GET() {
    try {
        // Check cached token first
        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            console.log('Using cached OAuth token');
            return NextResponse.json({
                access_token: cachedToken,
                token_type: 'Bearer',
                expires_in: Math.floor((tokenExpiry - Date.now()) / 1000)
            });
        }

        const clientId = process.env.OSU_API_CLIENT_ID;
        const clientSecret = process.env.OSU_API_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            console.error("Missing OSU API credentials");
            return NextResponse.json(
                { error: "Missing API credentials" },
                { status: 500 }
            );
        }

        const data = await safeOsuApiCall(async () => {
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
                
                // Specific handling for rate limiting
                if (response.status === 429) {
                    throw new Error('429 Too Many Requests - Rate limited by osu! API');
                }
                
                throw new Error(`Authentication failed: ${response.status} ${errorData}`);
            }

            return await response.json();
        }, 'OAuth token request');

        // Cache the token (expires_in is in seconds, convert to milliseconds and subtract 5 minutes for safety)
        cachedToken = data.access_token;
        tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000);
        
        console.log('New OAuth token cached, expires in:', Math.floor((tokenExpiry - Date.now()) / 1000), 'seconds');
        
        return NextResponse.json(data);
    } catch (error) {
        console.error("Auth endpoint error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
