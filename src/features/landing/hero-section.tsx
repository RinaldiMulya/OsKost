import Image from "next/image";

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
            {/* Background Image with dark overlay */}
            <div className="absolute inset-0">
                <Image
                    src="/images/hero-bg.webp"
                    alt="Cozy bedroom aesthetic"
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Curtain stripes effect */}
                <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 w-[5%] bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            style={{ left: `${i * 5}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Left decorative - yellow line */}
            <div className="absolute bottom-1/4 right-12 lg:right-40 lg:bottom-200">
                <div className="w-16 h-0.5 lg:w-170 lg:h-1.5 bg-yellow-400/20" />
            </div>
            {/* Decorative elements */}
            <div className="absolute top-1/4 right-8 lg:right-16">
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full border-2 border-primary/30" />
            </div>
            <div className="absolute bottom-1/4 right-12 lg:right-24 rotate-45">
                <div className="w-8 h-8 lg:w-12 lg:h-12 border-2 border-secondary/40" />
            </div>
            {/* Left decorative - Purple line */}
            <div className="absolute bottom-1/4 left-12 lg:left-24">
                <div className="w-16 h-0.5 lg:w-300 lg:h-1.5 bg-primary/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 lg:px-8">
                <div className="max-w-8xl mx-auto text-start">
                    {/* Badge - Light glow effect */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/30 border border-primary/90 mb-8 backdrop-blur-sm shadow-[0_0_40px_rgba(129,0,209,0.3)]">
                        <span className="text-white text-lg font-medium tracking-wide drop-shadow-[0_0_16px_rgba(129,0,209,0.8)]">
                            JAKARTA INDUSTRY HUB
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-[10rem] font-extrabold tracking-tight mb-6 leading-none">
                        <span className="text-white">KOST GAK</span>
                        <br />
                        <span className="text-secondary">RIBET </span>
                        <span className="text-white">LAGI.</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-white/70 text-lg lg:text-2xl max-w-2xl mb-10">
                        Upgrade your living game with Smartkost.
                        <br className="hidden sm:block" />
                        Fully automated, high-speed, and no BS.
                        <br className="hidden sm:block" />
                        Boarding experience.
                    </p>

                    {/* 360 Virtual Tour CTA - Glass/Crystal effect with shine on hover */}
                    <div className="group inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] relative overflow-hidden">
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="text-3xl lg:text-4xl font-bold text-white relative z-10">360°</div>
                        <div className="text-left relative z-10">
                            <p className="text-xs text-white/70 uppercase tracking-wider">Virtual</p>
                            <p className="text-xs text-white/70 uppercase tracking-wider">Room Tour</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2 backdrop-blur-sm">
                    <div className="w-1 h-3 rounded-full bg-secondary" />
                </div>
            </div>
        </section>
    );
}
