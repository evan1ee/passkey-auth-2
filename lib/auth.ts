import prisma from "./database";
import type { VerifiedAuthenticationResponse, VerifiedRegistrationResponse } from "@simplewebauthn/server";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import crypto from "crypto";
import { RegisterUserParams, LoginUserParams, UserCredential, VerificationResult } from "./types";

const HOST_SETTINGS = {
  expectedOrigin: process.env.VERCEL_URL ?? "http://localhost:3000",
  expectedRPID: process.env.RPID ?? "localhost",
};

// Helper to clean strings (Base64url encoding)
function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convert binary to base64url
function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}

// Generate a challenge for registration or login
export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

// Verify Registration Response
async function verifyRegistration(credential: PublicKeyCredentialWithAttestationJSON, challenge: string): Promise<VerificationResult> {
  try {
    return await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error("Registration verification failed:", error);
    throw new Error("Registration verification failed");
  }
}

// Verify Authentication Response
async function verifyAuthentication(credential: PublicKeyCredentialWithAssertionJSON, challenge: string, userCredential: UserCredential): Promise<VerificationResult> {
  try {
    return await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: userCredential.externalId,
        credentialPublicKey: userCredential.publicKey,
        counter: userCredential.signCount,
      },
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error("Authentication verification failed:", error);
    throw new Error("Authentication verification failed");
  }
}

// Register a new user
export async function registerUser({ email, username, credential, challenge }: RegisterUserParams) {
  if (!credential) {
    throw new Error("Invalid Credentials");
  }

  const verification = await verifyRegistration(credential, challenge);

  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey } = verification.registrationInfo ?? {};

  if (!credentialID || !credentialPublicKey) {
    throw new Error("Registration failed");
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      credentials: {
        create: {
          externalId: clean(binaryToBase64url(credentialID)),
          publicKey: Buffer.from(credentialPublicKey),
        },
      },
    },
  });

  console.log(`Registered new user ${user.id}`);
  return user;
}

// Login an existing user
export async function loginUser({ email, credential, challenge }: LoginUserParams) {
  if (!credential?.id) {
    throw new Error("Invalid Credentials");
  }

  const userCredential = await prisma.credential.findUnique({
    select: {
      id: true,
      userId: true,
      externalId: true,
      publicKey: true,
      signCount: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      externalId: credential.id,
    },
  });

  if (!userCredential) {
    throw new Error("Unknown User");
  }

  const verification = await verifyAuthentication(credential, challenge, userCredential);

  await prisma.credential.update({
    data: {
      signCount: verification.authenticationInfo?.newCounter,
    },
    where: {
      id: userCredential.id,
    },
  });

  if (!verification.verified || email !== userCredential.user.email) {
    throw new Error("Login verification failed");
  }

  console.log(`Logged in as user ${userCredential.userId}`);
  return userCredential.userId;
}
