import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  console.log(request.nextUrl.pathname);
  if (request.nextUrl.pathname.startsWith("/plugin-proxy")) {
    response.headers.append("Access-Control-Allow-Origin", "*");
  }
  return response;
}
