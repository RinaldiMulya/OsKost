import { Wifi, Smartphone, ShieldCheck } from "lucide-react";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    hoverColor: "lime" | "purple" | "white";
}

function FeatureCard({ icon, title, description, hoverColor }: FeatureCardProps) {
    const hoverClasses = {
        lime: "hover:bg-secondary hover:text-secondary-foreground",
        purple: "hover:bg-primary hover:text-primary-foreground",
        white: "hover:bg-white hover:text-black",
    };

    return (
        <div
            className={`p-6 lg:p-8 rounded-2xl bg-card border border-border/50 transition-all duration-300 group cursor-pointer ${hoverClasses[hoverColor]}`}
        >
            <div className="mb-4 text-secondary group-hover:text-current transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-current mb-2 transition-colors">
                {title}
            </h3>
            <p className="text-muted-foreground group-hover:text-current/80 text-sm leading-relaxed transition-colors">
                {description}
            </p>
        </div>
    );
}

const features = [
    {
        icon: <Wifi className="w-8 h-8" />,
        title: "FIBER OPTIC 1GBPS",
        description:
            "No lag for your rank games or marathon streaming. Professional grade bandwidth.",
        hoverColor: "lime" as const,
    },
    {
        icon: <Smartphone className="w-8 h-8" />,
        title: "SMART ACCESS",
        description:
            "Ditch the keys. Phone-only entry system with encrypted 24/7 logging.",
        hoverColor: "purple" as const,
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "24/7 AI SECURITY",
        description:
            "Modern CCTV with AI motion detection to keep you and your gear safe 24/7.",
        hoverColor: "white" as const,
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 lg:py-32 bg-card">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Section Header with horizontal line */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-12 lg:mb-16">
                    <div>
                        <h2 className="text-3xl lg:text-5xl font-bold mb-2">
                            <span className="text-foreground">HARDCORE</span>
                            <br />
                            <span className="text-primary">FEATURES</span>
                        </h2>
                    </div>

                    {/* Horizontal divider line */}
                    <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
                        <div className="w-140 h-px bg-border mt-20" />
                    </div>

                    <p className="text-muted-foreground text-xs lg:text-sm max-w-xs mt-4 lg:mt-0 uppercase tracking-wider border-t border-border lg:border-t-0 pt-4 lg:pt-0 text-right">
                        Built for the next generation of urban dwellers.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <li key={index}>
                            <FeatureCard
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                hoverColor={feature.hoverColor}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
