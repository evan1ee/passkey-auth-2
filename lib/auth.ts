import {verifyRegistrationResponse } from "@simplewebauthn/server";
import type {
  VerifiedRegistrationResponse,
} from "@simplewebauthn/server";

import crypto from "crypto";

const HOST_SETTINGS = {
  expectedOrigin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
  expectedRPID: process.env.NEXT_PUBLIC_SITE_ID  || "localhost",
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
export async function verifyRegistration(credential: any, challenge: string) {
  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }
  return  verification;
}


