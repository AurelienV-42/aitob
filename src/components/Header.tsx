"use client";

import { useAuthContext } from "./auth/AuthProvider";

export function Header() {
  const { user, signOut } = useAuthContext();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-xl">
        <h1 className="text-xl font-semibold">Aitob</h1>
        {user && (
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}
