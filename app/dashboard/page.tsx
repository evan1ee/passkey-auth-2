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
  const [challenge, setChallenge] = useState<string>("");

  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [session, setSession] = useState<any>(null);

  const [credentialId, setCredentialId] = useState<string>("");
  const [publicKey, setPublicKey] = useState<any>(null);
  const [count, setCount] = useState<number>(0);

  const [verificationResponse, setVerificationResponse] = useState<any>(null);

  const [error, setError] = useState<string>(""); // Error state

  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch("/api/session");
      const data = await response.json();
      setUserId(data.session.userId);
      setEmail(data.session.email);
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

  const handleGenerateChallenge = async () => {
    const data = await getChallenge();
    setChallenge(data);
  };

  const handleCreateCredential = async () => {
    try {
      const credential = await registerWebAuthnCredential(
        challenge,
        email,
        email
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

    console.log(result);
    if (result.success) {
      setVerificationResponse(result.data.verificationResponse);
      setCredentialId(
        result.data.verificationResponse.registrationInfo.credentialId
      );
      setPublicKey(result.data.verificationResponse.registrationInfo.publicKey);
      setPublicKey(result.data.verificationResponse.registrationInfo.publicKey);
    } else {
      setError("Error verifying WebAuthn credential: " + result.error);
    }
  };

  const handleGetCredential = async () => {
    try {
      const credential = await registerWebAuthnCredential(
        challenge,
        email,
        email
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

  const handleVerifyAuthentication = async () => {
    const Response = await fetch("/api/login", {
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
    console.log(result);
    if (result.success) {
      setVerificationResponse(result.data.verificationResponse);
      const response = await fetch("/api/session");
      const data = await response.json();
      setCredentialId(data.session.credentialId);
      setPublicKey(data.session.publicKey);
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
            <p className="text-gray-800 truncate">{userId}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-gray-800 truncate">{email}</p>
          </div>
        </div>

        <div className="my-8 border-t border-gray-200"></div>

        <h3 className="text-xl font-semibold text-gray-800 mb-5">
          User Credential
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500 rounded-xl">
              CredentialId
            </p>
            <p className="text-gray-800 break-all">
              {credentialId}{" "}
              <span className=" text-[0.8rem] italic text-gray-500">
                {" "}
                (store in DB)
              </span>
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">PublicKey</p>
            <p className="text-gray-800 break-all">
              {publicKey}{" "}
              <span className=" text-[0.8rem] italic text-gray-500">
                {" "}
                (store in DB)
              </span>
            </p>
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
              1. Create Credential
            </span>
          </button>

          <button
            onClick={handleVerifyCredential}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              2. Verify Registration (register)
            </span>
          </button>

          <button
            onClick={handleGetCredential}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              3. Create Credential (Login)
            </span>
          </button>

          <button
            onClick={handleVerifyAuthentication}
            className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <span className="block text-sm font-semibold">
              4. Verify Authentication (Login)
            </span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-xl flex items-center">
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

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
              Credential:
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
        </div>
      </div>
    </div>
  );
}
