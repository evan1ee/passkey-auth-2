import type { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";

export type SessionRequest = {
  userId: string | null;
  challenge: string | null;
};

export type RegisterUserParams = {
  email: string;
  username: string;
  credential: PublicKeyCredentialWithAttestationJSON;
  challenge: string;
};

export type LoginUserParams = {
  email: string;
  credential: PublicKeyCredentialWithAssertionJSON;
  challenge: string;
};

export type UserCredential = {
  id: string;
  userId: string;
  externalId: string;
  publicKey: Buffer;
  signCount: number;
  user: {
    email: string;
  };
};

export type VerificationResult = {
  verified: boolean;
  authenticationInfo?: {
    newCounter: number;
  };
  registrationInfo?: {
    credentialID: Uint8Array;
    credentialPublicKey: Uint8Array;
  };
};
