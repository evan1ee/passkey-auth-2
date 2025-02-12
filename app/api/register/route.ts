// app/api/login/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  return NextResponse.json({session, success: true });
}