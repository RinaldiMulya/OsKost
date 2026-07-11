"use client";

import { useRef } from "react";
import { Star, StarHalf, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        id: 1,
        rating: 5,
        text: '"Kost paling keren, gak ribet! Semua bisa diatur lewat HP, dari buka pintu sampe bayar tagihan. Beneran kayak hidup di masa depan, gak nyesel pindah ke sini."',
        name: "Budi Santoso",
        role: "Tech Developer",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwZqN9UtmSRwiLO5AxKfx9fmkG9ri-xrN3SsM09QOM9CwLD05aiFO1ZIF_A4WUiIi3Vv0sGpzHMZL8dQdbMLcrctMhVx1BL1-CIoWUOKsGbqt8MbeyokR8JfCYPrxSGIgmK8YwBbuaT8CMZ0vjY4QnbMAwEe-xzTUi23q5YT-cNNxkNeKEOlUsBH-HaRWjhw6jdcngfNJl4L6jvFgB3QO4kVZzbH0jVvo6pD9cm0RWe2s1Zi9n6kaea0p1ZqjLaEZPYWnpp-fXCgk",
        glowColor: "group-hover/card:bg-primary/20 hover:border-primary/50 border-primary/50"
    },
    {
        id: 2,
        rating: 5,
        text: '"Suasananya tenang dan desain kamarnya futuristik abis. Cocok banget buat WFH. Internetnya kenceng dan fitur lapor keluhan di app langsung ditangani admin."',
        name: "Siti Rahma",
        role: "Freelance Designer",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuhXolVARaPv6gp0r7SYjtHu8zCYsQC8OPuGPIISvwEIInh9_ThLP3lhKlGqS3hnE4qDtNsE17m2oVQ0UzJGAR614JPtcntNYyBJ5nkKzmhUo2f-h8KEVCJuMogxYlCWTeJ-rVW95E9174ha7CjCFLJf_ypZOmUQ4V4sF9wCsWkDQFmNf_PgO6tWTs3MynlqTx3rqryLjHgLcNJzwxkhlFIqdMSOplxzYIpvRm6P6eXj1awo_wNa7-BI5RQfzGiPr00Xwx3y7zydY",
        glowColor: "group-hover/card:bg-secondary/20 hover:border-secondary/50 border-secondary/50"
    },
    {
        id: 3,
        rating: 4.5,
        text: '"Security top notch! Ngerasa aman banget karena akses pake smart lock. Lupa bawa kunci udah bukan masalah lagi. Fasilitas sekelas apartemen dengan harga mahasiswa."',
        name: "Andi Pratama",
        role: "Mahasiswa",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0-nagfs-EZJTqVHfwtylFDco9bfj_g29b60M-rKHw-oMHdxp3jZEtYbZbej-lwPcf2J5CpM5cdiZ8Dp_D1o9yU5k-KyX72YUhqymeUZJVmG6-bEM-Et-vBOv4wZZPGN0vZHE5_5LThh5co2gKwJHfHugUKoAL4AwB_RKu25DwJ7wZpEErtDpdIJEv8mqj6dBFoCzcsZGCACeBKdoflzLcjQY5cY9M2mJaQbOK6492ssWLN_u2I3PD_J6TM8YoDGzBhUrTnFDaTRM",
        glowColor: "group-hover/card:bg-primary/20 hover:border-primary/50 border-primary/50"
    },
    {
        id: 4,
        rating: 5,
        text: '"Membayar tagihan bulanan sangat mudah dan transparan. Tidak ada lagi drama nungguin nagih. Semua tercatat rapi di aplikasi. Highly recommended buat profesional muda."',
        name: "Rina Wijaya",
        role: "Karyawan Swasta",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBn3fePiuwRZXI7tPqSqM43WZ_fqu_x37vnN6d53wz55544afU8AsBZuZ-Hxq57Wx_43_EddwC2No13q93d2B10vqsGQ03WEvn9XfZBzYFz_gpBwg9EjqFKmsVvewyfCpI2vILPu7xhr6CDTrSm44_X_8szblRwr3VERVZ0Em5ImtJljfYzFCsZ-ESchJ-VS1x0YEhLnltmIubAy-Jk3KLG-u8XMjC3Q0aYYdEafySPZMt5047ZYVKsZbBM4n0qlP4Xsebtm_WdNDI",
        glowColor: "group-hover/card:bg-secondary/20 hover:border-secondary/50 border-secondary/50"
    }
];

export function TestimonialSection() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <section className="relative z-10 py-24 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center overflow-hidden">
            {/* Ambient Glowing Orbs Background */}
            <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            {/* Section Header */}
            <div className="text-center mb-16 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>Cerita Penghuni</span>
                </div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                    Tanggapan dari <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Penghuni Kami</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                    Rasakan pengalaman hunian digital secara langsung. Temukan bagaimana Smartkost mengubah tempat tinggal menjadi pengalaman yang mudah dan premium.
                </p>
            </div>

            {/* Carousel Container */}
            <div className="w-full relative group z-10">
                {/* Left Gradient Fade */}
                <div className="absolute top-0 left-0 w-8 md:w-24 h-full bg-gradient-to-r from-background to-transparent z-20 pointer-events-none"></div>

                {/* Scrollable Track */}
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 pt-4 px-4 scrollbar-hide scroll-smooth"
                >
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="w-[320px] md:w-[420px] flex-shrink-0 snap-center relative group/card">
                            {/* Glow behind card on hover */}
                            <div className={`absolute inset-0 blur-xl rounded-2xl opacity-0 transition-opacity duration-500 ${testimonial.glowColor.split(' ')[0]}`}></div>
                            
                            <div className={`relative h-full bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 ${testimonial.glowColor.split(' ')[1]}`}>
                                <div>
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-6 text-secondary">
                                        {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-current" />
                                        ))}
                                        {testimonial.rating % 1 !== 0 && (
                                            <StarHalf className="w-5 h-5 fill-current" />
                                        )}
                                    </div>
                                    {/* Review Text */}
                                    <p className="text-lg text-foreground mb-8 italic">
                                        {testimonial.text}
                                    </p>
                                </div>
                                {/* User Info */}
                                <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shrink-0 ${testimonial.glowColor.split(' ')[2]}`}>
                                        <Image 
                                            src={testimonial.image} 
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-foreground">{testimonial.name}</h4>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Gradient Fade */}
                <div className="absolute top-0 right-0 w-8 md:w-24 h-full bg-gradient-to-l from-background to-transparent z-20 pointer-events-none"></div>

                {/* Scroll Controls */}
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button 
                        onClick={scrollLeft}
                        className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors shadow-lg backdrop-blur-md"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={scrollRight}
                        className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary transition-colors shadow-lg backdrop-blur-md"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section>
    );
}
