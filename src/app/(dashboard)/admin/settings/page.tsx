import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAdminProfile } from "@/features/admin/admin-service";
import { ProfileForm } from "@/features/admin/components/profile-form";
import { PasswordForm } from "@/features/admin/components/password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pengaturan | Admin Smartkost",
};

export default async function AdminSettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const admin = await getAdminProfile(session.user.id);

    if (!admin) {
        redirect("/login");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Kelola profil dan keamanan akun admin Anda.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ProfileForm currentEmail={admin.email ?? ""} />
                <PasswordForm />
            </div>
        </div>
    );
}
