import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function binaryToBase64url(bytes: Uint8Array) {
  let str = "";

  bytes.forEach((charCode) => {
    str += String.fromCharCode(charCode);
  });

  return btoa(str);
}


export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}