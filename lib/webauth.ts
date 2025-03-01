"use client";

import { browserSupportsWebAuthn, startRegistration, startAuthentication } from "@simplewebauthn/browser";

export const registerWebAuthnCredential = async (
  challenge: string,
  username: string,
  email: string
) => {


  // Create options object according to SimpleWebAuthn's expected structure
  return await startRegistration({
    optionsJSON: {
      challenge: challenge,
      rp: {
        name: "Passkey-authn",
        id: process.env.NEXT_PUBLIC_SITE_ID || "localhost", // Use env variable for production
      },
      user: {
        id: window.crypto.randomUUID(),
        name: email,
        displayName: username,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, // ES256
        { alg: -257, type: "public-key" } // RS256
      ],
      timeout: 60000,
      attestation: "direct",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    }
  });
};

export const checkWebAuthnAvailability = async () => {
  return browserSupportsWebAuthn();
};

export const authenticateWithWebAuthn = async (
  challenge: string,
) => {

  // Create options object according to SimpleWebAuthn's expected structure
  return await startAuthentication({
    optionsJSON: {
      challenge: challenge,
      timeout: 60000,
      userVerification: "required",
      rpId: process.env.NEXT_PUBLIC_SITE_ID || "localhost", // Use env variable for production
    }
  });
};