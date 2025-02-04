'use client';

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0F1F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
              card: 'bg-white dark:bg-gray-800',
            },
          }}
          redirectUrl={'/dashboard'}
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
} 