<!DOCTYPE html><html class="dark" lang="id"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>Tenant Management - Smartkost</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "on-secondary-fixed": "#002114",
                        "tertiary-container": "#ffb95f",
                        "surface-container": "#1f1f21",
                        "primary-fixed": "#d8e2ff",
                        "primary-container": "#adc6ff",
                        "primary": "#d8e2ff",
                        "secondary": "#4edea3",
                        "outline": "#8e909a",
                        "on-tertiary-container": "#754900",
                        "inverse-on-surface": "#303032",
                        "outline-variant": "#44474f",
                        "on-tertiary": "#472a00",
                        "surface-container-low": "#1b1b1d",
                        "tertiary-fixed-dim": "#ffb95f",
                        "on-primary-container": "#385283",
                        "on-secondary-container": "#003e28",
                        "surface-container-high": "#2a2a2c",
                        "surface-tint": "#adc6ff",
                        "on-tertiary-fixed": "#2a1700",
                        "on-tertiary-fixed-variant": "#653e00",
                        "tertiary-fixed": "#ffddb8",
                        "secondary-container": "#00b47d",
                        "on-secondary-fixed-variant": "#005236",
                        "inverse-surface": "#e5e1e4",
                        "secondary-fixed": "#6ffbbe",
                        "surface-dim": "#131315",
                        "on-surface-variant": "#c4c6d0",
                        "surface-variant": "#353437",
                        "background": "#131315",
                        "on-primary-fixed": "#001a42",
                        "secondary-fixed-dim": "#4edea3",
                        "on-surface": "#e5e1e4",
                        "primary-fixed-dim": "#adc6ff",
                        "inverse-primary": "#455e90",
                        "on-background": "#e5e1e4",
                        "error": "#ffb4ab",
                        "surface-bright": "#39393b",
                        "surface": "#131315",
                        "on-error": "#690005",
                        "tertiary": "#ffddb7",
                        "on-primary-fixed-variant": "#2c4677",
                        "on-primary": "#122f5f",
                        "surface-container-lowest": "#0e0e10",
                        "error-container": "#93000a",
                        "on-error-container": "#ffdad6",
                        "on-secondary": "#003824",
                        "surface-container-highest": "#353437"
                    },
                    borderRadius: {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    spacing: {
                        "xl": "32px",
                        "base": "4px",
                        "margin-desktop": "24px",
                        "gutter": "16px",
                        "sm": "8px",
                        "margin-mobile": "16px",
                        "lg": "24px",
                        "md": "16px",
                        "xs": "4px"
                    },
                    fontFamily: {
                        "headline-md": ["Plus Jakarta Sans"],
                        "headline-lg": ["Plus Jakarta Sans"],
                        "headline-sm": ["Plus Jakarta Sans"],
                        "headline-lg-mobile": ["Plus Jakarta Sans"],
                        "label-lg": ["Inter"],
                        "body-md": ["Inter"],
                        "display-lg": ["Plus Jakarta Sans"],
                        "body-lg": ["Inter"],
                        "title-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "title-lg": ["Plus Jakarta Sans"]
                    },
                    fontSize: {
                        "headline-md": ["28px", { lineHeight: "36px", fontWeight: "600" }],
                        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
                        "headline-sm": ["24px", { lineHeight: "32px", fontWeight: "500" }],
                        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
                        "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.1px", fontWeight: "500" }],
                        "body-md": ["14px", { lineHeight: "20px", letterSpacing: "0.25px", fontWeight: "400" }],
                        "display-lg": ["57px", { lineHeight: "64px", letterSpacing: "-0.25px", fontWeight: "400" }],
                        "body-lg": ["16px", { lineHeight: "24px", letterSpacing: "0.5px", fontWeight: "400" }],
                        "title-md": ["16px", { lineHeight: "24px", letterSpacing: "0.15px", fontWeight: "500" }],
                        "label-sm": ["11px", { lineHeight: "16px", letterSpacing: "0.5px", fontWeight: "500" }],
                        "title-lg": ["22px", { lineHeight: "28px", fontWeight: "500" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .fill-icon {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        
        /* Animations */
        .fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        
        /* Expandable Table Row */
        .expandable-row-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows 0.3s ease-out;
        }
        .expandable-row-content.expanded {
            grid-template-rows: 1fr;
        }
        .expandable-inner {
            overflow: hidden;
        }
        
        /* Toast */
        #toast {
            transform: translateY(100%);
            opacity: 0;
            transition: all 0.3s ease-in-out;
        }
        #toast.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        /* Counter */
        .counter-value {
            display: inline-block;
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md min-h-screen flex overflow-x-hidden">
<!-- SIDEBAR -->
<aside class="w-64 flex-shrink-0 bg-surface-container h-screen flex flex-col py-lg px-md border-r border-outline-variant/30 sticky top-0 z-20">
<!-- Brand -->
<div class="flex items-center gap-3 mb-10 px-2">
<span class="material-symbols-outlined fill-icon text-primary text-[32px]">apartment</span>
<div>
<h1 class="font-headline-sm text-headline-sm text-primary tracking-tight">Smartkost</h1>
<p class="font-label-sm text-label-sm text-on-surface-variant">Powered By Oskost</p>
</div>
</div>
<!-- Navigation -->
<nav class="flex-1 flex flex-col gap-2">
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">dashboard</span>
                Overview
            </a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">door_front</span>
                Room Management
            </a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg bg-surface-container-high text-primary font-bold border-l-4 border-primary transition-colors font-label-lg text-label-lg shadow-[inset_4px_0_0_0_var(--tw-colors-primary)]" href="#">
<span class="material-symbols-outlined fill-icon">groups</span>
                Tenants
            </a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">payments</span>
                Finance
            </a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">analytics</span>
                Reports
            </a>
<a class="flex items-center gap-3 px-3 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">settings</span>
                Settings
            </a>
</nav>
<!-- Footer -->
<div class="mt-auto pt-6 border-t border-outline-variant/30 flex flex-col gap-4">
<div class="flex items-center gap-3 px-2">
<img alt="Admin Avatar" class="w-10 h-10 rounded-full bg-primary-container p-1" data-alt="A small, professional 3D-style avatar of a property manager against a soft blue background. The aesthetic is modern corporate, clean, and well-lit, designed for a dark mode interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYw0uqY4WM5PW9hSjZEcEnE65ymihVeaZ0Um7Qa6zcKkBUjjoJOGExq2fxnMTFE5e3jM32TOVS7zmlGag1tLiK8Xl4PyMErgXWPn_W_D1C0cd8vIg9zZv-fufMNboSVqru8G9bmaI1Yxxlqfc-MS3kJZvkMzAr1XuNs8psSc3mMPFmDcpTDaQh24Jfppi1BhsFTfw_qaMm9V521bwglYw0MfVg372-WQ6tv7nQzVcYZ3WXbmNoeJjl2HfaCNODW8VFc5TkU7BHTqg">
<div>
<p class="font-label-lg text-label-lg text-on-surface">John Doe</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">Property Admin</p>
</div>
</div>
</div>
</aside>
<!-- MAIN CONTENT -->
<main class="flex-1 flex flex-col min-w-0">
<!-- TOP APP BAR -->
<header class="h-16 flex items-center justify-between px-lg border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-10">
<!-- Breadcrumbs -->
<div class="flex items-center gap-2 text-on-surface-variant font-label-lg text-label-lg">
<span class="">Overview</span>
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
<span class="text-on-surface">Penghuni</span>
</div>
<!-- Actions -->
<div class="flex items-center gap-4">
<button class="relative p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high rounded-full" id="notif-btn">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
</button>
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-high rounded-full">
<span class="material-symbols-outlined">help</span>
</button>
<!-- Notif Dropdown -->
<div class="absolute top-16 right-lg w-72 bg-surface-container border border-outline-variant/30 rounded-xl shadow-lg hidden flex-col overflow-hidden" id="notif-dropdown">
<div class="p-4 border-b border-outline-variant/30">
<h3 class="font-title-md text-title-md text-on-surface">Notifications</h3>
</div>
<div class="p-4 hover:bg-surface-container-high cursor-pointer transition-colors border-b border-outline-variant/20">
<p class="font-label-sm text-label-sm text-error mb-1">Payment Overdue</p>
<p class="font-body-md text-body-md text-on-surface">Budi Santoso missed payment deadline.</p>
</div>
<div class="p-4 hover:bg-surface-container-high cursor-pointer transition-colors">
<p class="font-label-sm text-label-sm text-tertiary-container mb-1">Contract Expiring</p>
<p class="font-body-md text-body-md text-on-surface">Room A-102 contract ends in 30 days.</p>
</div>
</div>
</div>
</header>
<!-- PAGE CONTENT CANVAS -->
<div class="p-10 max-w-[1400px] w-full mx-auto flex flex-col gap-8">
<!-- Header Section -->
<div class="flex items-end justify-between fade-in-up">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">Manajemen Penghuni</h2>
<p class="font-body-lg text-body-lg text-on-surface-variant">Kelola data, status pembayaran, dan kontrak penyewa.</p>
</div>
<button class="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary/90 transition-all hover:shadow-[0_4px_12px_rgba(216,226,255,0.15)] active:scale-95">
<span class="material-symbols-outlined text-[20px]">person_add</span>
                    Check-in Tenant
                </button>
</div>
<!-- Stats Bento Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in-up stagger-1">
<!-- Stat 1 -->
<div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300">
<div class="flex items-center gap-3 mb-4">
<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">group</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface-variant">Total Penghuni</h3>
</div>
<div class="flex items-baseline gap-3">
<span class="font-display-lg text-display-lg text-on-surface counter-value" data-target="45">45</span>
<span class="font-label-sm text-label-sm text-secondary bg-secondary/10 px-2 py-1 rounded-md flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">trending_up</span> +3 bulan ini
                        </span>
</div>
</div>
<!-- Stat 2 -->
<div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300">
<div class="flex items-center gap-3 mb-4">
<div class="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined">check_circle</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface-variant">Sudah Bayar</h3>
</div>
<div class="flex items-baseline gap-3">
<span class="font-display-lg text-display-lg text-on-surface counter-value" data-target="38">38</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">84% dari total</span>
</div>
</div>
<!-- Stat 3 -->
<div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent pointer-events-none"></div>
<div class="flex items-center gap-3 mb-4 relative z-10">
<div class="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error">
<span class="material-symbols-outlined">warning</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface-variant">Belum Bayar</h3>
</div>
<div class="flex items-baseline gap-3 relative z-10">
<span class="font-display-lg text-display-lg text-error counter-value" data-target="7">7</span>
<span class="font-label-sm text-label-sm text-error bg-error/10 px-2 py-1 rounded-md flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">trending_up</span> +2 dr bulan lalu
                        </span>
</div>
</div>
<!-- Stat 4 -->
<div class="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 hover:scale-[1.02] transition-transform duration-300">
<div class="flex items-center gap-3 mb-4">
<div class="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary-container">
<span class="material-symbols-outlined">event_busy</span>
</div>
<h3 class="font-title-md text-title-md text-on-surface-variant">Kontrak &lt;30hr</h3>
</div>
<div class="flex items-baseline gap-3">
<span class="font-display-lg text-display-lg text-tertiary-container counter-value" data-target="3">3</span>
<span class="font-label-sm text-label-sm text-tertiary-container bg-tertiary-container/10 px-2 py-1 rounded-md">
                            Perlu tindak lanjut
                        </span>
</div>
</div>
</div>
<!-- Action Bar -->
<div class="flex flex-wrap items-center justify-between gap-4 fade-in-up stagger-2 bg-surface-container p-4 rounded-xl border border-outline-variant/30">
<div class="relative w-full max-w-md">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full bg-surface border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md placeholder:text-on-surface-variant/50" id="searchInput" placeholder="Cari penghuni atau kamar..." type="text">
</div>
<div class="flex items-center gap-3">
<span class="font-label-lg text-label-lg text-on-surface-variant">Filter:</span>
<select class="bg-surface border border-outline-variant rounded-lg py-2 pl-4 pr-10 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none font-body-md cursor-pointer" id="statusFilter">
<option value="all">Semua Status</option>
<option value="paid">Sudah Bayar</option>
<option value="unpaid">Belum Bayar</option>
<option value="warning">Hampir Habis</option>
</select>
</div>
</div>
<!-- Main Data Table -->
<div class="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden fade-in-up stagger-3 shadow-lg">
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse" id="tenantTable">
<thead>
<tr class="bg-surface-container-high border-b border-outline-variant/30">
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-10"></th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tenant</th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Kamar</th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Check-in</th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sisa Kontrak</th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
<th class="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/20">
<!-- ROW 1 (Normal) -->
<tr class="hover:bg-surface-container-high/50 transition-colors group cursor-pointer" data-status="paid">
<td class="p-4 text-center">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
</td>
<td class="p-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-lg">SW</div>
<div>
<p class="font-title-md text-title-md text-on-surface">Sarah Wijaya</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">T-84920</p>
</div>
</div>
</td>
<td class="p-4 font-body-md text-on-surface">Room A-102</td>
<td class="p-4 font-body-md text-on-surface-variant">12 Aug 2023</td>
<td class="p-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> 8 Bulan
                                    </span>
</td>
<td class="p-4">
<span class="inline-flex items-center gap-1.5 text-on-surface font-label-sm">
<span class="w-2 h-2 rounded-full bg-secondary"></span> Paid
                                    </span>
</td>
<td class="p-4 text-right">
<button class="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors" title="More options">
<span class="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
<!-- ROW 2 (Expanded / Unpaid Warning) -->
<tr class="group cursor-pointer border-l-4 border-error bg-surface-container-high/30" data-status="unpaid" id="row-budi" onclick="toggleRow('budi')">
<td class="p-4 text-center">
<span class="material-symbols-outlined text-primary transition-transform duration-300 rotate-180" id="icon-budi">expand_more</span>
</td>
<td class="p-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-error-container/30 flex items-center justify-center text-error font-label-lg border border-error/20">BS</div>
<div>
<p class="font-title-md text-title-md text-on-surface">Budi Santoso</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">T-84921</p>
</div>
</div>
</td>
<td class="p-4 font-body-md text-on-surface">Room B-205</td>
<td class="p-4 font-body-md text-on-surface-variant">01 Sep 2023</td>
<td class="p-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary-container font-label-sm">
<span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> 3 Bulan
                                    </span>
</td>
<td class="p-4" id="status-cell-budi">
<span class="inline-flex items-center gap-1.5 text-on-surface font-label-sm">
<span class="w-2 h-2 rounded-full bg-error"></span> Unpaid
                                    </span>
</td>
<td class="p-4 text-right" onclick="event.stopPropagation();">
<button class="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
<!-- Expanded Detail Row 2 -->
<tr class="bg-surface-container-low border-b-0 border-l-4 border-error" id="expand-budi">
<td class="p-0" colspan="7">
<div class="expandable-row-content expanded" id="content-budi">
<div class="expandable-inner p-6">
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-surface-container rounded-xl p-6 border border-outline-variant/20 shadow-inner">
<!-- Panel 1: Contact -->
<div class="flex flex-col gap-4">
<h4 class="font-title-md text-title-md text-on-surface-variant flex items-center gap-2 border-b border-outline-variant/20 pb-2">
<span class="material-symbols-outlined text-[18px]">contact_emergency</span> Emergency Contact
                                                    </h4>
<div class="font-body-md text-on-surface space-y-2">
<p class=""><span class="text-on-surface-variant">Nama:</span> Siti Santoso (Mother)</p>
<p class=""><span class="text-on-surface-variant">Phone:</span> +62 812-9876-5432</p>
<p class=""><span class="text-on-surface-variant">Alamat:</span> Jl. Merdeka No.45, Jakarta</p>
</div>
</div>
<!-- Panel 2: Contract -->
<div class="flex flex-col gap-4">
<h4 class="font-title-md text-title-md text-on-surface-variant flex items-center gap-2 border-b border-outline-variant/20 pb-2">
<span class="material-symbols-outlined text-[18px]">description</span> Contract Info
                                                    </h4>
<div class="font-body-md text-on-surface space-y-2">
<p class=""><span class="text-on-surface-variant">Durasi:</span> 12 Bulan</p>
<p class=""><span class="text-on-surface-variant">Berakhir:</span> 01 Sep 2024</p>
<p class=""><span class="text-on-surface-variant">Deposit:</span> Rp 2.500.000</p>
</div>
<div class="flex gap-3 mt-auto pt-2">
<button class="px-3 py-1.5 border border-outline-variant rounded-md text-on-surface font-label-sm hover:bg-surface-variant transition-colors flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">visibility</span> Lihat Dokumen
                                                        </button>
<button class="px-3 py-1.5 border border-error text-error rounded-md font-label-sm hover:bg-error/10 transition-colors flex items-center gap-1" onclick="sendReminder(event)">
<span class="material-symbols-outlined text-[16px]">notifications_active</span> Kirim Reminder
                                                        </button>
</div>
</div>
<!-- Panel 3: Billing -->
<div class="flex flex-col gap-4 bg-error-container/5 rounded-lg p-4 border border-error/10">
<div class="flex items-center justify-between">
<h4 class="font-title-md text-title-md text-error flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">receipt_long</span> Tagihan Aktif
                                                        </h4>
<span class="bg-error text-on-error px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Belum Bayar</span>
</div>
<div class="font-body-md space-y-1">
<p class="text-on-surface-variant">Periode: <span class="text-on-surface font-medium">May 2024</span></p>
<p class="text-on-surface-variant">Total: <span class="text-error font-headline-sm">Rp 1.800.000</span></p>
<p class="text-error font-bold mt-2 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">schedule</span> Jatuh tempo 5 hari lalu
                                                        </p>
</div>
<button class="mt-auto w-full bg-primary text-on-primary py-2 rounded-md font-label-lg hover:bg-primary/90 transition-all active:scale-95 flex justify-center items-center gap-2 shadow-sm" id="btn-lunas" onclick="markPaid(event)">
<span class="material-symbols-outlined text-[18px]">check_circle</span> Tandai Lunas
                                                    </button>
</div>
</div>
</div>
</div>
</td>
</tr>
<!-- ROW 3 (Normal) -->
<tr class="hover:bg-surface-container-high/50 transition-colors group cursor-pointer border-b-transparent" data-status="warning">
<td class="p-4 text-center">
<span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">expand_more</span>
</td>
<td class="p-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-lg">AP</div>
<div>
<p class="font-title-md text-title-md text-on-surface">Andi Pratama</p>
<p class="font-label-sm text-label-sm text-on-surface-variant">T-84922</p>
</div>
</div>
</td>
<td class="p-4 font-body-md text-on-surface">Room C-310</td>
<td class="p-4 font-body-md text-on-surface-variant">10 Jun 2023</td>
<td class="p-4">
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary-container font-label-sm border border-tertiary-container/30">
<span class="material-symbols-outlined text-[14px]">timer</span> 29 Hari
                                    </span>
</td>
<td class="p-4">
<span class="inline-flex items-center gap-1.5 text-on-surface font-label-sm">
<span class="w-2 h-2 rounded-full bg-secondary"></span> Paid
                                    </span>
</td>
<td class="p-4 text-right">
<button class="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors">
<span class="material-symbols-outlined text-[20px]">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</main>
<!-- TOAST NOTIFICATION -->
<div class="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 pointer-events-none" id="toast">
<span class="material-symbols-outlined text-secondary">check_circle</span>
<span class="font-body-md text-body-md" id="toast-msg">Reminder berhasil dikirim.</span>
</div>
<!-- SCRIPTS -->
<script>
        // Counter Animation
        document.addEventListener('DOMContentLoaded', () => {
            const counters = document.querySelectorAll('.counter-value');
            const speed = 800; // ms

            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const inc = target / (speed / 16); // 60fps
                let count = 0;

                const updateCount = () => {
                    count += inc;
                    if (count < target) {
                        counter.innerText = Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
            });
        });

        // Toggle Row Expansion
        function toggleRow(id) {
            const content = document.getElementById(`content-${id}`);
            const icon = document.getElementById(`icon-${id}`);
            
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                icon.classList.remove('rotate-180');
            } else {
                content.classList.add('expanded');
                icon.classList.add('rotate-180');
            }
        }

        // Mark Paid Action
        function markPaid(event) {
            event.stopPropagation();
            const btn = document.getElementById('btn-lunas');
            const row = document.getElementById('row-budi');
            const expandRow = document.getElementById('expand-budi');
            const statusCell = document.getElementById('status-cell-budi');

            // Button state
            btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done_all</span> Lunas`;
            btn.classList.remove('bg-primary', 'hover:bg-primary/90');
            btn.classList.add('bg-surface-variant', 'text-on-surface-variant', 'cursor-not-allowed', 'opacity-50');
            btn.disabled = true;

            // Row styling transition
            row.style.transition = "all 0.4s ease";
            expandRow.style.transition = "border-color 0.4s ease";
            
            row.classList.remove('border-error', 'bg-surface-container-high/30');
            row.classList.add('border-transparent');
            expandRow.classList.remove('border-error');
            expandRow.classList.add('border-transparent');
            
            row.setAttribute('data-status', 'paid');

            // Status Cell Update
            statusCell.innerHTML = `
                <span class="inline-flex items-center gap-1.5 text-on-surface font-label-sm fade-in-up">
                    <span class="w-2 h-2 rounded-full bg-secondary"></span> Paid
                </span>
            `;

            showToast("Pembayaran Budi Santoso ditandai lunas.");
        }

        // Send Reminder Action
        function sendReminder(event) {
            event.stopPropagation();
            showToast("Reminder berhasil dikirim ke Budi Santoso");
        }

        // Toast Logic
        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').innerText = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }

        // Notification Dropdown Toggle
        const notifBtn = document.getElementById('notif-btn');
        const notifDropdown = document.getElementById('notif-dropdown');
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            notifDropdown.classList.toggle('flex');
        });
        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.add('hidden');
                notifDropdown.classList.remove('flex');
            }
        });

        // Search Filter
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const tableBody = document.querySelector('#tenantTable tbody');
        const rows = tableBody.querySelectorAll('tr[data-status]');

        function filterTable() {
            const searchTerm = searchInput.value.toLowerCase();
            const statusTerm = statusFilter.value;

            rows.forEach(row => {
                // Determine logic for expandable rows vs normal rows
                const textContent = row.innerText.toLowerCase();
                const rowStatus = row.getAttribute('data-status');
                
                const matchesSearch = textContent.includes(searchTerm);
                const matchesStatus = statusTerm === 'all' || rowStatus === statusTerm;

                if (matchesSearch && matchesStatus) {
                    row.style.display = '';
                    // If it's Budi's row, also show the expanded section container if it was open, 
                    // but for simplicity we'll just link visibility
                    if(row.id === 'row-budi') {
                        document.getElementById('expand-budi').style.display = '';
                    }
                } else {
                    row.style.display = 'none';
                    if(row.id === 'row-budi') {
                        document.getElementById('expand-budi').style.display = 'none';
                        // Collapse it visually so it doesn't break layout when reappearing
                        document.getElementById('content-budi').classList.remove('expanded');
                        document.getElementById('icon-budi').classList.remove('rotate-180');
                    }
                }
            });
        }

        searchInput.addEventListener('keyup', filterTable);
        statusFilter.addEventListener('change', filterTable);

    </script>


</body></html>