import { Navbar } from "@/components/shared";
import { FooterSection } from "@/components/shared/footer-section";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8F6F1] text-[#1E1B18] font-sans antialiased selection:bg-[#A45A3D]/20 selection:text-[#A45A3D]">
            <Navbar />
            <main>{children}</main>
            <FooterSection />
        </div>
    );
}
