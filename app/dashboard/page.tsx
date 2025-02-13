"use client";

import { useEffect, useState } from "react";
import { checkWebAuthnAvailability, createWebAuthnCredential } from "@/lib/webauth";
import dynamic from 'next/dynamic';

const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false, // Disable server-side rendering
});




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
      setError('Error creating WebAuthn credential: ' +(error as Error).message); // Set error message
    }
  };


  const handleVerify = async () => {
      const Response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({credential: webauthnCredential,  challenge: challenge }),
      });

      const result = await Response.json();
      console.log(result);
      if (result.success) {
        setVerificationResponse(result.data);
      } else {
        setError('Error verifying WebAuthn credential: ' + result.error);
      }
    }



  return (
    <div className="mx-20 my-10">
      <h2 className="text-xl font-semibold">Session Information</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Challenge:</strong> {challenge}</p>
        {<p><strong>Webauth Available:</strong> {isAvailable ? 'Yes' : 'No'}</p>}
        <hr className="my-4" />
        
        <button
          onClick={handleCreateCredential}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Credential
        </button>
        <hr className="my-4" />
        <h2 className="text-xl font-semibold">WebAuthn Credential</h2>
        {webauthnCredential ? (
          <ReactJson src={webauthnCredential}   
          collapsed={true} // Ensures it starts collapsed
          displayDataTypes={false} // Removes data types
          displayObjectSize={false} //Removes object size 
          />
        ) : (
          <p>Not created yet</p>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error message */}

        <hr className="my-4" />

        <button
          onClick={handleVerify}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
         Verify Credential
        </button>

        <hr className="my-4" />
        <p><strong>Verification Response:</strong>   
        <code>{JSON.stringify(verificationResponse, null, 2)}</code>
        </p>
        <hr className="my-4" />
      </div>
    </div>
  );
}
