<!DOCTYPE html><html class="dark" lang="id"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>FAQ / Help Center - Smartkost</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container": "#03213b",
                        "on-surface": "#d2e4ff",
                        "on-background": "#d2e4ff",
                        "on-secondary-fixed-variant": "#414c00",
                        "secondary-fixed": "#d2f000",
                        "surface-container-lowest": "#000f20",
                        "surface-container-high": "#112b46",
                        "on-tertiary-container": "#00375e",
                        "on-secondary": "#2c3400",
                        "surface-bright": "#223b56",
                        "outline": "#869490",
                        "surface-variant": "#1d3652",
                        "on-primary-fixed": "#00201b",
                        "on-primary-fixed-variant": "#005046",
                        "surface": "#001429",
                        "on-secondary-container": "#5d6b00",
                        "on-error": "#690005",
                        "inverse-surface": "#d2e4ff",
                        "surface-container-low": "#001d36",
                        "on-tertiary-fixed": "#001d35",
                        "error-container": "#93000a",
                        "on-tertiary": "#003256",
                        "primary-fixed-dim": "#51dbc5",
                        "tertiary-container": "#6ba2dc",
                        "tertiary-fixed": "#d0e4ff",
                        "primary-fixed": "#72f8e1",
                        "error": "#ffb4ab",
                        "primary": "#51dbc5",
                        "tertiary": "#9ccaff",
                        "on-primary-container": "#003d35",
                        "tertiary-fixed-dim": "#9ccaff",
                        "secondary-container": "#d2f000",
                        "on-surface-variant": "#bbcac5",
                        "surface-dim": "#001429",
                        "surface-container-highest": "#1d3652",
                        "secondary-fixed-dim": "#b8d300",
                        "on-primary": "#003730",
                        "primary-container": "#00b29d",
                        "on-error-container": "#ffdad6",
                        "surface-tint": "#51dbc5",
                        "secondary": "#ffffff",
                        "inverse-on-surface": "#18324d",
                        "on-secondary-fixed": "#191e00",
                        "inverse-primary": "#006b5d",
                        "on-tertiary-fixed-variant": "#00497a",
                        "background": "#001429",
                        "outline-variant": "#3c4946"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "container-padding": "20px",
                        "sm": "8px",
                        "md": "16px",
                        "xl": "32px",
                        "lg": "24px",
                        "gutter": "16px",
                        "base": "4px",
                        "xs": "4px"
                    },
                    "fontFamily": {
                        "headline-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Plus Jakarta Sans"],
                        "headline-xl": ["Plus Jakarta Sans"],
                        "body-md": ["Plus Jakarta Sans"],
                        "label-md": ["Plus Jakarta Sans"],
                        "body-lg": ["Plus Jakarta Sans"],
                        "label-sm": ["Plus Jakarta Sans"],
                        "headline-lg-mobile": ["Plus Jakarta Sans"]
                    },
                    "fontSize": {
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.5px", "fontWeight": "700" }],
                        "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-1px", "fontWeight": "700" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.5px", "fontWeight": "600" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        .accordion-content {
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            padding-top: 0;
            padding-bottom: 0;
        }
        .accordion-item.active .accordion-content {
            max-height: 500px; /* Arbitrary large number */
            opacity: 1;
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        .accordion-icon {
            transition: transform 0.3s ease;
        }
        .accordion-item.active .accordion-icon {
            transform: rotate(180deg);
        }
        
        .glass-card {
            background: rgba(3, 33, 59, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(210, 240, 0, 0.2); /* Lime border */
        }
        .glass-card:hover {
            border-color: rgba(210, 240, 0, 0.5);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen font-body-md antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
<!-- TopNavBar (Shared Component Placeholder - Hidden for Landing Page context as per rules, but included if part of a global flow. Suppressed here to focus on content canvas) -->
<!-- Main Content Canvas -->
<main class="w-full max-w-4xl mx-auto px-container-padding py-xl md:py-20">
<!-- Header Section -->
<div class="text-center mb-16 relative">
<div class="absolute inset-0 -z-10 flex items-center justify-center opacity-20 pointer-events-none">
<div class="w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
</div>
<h1 class="font-headline-xl text-headline-xl md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface mb-md">FAQ &amp; Help Center</h1>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
                Temukan jawaban untuk pertanyaan umum seputar pencarian, pemesanan, dan fasilitas Smartkost.
            </p>
</div>
<!-- Accordion Section -->
<div class="space-y-4">
<!-- Item 1 -->
<div class="accordion-item glass-card rounded-xl overflow-hidden transition-all duration-300">
<button aria-expanded="false" class="w-full flex items-center justify-between p-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed rounded-xl group">
<span class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors duration-200">Bagaimana cara booking kamar di Smartkost?</span>
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 group-hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined accordion-icon text-on-surface" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</div>
</button>
<div class="accordion-content px-lg bg-surface-container-low/50">
<p class="font-body-md text-body-md text-on-surface-variant pb-md">
                        Proses booking sangat mudah. Pilih kamar yang Anda inginkan dari daftar properti kami, klik tombol 'Booking Sekarang', lalu ikuti instruksi pembayaran. Anda bisa membayar menggunakan transfer bank, virtual account, atau e-wallet yang didukung.
                    </p>
</div>
</div>
<!-- Item 2 -->
<div class="accordion-item glass-card rounded-xl overflow-hidden transition-all duration-300">
<button aria-expanded="false" class="w-full flex items-center justify-between p-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed rounded-xl group">
<span class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors duration-200">Apakah bisa survey lokasi sebelum booking?</span>
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 group-hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined accordion-icon text-on-surface" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</div>
</button>
<div class="accordion-content px-lg bg-surface-container-low/50">
<p class="font-body-md text-body-md text-on-surface-variant pb-md">
                        Tentu saja. Kami sangat menyarankan Anda untuk melakukan survey. Anda dapat menjadwalkan kunjungan melalui fitur 'Jadwalkan Survey' di halaman detail properti. Tim kami akan menghubungi Anda untuk konfirmasi waktu kunjungan.
                    </p>
</div>
</div>
<!-- Item 3 -->
<div class="accordion-item glass-card rounded-xl overflow-hidden transition-all duration-300">
<button aria-expanded="false" class="w-full flex items-center justify-between p-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed rounded-xl group">
<span class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors duration-200">Apa saja fasilitas yang termasuk dalam harga sewa?</span>
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 group-hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined accordion-icon text-on-surface" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</div>
</button>
<div class="accordion-content px-lg bg-surface-container-low/50">
<p class="font-body-md text-body-md text-on-surface-variant pb-md">
                        Fasilitas bervariasi tergantung tipe kamar. Namun, umumnya harga sewa sudah termasuk listrik (kuota tertentu), air bersih, koneksi Wi-Fi berkecepatan tinggi, kebersihan area umum, dan keamanan 24 jam. Cek halaman detail masing-masing kamar untuk informasi spesifik.
                    </p>
</div>
</div>
<!-- Item 4 -->
<div class="accordion-item glass-card rounded-xl overflow-hidden transition-all duration-300">
<button aria-expanded="false" class="w-full flex items-center justify-between p-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed rounded-xl group">
<span class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors duration-200">Bagaimana kebijakan pembatalan booking?</span>
<div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 group-hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined accordion-icon text-on-surface" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
</div>
</button>
<div class="accordion-content px-lg bg-surface-container-low/50">
<p class="font-body-md text-body-md text-on-surface-variant pb-md">
                        Pembatalan dapat dilakukan maksimal H-7 sebelum tanggal masuk untuk mendapatkan pengembalian dana sebagian (sesuai S&amp;K). Pembatalan kurang dari waktu tersebut mungkin tidak akan mendapatkan refund. Silakan hubungi customer service kami untuk bantuan lebih lanjut.
                    </p>
</div>
</div>
</div>
<!-- Contact Support CTA -->
<div class="mt-20 text-center glass-card rounded-xl p-xl relative overflow-hidden">
<div class="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary-fixed opacity-10 rounded-full blur-[80px]"></div>
<div class="relative z-10">
<span class="material-symbols-outlined text-[48px] text-primary mb-md" data-icon="support_agent" style="font-variation-settings: 'FILL' 1;">support_agent</span>
<h3 class="font-headline-lg text-headline-lg text-on-surface mb-sm">Masih butuh bantuan?</h3>
<p class="font-body-md text-body-md text-on-surface-variant mb-lg max-w-md mx-auto">
                    Tim support kami siap membantu menjawab pertanyaan Anda 24/7. Jangan ragu untuk menghubungi kami.
                </p>
<button class="inline-flex items-center gap-2 bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-3 rounded-full hover:bg-primary transition-colors shadow-[0_0_15px_rgba(0,178,157,0.3)] hover:shadow-[0_0_25px_rgba(0,178,157,0.5)]">
<span class="material-symbols-outlined" data-icon="chat">chat</span>
                    Hubungi Customer Service
                </button>
</div>
</div>
</main>
<script>
        document.addEventListener('DOMContentLoaded', () => {
            const accordionItems = document.querySelectorAll('.accordion-item');

            accordionItems.forEach(item => {
                const button = item.querySelector('button');
                
                button.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other accordions (optional, remove if you want multiple open)
                    accordionItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            otherItem.querySelector('button').setAttribute('aria-expanded', 'false');
                        }
                    });

                    // Toggle current accordion
                    if (isActive) {
                        item.classList.remove('active');
                        button.setAttribute('aria-expanded', 'false');
                    } else {
                        item.classList.add('active');
                        button.setAttribute('aria-expanded', 'true');
                    }
                });
            });
        });
    </script>
</body></html>