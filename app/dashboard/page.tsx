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

  return (
    <div>
      <h2 className="text-xl font-semibold">Session Information</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {userId}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Challenge:</strong> {challenge}</p>
        {<p><strong>Webauth Available:</strong> {isAvailable ? 'Yes' : 'No'}</p>}
        
        <button
          onClick={handleCreateCredential}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create WebAuthn Credential
        </button>
        
        <p><strong>Webauthn Credential:</strong> {webauthnCredential ? JSON.stringify(webauthnCredential, null, 2) : 'Not created yet'}</p>
        
        {error && <p className="text-red-500 mt-2">{error}</p>} {/* Display error message */}
      </div>
    </div>
  );
}
