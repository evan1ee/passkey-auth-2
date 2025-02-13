import { NextResponse } from "next/server";
import { verifyRegistration } from "@/lib/auth";
import type { 
  PublicKeyCredentialWithAttestationJSON,
} from "@github/webauthn-json";

// POST /api/register
export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body?.credential || !body?.challenge) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: credential and challenge",
        },
        { status: 400 }
      );
    }

    const { credential, challenge } = body;

    // Type check for credential
    if (typeof credential !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credential format",
        },
        { status: 400 }
      );
    }

    // Verify the registration
    const verificationResponse = await verifyRegistration(
      credential as PublicKeyCredentialWithAttestationJSON,
      challenge
    );

    console.log("Registration verification response:", verificationResponse);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          // userVerified: verificationResponse?.userVerified,
          // attestationObject: verificationResponse?.attestationObject,
          // fmt: verificationResponse?.fmt,
          // aaguid: verificationResponse?.aaguid,
          // credentialType: verificationResponse?.credentialType,
          // credentialDeviceType: verificationResponse?.credentialDeviceType,
          // credentialBackedUp: verificationResponse?.credentialBackedUp,
          // origin: verificationResponse?.origin,
          // rpID: verificationResponse?.rpID,
          // authenticatorExtensionResults: verificationResponse?.authenticatorExtensionResults,
          // credentialId: verificationResponse?.credential.id,
          // publicKey: verificationResponse?.credential.publicKey,
          // counter: verificationResponse?.credential.counter,
          // transports: verificationResponse?.credential.transports, 
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

