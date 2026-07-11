import { Building2, MapPin, Train, Verified, Navigation, Plus, Minus, LocateFixed } from "lucide-react";

export function MapsSection() {
    return (
        <section className="relative w-full h-[600px] md:h-screen min-h-[600px] overflow-hidden">
            {/* Immersive Map Background */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-105 hover:scale-100" 
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3g9EOl1bW1c9iwb4zLzjGuZHlVh6OZTNuleCTU1yoUgaUtiQ8JwMPtQ7bcKkHECpqxYytj6soEeRB_u-GD2fLH6DJ-nO4YH38hjvghHKW-NlKlaXKyBFT_EttdzE-pBPwShjjEOX2CtD2EK7F2eQSygBMu7Uz3RANAjAxOEZABJlXdlrAhKAHmxgmHMJ0RHL_H8qL8s_O4T82ZgA5bmuBFlAYbqE3xgHQfGmD_eHmtnLhdlE1-gGtWjNGbGr33MLXlEyGQp8pOWI')" }}
                ></div>
                {/* Decorative Overlays for Immersive Effect */}
                <div 
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10"></div>
            </div>

            {/* Neon-Lime Property Markers (Scatter effect for visual density) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Main Property Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-secondary/40 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="relative w-4 h-4 rounded-full bg-secondary shadow-[0_0_20px_rgba(0,204,64,1)] border-2 border-background"></div>
                    </div>
                    <div className="mt-2 bg-background/90 px-3 py-1 rounded-full border border-secondary/50 backdrop-blur-sm">
                        <span className="text-secondary text-xs tracking-wider uppercase font-semibold">Smartkost Pusat</span>
                    </div>
                </div>

                {/* Secondary Neon Pin 1 */}
                <div className="absolute top-[35%] left-[60%] opacity-60">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(156,0,253,0.8)] border border-background"></div>
                </div>

                {/* Secondary Neon Pin 2 */}
                <div className="absolute top-[55%] left-[42%] opacity-60">
                    <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(0,204,64,0.8)] border border-background"></div>
                </div>
            </div>

            {/* Floating High-Contrast Information Card (Bottom-Left) */}
            <div className="absolute bottom-8 md:bottom-12 left-4 md:left-8 z-30 w-[calc(100%-32px)] md:w-full max-w-[380px]">
                <div className="bg-card/80 backdrop-blur-xl rounded-xl p-6 shadow-2xl border border-border/50 border-l-4 border-l-secondary transform transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] border border-secondary/20 mb-2 uppercase tracking-widest font-semibold">
                                Tersedia 11 Lokasi
                            </span>
                            <h2 className="text-2xl font-bold text-foreground">
                                Smartkost
                            </h2>
                            <p className="text-primary text-sm mt-0.5 opacity-80 font-medium">
                                Pulo Jahe, Cakung
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border/50 text-muted-foreground">
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-2">
                            <MapPin className="text-secondary w-5 h-5 mt-0.5 shrink-0" />
                            <p className="text-foreground/90 text-sm leading-tight">
                                Jl. Pulo Jahe<br />
                                Cakung, Jakarta Timur
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Train className="w-4 h-4" />
                                <span className="text-xs font-medium">Dekat Stasiun</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Verified className="w-4 h-4" />
                                <span className="text-xs font-medium">Area Strategis</span>
                            </div>
                        </div>
                    </div>

                    {/* Get Directions Button */}
                    <button className="group w-full bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(0,204,64,0.4)]">
                        <Navigation className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        Petunjuk Arah
                    </button>
                </div>
            </div>

            {/* UI Overlay Controls (Optional: Zoom buttons etc for realism) */}
            <div className="hidden md:flex absolute top-12 right-8 z-30 flex-col gap-2">
                <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 flex items-center justify-center text-secondary hover:bg-muted transition-colors mt-2">
                    <LocateFixed className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
}
