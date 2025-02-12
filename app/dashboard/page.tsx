"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null);
  const [webAuthnCredential, setwebAuthnCredential] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const response = await fetch("/api/session");
      const data = await response.json();
      setSession(data.session);
    };
    fetchSession();
  }, []);


  return (
    <div>
      <h2 className="text-xl font-semibold">Session Information</h2>
      <div className="space-y-2">
        <p><strong>User ID:</strong> {session?.userId}</p>
        <p><strong>Email:</strong> {session?.email}</p>
        <p><strong>Password:</strong> {session?.password}</p>
        <p><strong>Challenge:</strong> {session?.challenge}</p>
      </div>
    </div>
  );
}
