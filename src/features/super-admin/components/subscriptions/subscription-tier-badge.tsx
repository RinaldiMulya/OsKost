interface SubscriptionTierBadgeProps {
    tier: string;
}

export function SubscriptionTierBadge({ tier }: SubscriptionTierBadgeProps) {
    switch (tier) {
        case "ENTERPRISE":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#1A1A2E] text-[#FAF7F2] border border-[#25253D]">
                    Enterprise
                </span>
            );
        case "PRO":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#D4A843]/15 text-[#9E7822] border border-[#D4A843]/30">
                    Pro
                </span>
            );
        case "GROWTH":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#5D6654]/15 text-[#5D6654] border border-[#5D6654]/30">
                    Growth
                </span>
            );
        case "STARTER":
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#8C6239]/15 text-[#8C6239] border border-[#8C6239]/30">
                    Starter
                </span>
            );
        case "FREE":
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E8E2DA] text-[#5C564E]">
                    Free (1-5 Kamar)
                </span>
            );
    }
}
