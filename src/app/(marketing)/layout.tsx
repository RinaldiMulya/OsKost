import { Navbar } from "@/components/shared";
import { FooterSection } from "@/components/shared/footer-section";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
            <FooterSection />
        </div>
    );
}
