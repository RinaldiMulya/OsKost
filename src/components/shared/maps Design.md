<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Smartkost - Full-Bleed Map &amp; Location</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
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
        .glass-panel {
            background-color: rgba(0, 15, 32, 0.85);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(134, 148, 144, 0.2);
        }
        
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(3.5); opacity: 0; }
        }
        
        .marker-pulse {
            animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        /* Lumina Slate custom map depth */
        .map-overlay-vignette {
            background: radial-gradient(circle at center, transparent 0%, rgba(0, 20, 41, 0.4) 100%);
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen font-body-md antialiased overflow-x-hidden">
<!-- Full-Bleed Immersive Map Section -->
<section class="relative w-full h-screen overflow-hidden">
<!-- Immersive Map Background -->
<div class="absolute inset-0 z-0">
<!-- Using high-quality dark map texture style -->
<div class="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-105 hover:scale-100" data-alt="Ultra-detailed dark mode map of Jakarta using Lumina Slate palette: charcoal roads, slate-blue water, and subtle cyan building footprints." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3g9EOl1bW1c9iwb4zLzjGuZHlVh6OZTNuleCTU1yoUgaUtiQ8JwMPtQ7bcKkHECpqxYytj6soEeRB_u-GD2fLH6DJ-nO4YH38hjvghHKW-NlKlaXKyBFT_EttdzE-pBPwShjjEOX2CtD2EK7F2eQSygBMu7Uz3RANAjAxOEZABJlXdlrAhKAHmxgmHMJ0RHL_H8qL8s_O4T82ZgA5bmuBFlAYbqE3xgHQfGmD_eHmtnLhdlE1-gGtWjNGbGr33MLXlEyGQp8pOWI')">
</div>
<!-- Decorative Overlays for Immersive Effect -->
<div class="absolute inset-0 map-overlay-vignette z-10 pointer-events-none"></div>
<div class="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10"></div>
</div>
<!-- Neon-Lime Property Markers (Scatter effect for visual density) -->
<div class="absolute inset-0 z-20 pointer-events-none">
<!-- Main Property Marker -->
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
<div class="relative w-8 h-8 flex items-center justify-center">
<div class="absolute inset-0 rounded-full bg-secondary-fixed/40 marker-pulse"></div>
<div class="relative w-4 h-4 rounded-full bg-secondary-fixed shadow-[0_0_20px_rgba(210,240,0,1)] border-2 border-background"></div>
</div>
<div class="mt-2 bg-background/90 px-3 py-1 rounded-full border border-secondary-fixed/50 backdrop-blur-sm">
<span class="text-secondary-fixed font-label-sm text-xs tracking-wider uppercase">Smartkost Sudirman</span>
</div>
</div>
<!-- Secondary Neon Pin 1 -->
<div class="absolute top-[35%] left-[60%] opacity-60">
<div class="w-3 h-3 rounded-full bg-secondary-fixed shadow-[0_0_10px_rgba(210,240,0,0.8)] border border-background"></div>
</div>
<!-- Secondary Neon Pin 2 -->
<div class="absolute top-[55%] left-[42%] opacity-60">
<div class="w-3 h-3 rounded-full bg-secondary-fixed shadow-[0_0_10px_rgba(210,240,0,0.8)] border border-background"></div>
</div>
</div>
<!-- Floating High-Contrast Information Card (Bottom-Left) -->
<div class="absolute bottom-xl left-container-padding z-30 w-full max-w-[380px]">
<div class="glass-panel rounded-xl p-lg shadow-2xl border-l-4 border-l-secondary-fixed transform transition-all duration-500 hover:translate-y-[-4px]">
<div class="flex items-start justify-between mb-md">
<div>
<span class="inline-flex items-center gap-xs px-2 py-0.5 rounded-full bg-secondary-fixed/10 text-secondary-fixed font-label-sm text-[10px] border border-secondary-fixed/20 mb-sm uppercase tracking-widest">
                        Available Now
                    </span>
<h2 class="text-headline-md font-headline-md text-on-surface">
                        Smartkost
                    </h2>
<p class="text-primary font-label-md text-label-md mt-0.5 opacity-80">
                        Sudirman Hub
                    </p>
</div>
<div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant/30 text-on-surface-variant">
<span class="material-symbols-outlined text-2xl" data-weight="fill">apartment</span>
</div>
</div>
<div class="space-y-md mb-lg">
<div class="flex items-start gap-sm">
<span class="material-symbols-outlined text-secondary-fixed mt-1">location_on</span>
<p class="text-body-md font-body-md text-on-surface/90 leading-tight">
                        Jl. Sudirman No. 45<br/>
                        Jakarta Selatan, 12190
                    </p>
</div>
<div class="grid grid-cols-2 gap-sm pt-md border-t border-outline-variant/20">
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-[18px]">train</span>
<span class="font-label-sm text-xs">3 min walk</span>
</div>
<div class="flex items-center gap-2 text-on-surface-variant">
<span class="material-symbols-outlined text-[18px]">verified</span>
<span class="font-label-sm text-xs">Elite Zone</span>
</div>
</div>
</div>
<!-- Get Directions Button -->
<button class="group w-full bg-secondary-fixed text-on-secondary-fixed py-md px-lg rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm transition-all duration-300 hover:shadow-[0_8px_25px_rgba(210,240,0,0.4)]">
<span class="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1" data-weight="fill">navigation</span>
                Get Directions
            </button>
</div>
</div>
<!-- UI Overlay Controls (Optional: Zoom buttons etc for realism) -->
<div class="absolute top-xl right-container-padding z-30 flex flex-col gap-sm">
<button class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">add</span>
</button>
<button class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined">remove</span>
</button>
<button class="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-secondary-fixed hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined" data-weight="fill">my_location</span>
</button>
</div>
</section>
</body></html>