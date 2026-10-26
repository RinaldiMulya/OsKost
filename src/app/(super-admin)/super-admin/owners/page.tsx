import { getOwnersList } from "@/features/super-admin/actions/owners-actions";
import { OwnersTable } from "@/features/super-admin/components/owners/owners-table";
import { Users, Building, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Daftar Pemilik Kost",
};

export default async function SuperAdminOwnersPage() {
    const owners = await getOwnersList();

    const totalProperties = owners.reduce(
        (acc, curr) => acc + curr.properties.length,
        0
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A2E]">
                        Daftar Pemilik Kost (B2B Owners)
                    </h1>
                    <p className="text-sm text-[#7A7A7A] mt-1">
                        Pusat kendali akun klien SaaS, kuota properti, dan status kepemilikan platform.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-xs">
                        <Users className="w-4 h-4 text-[#8C6239]" />
                        <span className="text-[#5C564E]">Total Klien:</span>
                        <span className="font-bold text-[#1A1A2E]">{owners.length} Akun</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-xs">
                        <Building className="w-4 h-4 text-[#5D6654]" />
                        <span className="text-[#5C564E]">Properti:</span>
                        <span className="font-bold text-[#1A1A2E]">{totalProperties} Unit</span>
                    </div>
                </div>
            </div>

            {/* Interactive DataTable */}
            <OwnersTable initialOwners={owners} />
        </div>
    );
}
