"use client";

import { useEffect, useState } from "react";
import {
  checkWebAuthnAvailability,
  registerWebAuthnCredential,
  authenticateWithWebAuthn,
} from "@/lib/webauth";
import LogoutButton from "@/components/LogoutButton";
import { getChallenge } from "../actions/auth";




export default function DashboardPage() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [webauthnCredential, setWebauthnCredential] = useState<any>(null);
  const [credentialWithAssertion, setCredentialWithAssertion] = useState<any>(null);

  const [challenge, setChallenge] = useState<string>("");

  const [session, setSession] = useState<any>(null);

  const [userCredential,setUserCredential]= useState<any>(null);

  const [verificationResponse, setVerificationResponse] = useState<any>(null);

  const [error, setError] = useState<string>(""); // Error state


  function binaryToBase64url(bytes: Uint8Array): string {
    // Convert Uint8Array to Base64 string
    const base64String = btoa(String.fromCharCode(...bytes));
  
    // Convert Base64 to Base64URL
    return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // Remove padding
  }

  function uint8ArrayToBase64url(bytes: Uint8Array): string {
    // Convert Uint8Array to binary string safely
    let binaryString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  
    // Encode binary string to Base64
    const base64String = btoa(binaryString);
  
    // Convert Base64 to Base64URL format (removing padding)
    return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  
  


  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch("/api/session");
      const data = await response.json();
      setSession(data.session)
    };
    fetchSession();
  }, []); // Only runs on mount

  // Check for WebAuthn availability
  useEffect(() => {
    const check = async () => {
      const available = await checkWebAuthnAvailability();
      console.log(available);
      setIsAvailable(available);
    };
    check();
  }, []);

  // register

  const handleGenerateChallenge = async () => {
    const data = await getChallenge();
    setChallenge(data);
  };

  const handleCreateCredential = async () => {
    try {
      const credential = await registerWebAuthnCredential(
        challenge,
        session.email,
        session.email
      );
      console.log(credential);
      setWebauthnCredential(credential);

      setError(""); // Clear error if successful
    } catch (error) {
      setError(
        "Error creating WebAuthn credential: " + (error as Error).message
      ); // Set error message
    }
  };

  const handleVerifyCredential = async () => {
    const Response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: webauthnCredential,
        challenge: challenge,
      }),
    });

    const result = await Response.json();

    console.log(result.data.verificationResponse.registrationInfo.credential);

    if (result.success) {
      setVerificationResponse(result.data.verificationResponse);
      const credential = result.data.verificationResponse.registrationInfo.credential

      setUserCredential({
        id:binaryToBase64url(credential.id),
        publicKey:uint8ArrayToBase64url(credential.publicKey),
        counter: credential.counter
      })

      

    } else {
      setError("Error verifying WebAuthn credential: " + result.error);
    }
  };

  // login

  const handleGetCredential = async () => {
    try {
      const credential = await authenticateWithWebAuthn(
        challenge,
      );
      console.log(credential);
      setCredentialWithAssertion(credential);
      setError(""); // Clear error if successful
    } catch (error) {
      setError(
        "Error creating WebAuthn credential: " + (error as Error).message
      ); // Set error message
    }
  };

  const handleVerifyAuthentication = async () => {
    const Response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assertionCredential:credentialWithAssertion,
        challenge: challenge,
        credential: userCredential,
      }),
    });

    const result = await Response.json();
    console.log(result);

    if (result.success) {
      setVerificationResponse(result.data.verificationResponse);
    } else {
      setError("Error verifying WebAuthn credential: " + result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-20 py-8 md:py-12">
      <div className="flex justify-between items-center  mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          Dashboard
        </h2>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          User Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">User ID</p>
            <p className="text-gray-800 truncate overflow-y-auto">{session?.userId}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-gray-800 truncate">{session?.email}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">isLoggedIn</p>
            <p className="text-gray-800 truncate">{session?.isLoggedIn? "ture": "false"}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">isPasskeyLoggedIn</p>
            <p className="text-gray-800 truncate">{session?.isPasskeyLoggedIn? "ture": "false"}</p>
          </div>
        </div>

        {/* line */}
        <div className="my-8 border-t border-gray-200"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Passkey Work Flow
        </h3>
        {/* button  */}
        <div className="flex flex-col md:grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleGenerateChallenge}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              1. Generate Challenge
            </span>
          </button>

          <button
            onClick={handleCreateCredential}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              2. Create Credential
            </span>
          </button>

          <button
            onClick={handleVerifyCredential}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              3. Verify Registration (register)
            </span>
          </button>

          <button
            onClick={handleGenerateChallenge}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              4. Generate Challenge (Login)
            </span>
          </button>

          <button
            onClick={handleGetCredential}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              5. Create Credential (Login)
            </span>
          </button>

          <button
            onClick={handleVerifyAuthentication}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              6. Verify Authentication (Login)
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl flex items-center">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="my-8 border-t border-gray-200"></div>

        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          User Credential
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PublicKey Section */}
          <div className="md:row-span-2 flex flex-col">
            <div className="p-3 bg-gray-50 rounded-xl flex-1">
              <p className="text-sm font-medium text-gray-500">PublicKey</p>
              <p className="bg-gray-50 rounded-xl overflow-y-auto text-sm ">
                {JSON.stringify(userCredential?.publicKey, null, 2)}
              </p>
            </div>
          </div>

          {/* CredentialId Section */}
          <div className="p-3 bg-gray-50 rounded-xl flex-1">
            <p className="text-sm font-medium text-gray-500">CredentialId</p>
            <p className="text-gray-800 break-all">{userCredential?.id}</p>
          </div>

          {/* Counter Section */}
          <div className="p-3 bg-gray-50 rounded-xl flex-1">
            <p className="text-sm font-medium text-gray-500">Counter</p>
            <p className="text-gray-800 break-all">
              {userCredential?.counter}
              <span className="text-[0.8rem] italic text-gray-500">
                {" "}
                (store in DB)
              </span>
            </p>
          </div>
        </div>

        {/* line */}

        <div className="my-8 border-t border-gray-200"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          Interact Response
        </h3>

        {/* Credential and Verification Response */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-2">
            <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto text-sm">
              <h3 className="text-base font-semibold text-gray-500 mb-2">
                Passkey Available
              </h3>
              <p className={isAvailable ? "text-green-600" : "text-red-600"}>
                {isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-2">
            <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto">
              <h3 className="text-base font-semibold text-gray-500 mb-2">
                Challenge
              </h3>
              {challenge ? (
                <p className="bg-gray-50 rounded-xl overflow-x-auto text-sm">
                  {challenge}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">
                  No Challenge created yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-2">
            <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                Credential
              </h3>
              {webauthnCredential ? (
                <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm">
                  {JSON.stringify(webauthnCredential, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 text-sm ">
                  No credentials created yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-2">
            <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                Verification Response
              </h3>
              {webauthnCredential ? (
                <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm max-h-96">
                  {JSON.stringify(verificationResponse, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 text-sm">
                  No verification response yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-2">
            <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto">
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
              Credential With Assertion
              </h3>
              {credentialWithAssertion ? (
                <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm">
                  {JSON.stringify(credentialWithAssertion, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-500 text-sm ">
                  No credentials created yet
                </p>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
