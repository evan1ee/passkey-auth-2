"use client"

import { logout } from "@/app/actions/auth";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex-1 py-2 px-3 bg-white border border-blue-500 rounded-xl text-blue-500 hover:bg-blue-100 transition-colors duration-200"
      >
        Logout
      </button>
    </form>
  );
}