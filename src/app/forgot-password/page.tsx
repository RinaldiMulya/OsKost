import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata = {
  title: "Lupa Password | Smartkost Pulo Jahe",
  description: "Minta tautan reset password untuk masuk ke akun OSkost.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
