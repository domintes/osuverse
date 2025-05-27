import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
    response.cookies.set("osu_session", "", { path: "/", expires: new Date(0) });
    return response;
}
