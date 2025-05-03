import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.redirect("/");
    response.cookies.set("osu_session", "", { path: "/", expires: new Date(0) });
    return response;
}
