"use client";

import { useEffect, useState } from "react";
import { checkWebAuthnAvailability, createWebAuthnCredential } from "@/lib/webauth";


export default function DashboardPage() {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [webauthnCredential, setWebauthnCredential] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [challenge, setChallenge] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string>(''); // Error state
  // const [credentialId, setCredentialId] = useState<string>('');
  // const [publicKey, setPublicKey] =  useState<any>(null);
  const [verificationResponse, setVerificationResponse] = useState<any>(null);


  // Fetch session info
  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch("/api/session");
      const data = await response.json();
      setUserId(data.session.userId);
      setChallenge(data.session.challenge);
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

  const handleCreateCredential = async () => {
    try {
      const credential = await createWebAuthnCredential(challenge, email, email);
      console.log(credential);
      setWebauthnCredential(credential);
      setError(''); // Clear error if successful
    } catch (error) {
      setError('Error creating WebAuthn credential: ' + (error as Error).message); // Set error message
    }
  };


  const handleVerifyCredential = async () => {
    const Response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential: webauthnCredential, challenge: challenge }),
    });

    const result = await Response.json();
    console.log(result);
    if (result.success) {
      setVerificationResponse(result.data.verificationResponse);
    } else {
      setError('Error verifying WebAuthn credential: ' + result.error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-20 py-8 md:py-12">
  <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Dashboard</h2>

    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800">Session Information</h3>
      <div className="space-y-4">
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
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500 rounded-xl">Webauth Available</p>
            <p className={isAvailable ? 'text-green-600' : 'text-red-600'}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-500">Challenge</p>
            <p className="text-gray-800 break-all">{challenge}</p>
          </div>
        </div>
      </div>
  
      <div className="my-8 border-t border-gray-200"></div>
  
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          onClick={handleCreateCredential}
          className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
        >
          <span className="block text-sm font-semibold">1. Create Credential</span>
        </button>
        
        <button
          onClick={handleVerifyCredential}
          className="flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200"
        >
          <span className="block text-sm font-semibold">2. Verify Credential</span>
        </button>
      </div>
  
      <div className="my-8 border-t border-gray-200"></div>
  
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">1. Credential</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            {webauthnCredential ? (
              <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto text-sm">
            {JSON.stringify(webauthnCredential, null, 2)}
          </pre>
            ) : (
              <p className="text-gray-500 text-sm">No credentials created yet</p>
            )}
          </div>
        </div>
  
        {error && (
          <div className="bg-red-50 p-4 rounded-xl flex items-center">
            
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
  
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">2. Verification Response</h3>
          <pre className="bg-gray-50 rounded-xl p-4 overflow-x-auto text-sm max-h-96">
            {JSON.stringify(verificationResponse, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  </div>
  );
}
