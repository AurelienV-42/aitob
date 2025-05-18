"use client";

import { AuthForm } from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold text-center mb-8">Welcome</h1>
      <AuthForm />
    </div>
  );
}
