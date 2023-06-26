import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/plugin-proxy")) {
    response.headers.append("Access-Control-Allow-Origin", "*");
  }
  return response;
}
