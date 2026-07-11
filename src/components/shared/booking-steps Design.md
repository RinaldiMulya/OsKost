<!DOCTYPE html><html class="dark" lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Smartkost - Booking Steps</title>
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
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .glass-card {
            background: rgba(3, 33, 59, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .neon-number {
            text-shadow: 0 0 20px rgba(210, 240, 0, 0.5);
        }
        .glow-line {
            box-shadow: 0 0 10px rgba(0, 178, 157, 0.5);
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen flex items-center justify-center p-4 md:p-8">
<section class="w-full max-w-6xl mx-auto py-16">
<div class="text-center mb-16">
<h2 class="font-headline-xl text-headline-xl text-on-background mb-4">Cara Pesan Smartkost</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">4 langkah mudah untuk memulai pengalaman tinggal di kost masa depan. Digital, cepat, dan aman.</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
<!-- Connecting Line (Desktop) -->
<div class="hidden lg:block absolute top-1/2 left-0 w-full h-[2px] bg-surface-variant -z-10 -translate-y-1/2">
<div class="h-full bg-gradient-to-r from-primary-container via-secondary-container to-primary-container w-1/2 glow-line"></div>
</div>
<!-- Step 1 -->
<div class="glass-card rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
<div class="absolute -right-4 -top-4 text-8xl font-black text-secondary-container opacity-10 neon-number group-hover:opacity-20 transition-opacity">1</div>
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline-variant shadow-[0_0_15px_rgba(0,178,157,0.3)]">
<span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">
                        door_front
                    </span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Pilih Kamar</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Jelajahi ketersediaan kamar secara real-time dan pilih yang paling sesuai dengan kebutuhan Anda.</p>
</div>
<!-- Step 2 -->
<div class="glass-card rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
<div class="absolute -right-4 -top-4 text-8xl font-black text-secondary-container opacity-10 neon-number group-hover:opacity-20 transition-opacity">2</div>
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline-variant shadow-[0_0_15px_rgba(0,178,157,0.3)]">
<span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">
                        badge
                    </span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Verifikasi Data</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Unggah dokumen identitas dengan aman. Sistem cerdas kami memproses verifikasi dalam hitungan menit.</p>
</div>
<!-- Step 3 -->
<div class="glass-card rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
<div class="absolute -right-4 -top-4 text-8xl font-black text-secondary-container opacity-10 neon-number group-hover:opacity-20 transition-opacity">3</div>
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline-variant shadow-[0_0_15px_rgba(210,240,0,0.3)]">
<span class="material-symbols-outlined text-secondary-container text-3xl" style="font-variation-settings: 'FILL' 1;">
                        payments
                    </span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Pembayaran Digital</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Selesaikan pembayaran DP atau sewa bulan pertama melalui berbagai metode pembayaran digital yang terintegrasi.</p>
</div>
<!-- Step 4 -->
<div class="glass-card rounded-xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
<div class="absolute -right-4 -top-4 text-8xl font-black text-secondary-container opacity-10 neon-number group-hover:opacity-20 transition-opacity">4</div>
<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-6 border border-outline-variant shadow-[0_0_15px_rgba(0,178,157,0.3)]">
<span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">
                        key
                    </span>
</div>
<h3 class="font-headline-md text-headline-md text-on-surface mb-2">Siap Huni</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Dapatkan akses kunci digital langsung ke smartphone Anda. Selamat datang di Smartkost!</p>
</div>
</div>
</section>
</body></html>