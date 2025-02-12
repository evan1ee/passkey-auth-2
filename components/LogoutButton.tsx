"use client"

import { logout } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Logout
      </button>
    </form>
  );
}