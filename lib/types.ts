import type { PublicKeyCredentialWithAssertionJSON, PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";



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

