import { DoorOpen, IdCard, CreditCard, Key } from "lucide-react";

export function BookingStepsSection() {
    return (
        <section className="w-full max-w-6xl mx-auto py-16 px-4 md:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Cara Pesan Smartkost
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    4 langkah mudah untuk memulai pengalaman tinggal di kost masa depan. Digital, cepat, dan aman.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-muted -z-10 -translate-y-1/2">
                    <div className="h-full bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 w-1/2 shadow-[0_0_10px_rgba(156,0,253,0.5)]"></div>
                </div>

                {/* Step 1 */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -right-4 -top-4 text-8xl font-black text-secondary/20 drop-shadow-[0_0_20px_rgba(0,204,64,0.3)] group-hover:opacity-40 transition-opacity z-0">
                        1
                    </div>
                    <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-6 border border-border shadow-[0_0_15px_rgba(156,0,253,0.3)] relative z-10">
                        <DoorOpen className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2 relative z-10">Pilih Kamar</h3>
                    <p className="text-muted-foreground text-sm relative z-10">
                        Jelajahi ketersediaan kamar secara real-time dan pilih yang paling sesuai dengan kebutuhan Anda.
                    </p>
                </div>

                {/* Step 2 */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -right-4 -top-4 text-8xl font-black text-secondary/20 drop-shadow-[0_0_20px_rgba(0,204,64,0.3)] group-hover:opacity-40 transition-opacity z-0">
                        2
                    </div>
                    <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-6 border border-border shadow-[0_0_15px_rgba(156,0,253,0.3)] relative z-10">
                        <IdCard className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2 relative z-10">Verifikasi Data</h3>
                    <p className="text-muted-foreground text-sm relative z-10">
                        Unggah dokumen identitas dengan aman. Sistem cerdas kami memproses verifikasi dalam hitungan menit.
                    </p>
                </div>

                {/* Step 3 */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -right-4 -top-4 text-8xl font-black text-secondary/20 drop-shadow-[0_0_20px_rgba(0,204,64,0.3)] group-hover:opacity-40 transition-opacity z-0">
                        3
                    </div>
                    <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-6 border border-border shadow-[0_0_15px_rgba(0,204,64,0.3)] relative z-10">
                        <CreditCard className="text-secondary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2 relative z-10">Pembayaran Digital</h3>
                    <p className="text-muted-foreground text-sm relative z-10">
                        Selesaikan pembayaran DP atau sewa bulan pertama melalui berbagai metode pembayaran digital yang terintegrasi.
                    </p>
                </div>

                {/* Step 4 */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -right-4 -top-4 text-8xl font-black text-secondary/20 drop-shadow-[0_0_20px_rgba(0,204,64,0.3)] group-hover:opacity-40 transition-opacity z-0">
                        4
                    </div>
                    <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-6 border border-border shadow-[0_0_15px_rgba(156,0,253,0.3)] relative z-10">
                        <Key className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2 relative z-10">Siap Huni</h3>
                    <p className="text-muted-foreground text-sm relative z-10">
                        Dapatkan akses kunci digital langsung ke smartphone Anda. Selamat datang di Smartkost!
                    </p>
                </div>
            </div>
        </section>
    );
}
