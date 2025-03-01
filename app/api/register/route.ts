import { NextResponse } from "next/server";
import { verifyRegistration } from "@/lib/auth";




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
      credential,
      challenge
    );
    // if (verificationResponse.verified){
    //   const id = clean(binaryToBase64url(verificationResponse.registrationInfo?.credential.id))
    //   console.log(id)
    //   const publicKey = Buffer.from(verificationResponse.registrationInfo?.credential.publicKey)
    // }console.log(publicKey)

    // console.log("Registration verification response:", verificationResponse);
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

