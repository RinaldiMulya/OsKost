import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "#rooms", label: "Units" },
    { href: "#reviews", label: "Reviews" },
];

const socialLinks = [
    { href: "https://instagram.com", label: "Instagram" },
    { href: "https://tiktok.com", label: "TikTok" },
    { href: "https://twitter.com", label: "X / Twitter" },
];

export function FooterSection() {
    return (
        <footer className="py-16 lg:py-24 bg-card border-t border-border/30">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:grid-rows-1 gap-12 lg:gap-8">
                    {/* Contact Section */}
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl lg:text-3xl font-bold italic mb-6">
                            <span className="text-foreground">LET&apos;S</span>
                            <br />
                            <span className="text-secondary">CONNECT</span>
                        </h3>
                        <div className="space-y-4">
                            {/* Phone - with lime circle hover */}
                            <a
                                href="tel:0123456789"
                                className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-300"
                            >
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-secondary transition-colors duration-300">
                                    <Phone className="w-5 h-5 group-hover:text-secondary-foreground transition-colors" />
                                </span>
                                <span>0123456789</span>
                            </a>
                            {/* Email - with purple circle hover */}
                            <a
                                href="mailto:hello@smartkost.io"
                                className="group flex items-center gap-3 text-muted-foreground hover:text-foreground transition-all duration-300"
                            >
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-primary transition-colors duration-300">
                                    <Mail className="w-5 h-5 group-hover:text-primary-foreground transition-colors" />
                                </span>
                                <span>hello@smartkost.io</span>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="text-xs text-primary uppercase tracking-widest font-medium mb-4">
                            Nav
                        </h4>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground hover:text-secondary transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h4 className="text-xs text-secondary uppercase tracking-widest font-medium mb-4">
                            Socials
                        </h4>
                        <ul className="space-y-3">
                            {socialLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-foreground hover:text-secondary transition-colors font-medium"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-16 pt-8 border-t border-border/30">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <p className="text-muted-foreground text-sm">
                            © 2026 Smartkost. Not your average boarding house.
                        </p>
                        <div className="flex items-center gap-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i === 0
                                        ? "bg-primary"
                                        : i === 1
                                            ? "bg-secondary"
                                            : "bg-accent"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
