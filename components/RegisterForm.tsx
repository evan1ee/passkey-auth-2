// app/components/LoginForm.tsx
"use client"

import { register } from "@/app/actions/auth";
import { useActionState } from "react";

const initialState = { error: "" };

export default function RegisterForm() {
  const [state, formAction] = useActionState(register, initialState);
  
  return (
    <form action={formAction}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border p-2 w-full"
          />
        </div>
        {state.error && (
          <p className="text-red-500">{state.error}</p>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Register
        </button>
      </div>
    </form>
  );
}
