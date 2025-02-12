import { NextResponse } from "next/server";
import { getSession } from "@/lib/session"; // Ensure this points to the correct session file

export async function GET(request: Request) {
  // Extract the request's session
  const session = await getSession();

  // Send the session in the response
  return NextResponse.json({ session });
}
