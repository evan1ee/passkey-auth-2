import { supported, create } from "@github/webauthn-json";
import { v4 as uuidv4 } from 'uuid';
const randomUUID = uuidv4();

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
        id: randomUUID,
        name: email,
        displayName: username,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
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
  
