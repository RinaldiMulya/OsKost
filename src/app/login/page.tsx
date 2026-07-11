import { LoginForm } from "@/features/auth/login-form";

export const metadata = {
    title: "Login | Smartkost Pulo Jahe",
    description: "Login untuk masuk ke panel manajemen OSkost.",
};

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-md backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl shadow-2xl">
                <LoginForm />
            </div>
        </main>
    );
}
