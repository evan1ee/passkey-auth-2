"use client";

import { supported, create, get  } from "@github/webauthn-json";

export const registerWebAuthnCredential  = async (
  challenge: string,
  username: string,
  email: string
)=>{
  return await create({
    publicKey: {
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
      pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
      timeout: 60000,
      attestation: "direct",
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "required",
      },
    },
  });
};

export const checkWebAuthnAvailability = async () => {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available && supported();
  };


  export const authenticateWithWebAuthn  = async (
    challenge: string,
  )=>{
    return await get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: process.env.NEXT_PUBLIC_SITE_ID || "localhost", // Use env variable for production,
      },
    });
  };



  
  
