interface OwnerStatusBadgeProps {
    status: string;
}

export function OwnerStatusBadge({ status }: OwnerStatusBadgeProps) {
    switch (status) {
        case "ACTIVE":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#4A7C59]/10 text-[#4A7C59] border border-[#4A7C59]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
                    Aktif
                </span>
            );
        case "TRIAL":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8C6239]/10 text-[#8C6239] border border-[#8C6239]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8C6239]" />
                    Masa Trial
                </span>
            );
        case "PAST_DUE":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4A843]/15 text-[#9E7822] border border-[#D4A843]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843]" />
                    Past Due (Menunggak)
                </span>
            );
        case "SUSPENDED":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C45B4B]/10 text-[#C45B4B] border border-[#C45B4B]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C45B4B]" />
                    Ditangguhkan
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8E2DA] text-[#5C564E]">
                    {status}
                </span>
            );
    }
}
