import { Receipt } from "lucide-react";

export const metadata = {
    title: "Tagihan | Admin Smartkost",
};

export default function AdminBillingPage() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 mb-6">
                <Receipt className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Tagihan</h2>
            <p className="text-muted-foreground max-w-md">
                Fitur ini sedang dalam pengembangan. Anda akan bisa membuat,
                mengelola, dan melacak pembayaran tagihan penghuni.
            </p>
        </div>
    );
}
