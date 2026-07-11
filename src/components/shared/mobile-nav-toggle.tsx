"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavLink {
    href: string;
    label: string;
}

interface MobileNavToggleProps {
    navLinks: NavLink[];
}

export function MobileNavToggle({ navLinks }: MobileNavToggleProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <button
                className="md:hidden p-2 text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isMenuOpen && (
                <div className="absolute top-16 lg:top-20 left-0 right-0 md:hidden py-4 border-t border-border/40 bg-background/95 backdrop-blur-md shadow-xl px-4 z-40">
                    <div className="flex flex-col gap-4 container mx-auto">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-muted-foreground hover:text-secondary transition-colors text-sm font-medium py-2 uppercase tracking-wide"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/login"
                            className="text-white hover:text-secondary transition-colors text-sm font-bold py-2 uppercase tracking-wide"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Login
                        </Link>
                        <Button
                            asChild
                            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold w-full mt-2 rounded-2xl uppercase tracking-wider"
                        >
                            <Link href="#book" onClick={() => setIsMenuOpen(false)}>Book Now</Link>
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
