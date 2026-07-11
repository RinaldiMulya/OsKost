import { AlertCircle } from "lucide-react";

export const metadata = {
    title: "Laporan | Admin Smartkost",
};

export default function AdminReportsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 mb-6">
                <AlertCircle className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
                Laporan Kerusakan
            </h2>
            <p className="text-muted-foreground max-w-md">
                Fitur ini sedang dalam pengembangan. Penghuni akan bisa
                melaporkan kerusakan, dan Anda bisa melacak statusnya di sini.
            </p>
        </div>
    );
}
