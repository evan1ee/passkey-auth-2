import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionConfig } from "./config";

export interface SessionData {
  userId?: string;
  username?: string;
  email?: string
  password?: string;
  challenge?: string;
  isLoggedIn: boolean;
}

export const getSession = async () => {
  const session = await getIronSession<SessionData>(await cookies(), sessionConfig);
  
  // Initialize session if needed
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  
  return session;
};