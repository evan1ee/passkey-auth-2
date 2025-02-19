import { NextResponse } from "next/server";
import { verifyAuthentication } from "@/lib/auth";
import { getSession } from "@/lib/session";

import type { 
  PublicKeyCredentialWithAssertionJSON,
} from "@github/webauthn-json";

// POST /api/register
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body?.assertionCredential || !body?.challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: credential and challenge",
        },
        { status: 400 }
      );
    }

    const { assertionCredential, challenge,credential } = body;



    const publicKeyArray = new Uint8Array(Object.values(credential.publicKey));
    // Verify the registration

    const verificationResponse = await verifyAuthentication(
      assertionCredential as PublicKeyCredentialWithAssertionJSON,
      challenge,
      {
        id: credential.id,
        publicKey:publicKeyArray,
        counter: credential.counter,
      },
    );
    
    if (verificationResponse.verified){
      const session = await getSession()
      session.isPasskeyLoggedIn=true
      await session.save();
    }


    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          verificationResponse
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Login error:", error);
    
    // Handle specific known errors
    if (error instanceof Error) {
      if (error.name === 'SyntaxError') {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request format",
          },
          { status: 400 }
        );
      }
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

