"use client";

import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';
import {
  checkWebAuthnAvailability,
  registerWebAuthnCredential,
  authenticateWithWebAuthn,
} from "@/lib/webauth";
import LogoutButton from "@/components/LogoutButton";
import { getChallenge } from "../actions/auth";
import { WebAuthnCredential } from "@simplewebauthn/server";

// Type definitions
type SessionData = {
  userId: string;
  email: string;
  isLoggedIn: boolean;
  isPasskeyLoggedIn: boolean;
};

type VerificationResponse = {
  registrationInfo?: {
    credential: {
      id: string;
      publicKey: Uint8Array;
      counter: number;
    };
  };
};

export default function DashboardPage() {
  // State management with proper typing
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [webauthnCredential, setWebauthnCredential] = useState<object | null>(null);
  const [credentialWithAssertion, setCredentialWithAssertion] = useState<object | null>(null);
  const [challenge, setChallenge] = useState<string>("");
  const [session, setSession] = useState<SessionData | null>(null);
  const [userCredential, setUserCredential] = useState<WebAuthnCredential>({
    id: "",
    publicKey: new Uint8Array(),
    counter: 0,
  });
  const [verificationResponse, setVerificationResponse] = useState<VerificationResponse | null>(null);
  const [verifyAuthenticationResponse, setVerifyAuthenticationResponse] = useState<any | null>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    challenge: false,
    createCredential: false,
    verifyCredential: false,
    getCredential: false,
    verifyAuthentication: false,
  });

  // Fetch session info - using a proper loading state and error handling
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSession(data.session);
      } catch (err) {
        setError(`Failed to fetch session: ${err instanceof Error ? err.message : String(err)}`);
        toast.error("Failed to load session data");
      }
    };
    fetchSession();
  }, []);

  // Check for WebAuthn availability
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const available = await checkWebAuthnAvailability();
        setIsAvailable(available);
      } catch (err) {
        console.error("WebAuthn availability check failed:", err);
      }
    };
    checkAvailability();
  }, []);

  // Memoized handlers with useCallback to prevent unnecessary re-renders
  const handleGenerateChallenge = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, challenge: true }));
    try {
      const data = await getChallenge();
      setChallenge(data);
      setError("");
    } catch (err) {
      setError(`Failed to generate challenge: ${err instanceof Error ? err.message : String(err)}`);
      toast.error("Challenge generation failed");
    } finally {
      setIsLoading(prev => ({ ...prev, challenge: false }));
    }
  }, []);

  const handleCreateCredential = useCallback(async () => {
    if (!challenge) {
      toast.error("Please generate a challenge first");
      return;
    }
    if (!session?.email) {
      toast.error("User session email not available");
      return;
    }

    setIsLoading(prev => ({ ...prev, createCredential: true }));
    try {
      const credential = await registerWebAuthnCredential(
        challenge,
        session.email,
        session.email
      );
      setWebauthnCredential(credential);
      setError("");
      toast.success("Credential created successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error creating WebAuthn credential: ${errorMessage}`);
      toast.error("Failed to create credential");
    } finally {
      setIsLoading(prev => ({ ...prev, createCredential: false }));
    }
  }, [challenge, session?.email]);

  const handleVerifyCredential = useCallback(async () => {
    if (!webauthnCredential || !challenge) {
      toast.error("Credential or challenge missing");
      return;
    }

    setIsLoading(prev => ({ ...prev, verifyCredential: true }));
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: webauthnCredential,
          challenge: challenge,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setVerificationResponse(result.data.verificationResponse);
        const credential = result.data.verificationResponse.registrationInfo.credential;

        setUserCredential({
          id: credential.id,
          publicKey: credential.publicKey,
          counter: credential.counter,
        });
        
        toast.success("Registration verified successfully");
      } else {
        throw new Error(result.error || "Verification failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error verifying WebAuthn credential: ${errorMessage}`);
      toast.error("Verification failed");
    } finally {
      setIsLoading(prev => ({ ...prev, verifyCredential: false }));
    }
  }, [webauthnCredential, challenge]);

  const handleGetCredential = useCallback(async () => {
    if (!challenge) {
      toast.error("Please generate a challenge first");
      return;
    }

    setIsLoading(prev => ({ ...prev, getCredential: true }));
    try {
      const credential = await authenticateWithWebAuthn(challenge);
      setCredentialWithAssertion(credential);
      setError("");
      toast.success("Login credential retrieved");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error creating WebAuthn credential: ${errorMessage}`);
      toast.error("Failed to get credential");
    } finally {
      setIsLoading(prev => ({ ...prev, getCredential: false }));
    }
  }, [challenge]);

  const handleVerifyAuthentication = useCallback(async () => {
    if (!credentialWithAssertion || !challenge || !userCredential?.id) {
      toast.error("Missing credential or challenge data");
      return;
    }

    setIsLoading(prev => ({ ...prev, verifyAuthentication: true }));
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assertionCredential: credentialWithAssertion,
          challenge: challenge,
          credential: userCredential,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setVerifyAuthenticationResponse(result.data.verificationResponse);
        
        toast.success("Authentication successful");
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Error verifying authentication: ${errorMessage}`);
      toast.error("Authentication failed");
    } finally {
      setIsLoading(prev => ({ ...prev, verifyAuthentication: false }));
    }
  }, [credentialWithAssertion, challenge, userCredential]);

  // Render helper functions
  const renderSessionInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoCard
        label="User ID"
        value={session?.userId}
      />
      <InfoCard
        label="Email"
        value={session?.email}
      />
      <InfoCard
        label="isLoggedIn"
        value={session?.isLoggedIn ? "true" : "false"}
      />
      <InfoCard
        label="isPasskeyLoggedIn"
        value={session?.isPasskeyLoggedIn ? "true" : "false"}
      />
    </div>
  );

  const renderCredentialInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:row-span-2 flex flex-col">
        <div className="p-3 bg-gray-50 rounded-xl flex-1">
          <p className="text-sm font-medium text-gray-500">PublicKey</p>
          <p className="bg-gray-50 rounded-xl overflow-y-auto text-sm">
            {JSON.stringify(userCredential?.publicKey, null, 2)}
          </p>
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-xl flex-1">
        <p className="text-sm font-medium text-gray-500">CredentialId</p>
        <p className="text-gray-800 break-all">{userCredential?.id}</p>
      </div>

      <div className="p-3 bg-gray-50 rounded-xl flex-1">
        <p className="text-sm font-medium text-gray-500">Counter</p>
        <p className="text-gray-800 break-all">
          {userCredential?.counter}
          <span className="text-[0.8rem] italic text-gray-500"> (store in DB)</span>
        </p>
      </div>
    </div>
  );

  const renderWorkflowButtons = () => (
    <div className="flex flex-col md:grid grid-cols-2 gap-4 mb-8">
      <WorkflowButton
        onClick={handleGenerateChallenge}
        label="1，4. Generate Challenge"
        isLoading={isLoading.challenge}
      />
      <WorkflowButton
        onClick={handleCreateCredential}
        label="2. Create Credential"
        isLoading={isLoading.createCredential}
        disabled={!challenge}
      />
      <WorkflowButton
        onClick={handleVerifyCredential}
        label="3. Verify Registration (register)"
        isLoading={isLoading.verifyCredential}
        disabled={!webauthnCredential || !challenge}
      />
      
      <WorkflowButton
        onClick={handleGetCredential}
        label="5. Create Credential (Login)"
        isLoading={isLoading.getCredential}
        disabled={!verificationResponse}
      />
      <WorkflowButton
        onClick={handleVerifyAuthentication}
        label="6. Verify Authentication (Login)"
        isLoading={isLoading.verifyAuthentication}
        disabled={!credentialWithAssertion || !challenge || !userCredential?.id}
      />
    </div>
  );

  const renderResponses = () => (
    <div className="space-y-4">
      <ResponseCard
        title="Passkey Available"
        content={
          <p className={isAvailable ? "text-green-600" : "text-red-600"}>
            {isAvailable ? "Available" : "Unavailable"}
          </p>
        }
      />

      <ResponseCard
        title="Challenge"
        content={
          challenge ? (
            <p className="bg-gray-50 rounded-xl overflow-x-auto text-sm">{challenge}</p>
          ) : (
            <p className="text-gray-500 text-sm">No Challenge created yet</p>
          )
        }
      />

      <ResponseCard
        title="Credential With Attestation (register)"
        content={
          webauthnCredential ? (
            <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm">
              {JSON.stringify(webauthnCredential, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">No credentials created yet</p>
          )
        }
      />

      <ResponseCard
        title="Verification Registration Response"
        content={
          verificationResponse ? (
            <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm max-h-96">
              {JSON.stringify(verificationResponse, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">No verification response yet</p>
          )
        }
      />

      <ResponseCard
        title="Credential With Assertion (login)"
        content={
          credentialWithAssertion ? (
            <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm">
              {JSON.stringify(credentialWithAssertion, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">No credentials with assertion yet</p>
          )
        }
      />

      <ResponseCard
        title="Verification Authentication Response"
        content={
          verifyAuthenticationResponse ? (
            <pre className="bg-gray-50 rounded-xl overflow-x-auto text-sm max-h-96">
              {JSON.stringify(verifyAuthenticationResponse, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500 text-sm">No verification response yet</p>
          )
        }
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h2>
        <LogoutButton />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
        <Section title="User Session">
          {renderSessionInfo()}
        </Section>

        <Divider />
        
        <Section title="Passkey Work Flow">
          {renderWorkflowButtons()}
          {error && (
            <div className="bg-red-50 p-4 rounded-xl flex items-center">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </Section>

        <Divider />
        <Toaster />

        <Section title="User Credential">
          {renderCredentialInfo()}
        </Section>

        <Divider />
        
        <Section title="Interact Response">
          {renderResponses()}
        </Section>
      </div>
    </div>
  );
}

// Reusable UI components
type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: SectionProps) => (
  <>
    <h3 className="text-xl font-semibold text-gray-800 mb-5">{title}</h3>
    {children}
  </>
);

const Divider = () => <div className="my-8 border-t border-gray-200"></div>;

type InfoCardProps = {
  label: string;
  value: string | undefined;
};

const InfoCard = ({ label, value }: InfoCardProps) => (
  <div className="p-3 bg-gray-50 rounded-xl">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-gray-800 truncate overflow-y-auto">{value}</p>
  </div>
);

type WorkflowButtonProps = {
  onClick: () => Promise<void>;
  label: string;
  isLoading: boolean;
  disabled?: boolean;
};

const WorkflowButton = ({ onClick, label, isLoading, disabled = false }: WorkflowButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`flex-1 py-3 px-6 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors duration-200 relative ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    <span className="block text-sm font-semibold">
      {isLoading ? "Processing..." : label}
    </span>
  </button>
);

type ResponseCardProps = {
  title: string;
  content: React.ReactNode;
};

const ResponseCard = ({ title, content }: ResponseCardProps) => (
  <div className="bg-gray-50 rounded-xl p-2">
    <div className="bg-gray-50 rounded-xl p-2 overflow-x-auto text-sm">
      <h3 className="text-base font-semibold text-gray-500 mb-2">{title}</h3>
      {content}
    </div>
  </div>
);