"use client";

import { supported, create } from "@github/webauthn-json";

export const createWebAuthnCredential = async (
  challenge: string,
  username: string,
  email: string
)=>{
  return await create({
    publicKey: {
      challenge: challenge,
      rp: {
        name: "next-webauthn",
        id: "localhost",
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
  
