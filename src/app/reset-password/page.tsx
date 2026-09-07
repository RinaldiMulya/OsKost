import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { verifyResetToken } from "@/features/auth/forgot-password-service";

export const metadata = {
  title: "Reset Password | Smartkost Pulo Jahe",
  description: "Buat password baru untuk akun OSkost.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full max-w-md">
          <ResetPasswordForm
            token=""
            isValidToken={false}
            tokenErrorReason="Tautan reset password tidak ditemukan atau format tidak sesuai."
          />
        </div>
      </main>
    );
  }

  const verification = await verifyResetToken(token);

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md">
        <ResetPasswordForm
          token={token}
          isValidToken={verification.valid}
          tokenErrorReason={verification.reason}
        />
      </div>
    </main>
  );
}
