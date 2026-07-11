import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MobileNavToggle } from "./mobile-nav-toggle";

const navLinks = [
    { href: "#rooms", label: "Find Room" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/10 backdrop-blur-md border-b border-black/30">
            <nav className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/images/logo.webp"
                            alt="Smartkost Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10"
                        />
                        <span className="font-semibold text-white text-lg tracking-tight">
                            Smartkost Pulo Jahe
                        </span>
                    </Link>

                    {/* Desktop Navigation + CTA grouped together */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-muted-foreground hover:text-secondary transition-colors text-sm font-medium uppercase tracking-wide"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Login Link */}
                        <Link
                            href="/login"
                            className="text-white hover:text-secondary transition-colors text-sm font-bold uppercase tracking-wider"
                        >
                            Login
                        </Link>

                        {/* CTA Button with offset effect */}
                        <div className="relative group/btn">
                            {/* Offset layer */}
                            <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform duration-200 group-hover/btn:translate-x-2 group-hover/btn:translate-y-2" />
                            {/* Button */}
                            <Button
                                asChild
                                className="rounded-none relative bg-secondary text-secondary-foreground font-bold px-8 py-5 uppercase tracking-wider text-sm border-2 border-black duration-200"
                            >
                                <Link href="#book">Book Now</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button + Navigation (Client Component) */}
                    <MobileNavToggle navLinks={navLinks} />
                </div>
            </nav>
        </header>
    );
}
