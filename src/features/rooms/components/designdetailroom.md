\<!DOCTYPE html>\<html class="dark" lang="id">\<head>  
\<meta charset="utf-8">  
\<meta content="width=device-width, initial-scale=1.0" name="viewport">  
\<title>Smartkost Immersive Room & Environment Detail\</title>  
\<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries">\</script>  
\<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">  
\<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">  
\<script id="tailwind-config">  
       tailwind.config = {  
           darkMode: "class",  
           theme: {  
               extend: {  
                   colors: {  
                       "primary": "#6cf20d",  
                       "cyber-blue": "#00d4ff",  
                       "background-light": "#f7f8f5",  
                       "background-dark": "#0a0a0a",  
                   },  
                   fontFamily: {  
                       "display": \["Plus Jakarta Sans", "sans-serif"\]  
                   },  
                   borderRadius: {  
                       "DEFAULT": "1rem",  
                       "lg": "2rem",  
                       "xl": "3rem",  
                       "full": "9999px"  
                   },  
               },  
           },  
       }  
   \</script>  
\<style type="text/tailwindcss">  
       .glass-card {  
           background: rgba(255, 255, 255, 0.03);  
           backdrop-filter: blur(12px);  
           border: 1px solid rgba(255, 255, 255, 0.1);  
       }  
       .neon-glow-lime {  
           box-shadow: 0 0 20px rgba(108, 242, 13, 0.3);  
       }  
       .cyber-gradient-bg {  
           background: radial-gradient(circle at top right, rgba(108, 242, 13, 0.15), transparent 40%),  
                       radial-gradient(circle at bottom left, rgba(0, 212, 255, 0.1), transparent 40%);  
       }  
       .hide-scrollbar::-webkit-scrollbar {  
           display: none;  
       }  
       .hide-scrollbar {  
           -ms-overflow-style: none;  
           scrollbar-width: none;  
       }  
   \</style>  
\</head>  
\<body class="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white min-h-screen overflow-x-hidden">  
\<div class="relative flex min-h-screen w-full flex-col cyber-gradient-bg">  
\<div class="px-4 md:px-40 flex justify-center py-5">  
\<div class="layout-content-container flex flex-col w-full max-w-\[960px\] flex-1">  
\<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-6 py-3 glass-card rounded-full">  
\<div class="flex items-center gap-4">  
\<div class="size-8 text-primary">  
\<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">  
\<path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor">\</path>  
\</svg>  
\</div>  
\<h2 class="text-white text-xl font-extrabold leading-tight tracking-tight">Smartkost\</h2>  
\</div>  
\<button class="flex items-center justify-center rounded-full size-10 bg-white/10 hover:bg-white/20 text-white transition-all">  
\<span class="material-symbols-outlined">close\</span>  
\</button>  
\</header>  
\</div>  
\</div>  
\<main class="px-4 md:px-40 flex flex-1 justify-center py-5">  
\<div class="layout-content-container flex flex-col max-w-\[960px\] w-full gap-6">  
\<div class="@container w-full">  
\<div class="relative group">  
\<div class="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-background-dark rounded-xl md:rounded-3xl min-h-\[450px\] border border-white/5 shadow-2xl transition-all duration-500" id="main-360-viewer" style="background-image: linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 40%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCQh-c4KNk-Q8dxotDxJP3vMczNK50U6tTFgeaPsxXst4BaKvKR6je0mxZaFJsd7hz-JgtqvjYbunwmSzfdWW7q-uL2-NtMKJoj8nYln7gMVDA8iIb_3hMNHHkCtm4fG4zRH3I_s19HROi1IIonb2YA4X7lHpyz957txwdpVzFnRI69hKOwjPDltSZyhkes4-5GFIU84UMJNBWvBolorYqUbPrGlGJvgmnYTJcwPlX22-bdgdTmdRtWODEqZhUiYGoD2t8R9UcYItw");">  
\<div class="flex p-6 md:p-10 flex-col items-start gap-2">  
\<div class="flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 animate-pulse">  
\<span class="material-symbols-outlined text-primary text-xl">pan\_tool\_alt\</span>  
\<p class="text-white tracking-wide text-lg font-bold uppercase">Geser untuk 360° View\</p>  
\</div>  
\</div>  
\</div>  
\<div class="absolute top-6 right-6 glass-card px-6 py-3 rounded-full border-primary/40 neon-glow-lime">  
\<p class="text-primary text-lg md:text-2xl font-black tracking-tighter">IDR 1.2 JUTA / BLN\</p>  
\</div>  
\</div>  
\</div>  
\<div class="flex flex-col gap-4 px-2">  
\<div class="flex items-center justify-between">  
\<h3 class="text-white/60 text-xs font-black tracking-\[0.2em\] uppercase">Jelajah Lingkungan\</h3>  
\<div class="h-px flex-1 bg-white/10 ml-4">\</div>  
\</div>  
\<div class="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">  
\<button class="flex-none w-48 group snap-start" onclick="document.getElementById('main-360-viewer').style.backgroundImage = 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 40%), url(https://lh3.googleusercontent.com/aida-public/AB6AXuCQh-c4KNk-Q8dxotDxJP3vMczNK50U6tTFgeaPsxXst4BaKvKR6je0mxZaFJsd7hz-JgtqvjYbunwmSzfdWW7q-uL2-NtMKJoj8nYln7gMVDA8iIb_3hMNHHkCtm4fG4zRH3I_s19HROi1IIonb2YA4X7lHpyz957txwdpVzFnRI69hKOwjPDltSZyhkes4-5GFIU84UMJNBWvBolorYqUbPrGlGJvgmnYTJcwPlX22-bdgdTmdRtWODEqZhUiYGoD2t8R9UcYItw)'">  
\<div class="relative h-32 w-full rounded-2xl overflow-hidden border-2 border-primary ring-4 ring-primary/20 transition-all">  
\<img alt="Kamar Utama" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQh-c4KNk-Q8dxotDxJP3vMczNK50U6tTFgeaPsxXst4BaKvKR6je0mxZaFJsd7hz-JgtqvjYbunwmSzfdWW7q-uL2-NtMKJoj8nYln7gMVDA8iIb_3hMNHHkCtm4fG4zRH3I_s19HROi1IIonb2YA4X7lHpyz957txwdpVzFnRI69hKOwjPDltSZyhkes4-5GFIU84UMJNBWvBolorYqUbPrGlGJvgmnYTJcwPlX22-bdgdTmdRtWODEqZhUiYGoD2t8R9UcYItw">  
\<div class="absolute inset-0 bg-black/40 flex items-center justify-center">  
\<span class="bg-primary text-black text-\[10px\] font-black px-2 py-1 rounded-full flex items-center gap-1">  
\<span class="material-symbols-outlined text-xs">360\</span> VIEW  
                                   \</span>  
\</div>  
\</div>  
\<p class="mt-2 text-primary text-xs font-bold uppercase text-center tracking-wider">Kamar A-04\</p>  
\</button>  
\<button class="flex-none w-48 group snap-start" onclick="document.getElementById('main-360-viewer').style.backgroundImage = 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 40%), url(https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=2000&auto=format&fit=crop)'">  
\<div class="relative h-32 w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">  
\<img alt="Akses Jalan" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD_m8lIzjPVKrUCAhKfJIwX1wiSk_nRe28hUYWNsbvC3Sw7szIlHeixJOOwDFIjRvBIlgXwoCPpRRhLT4t3H6WMzBmQis0vFJj6rXwJ7gvH2s3YoxuYGpk166XGlIzfsmMBOuxufijHe5ywp6Nwtk29wV8F4MUCOkEjpzQhRPIIYvAiuQjzal3SFqwFjkpTU6YOQzw5qR553flQc7PYFtFwsNRdU3ZkJ0bhLZbC8rRtG47_U9nJC0-uyBAnOJ8oEvmFzJlETeybEo">  
\<div class="absolute top-2 right-2">  
\<span class="bg-black/60 backdrop-blur-md text-white text-\[10px\] font-black px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">  
\<span class="material-symbols-outlined text-xs">360\</span>  
\</span>  
\</div>  
\</div>  
\<p class="mt-2 text-white/40 group-hover:text-primary text-xs font-bold uppercase text-center tracking-wider transition-colors">Akses Jalan\</p>  
\</button>  
\<button class="flex-none w-48 group snap-start" onclick="document.getElementById('main-360-viewer').style.backgroundImage = 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 40%), url(https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=2000&auto=format&fit=crop)'">  
\<div class="relative h-32 w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">  
\<img alt="Area Parkir" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwOAmfnge7WSNJwO9OTNA1JLi9YhLLrYQfkWeIpvlOpEPXUrICCJph_IY4cLLbOC-3kq0bvyDefAzMKaNPOk2bMraq_cDzqdSEFjwuq50Sk-F5Fd_AYT7Oxb02oEZC5TEQ01KawNcML0h9KpOEJNqrMdvmkfp4XmndSBTpI9sYl_fa1uyPno5-vWkRiYKpMKjEEqk3S7g6zCkBqVL8vcfd33Er51wY1NrDLKB4DkrFddkFyzc5zyvubizvRJ-ZlQQmQvxYKLgoxnc">  
\<div class="absolute top-2 right-2">  
\<span class="bg-black/60 backdrop-blur-md text-white text-\[10px\] font-black px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">  
\<span class="material-symbols-outlined text-xs">360\</span>  
\</span>  
\</div>  
\</div>  
\<p class="mt-2 text-white/40 group-hover:text-primary text-xs font-bold uppercase text-center tracking-wider transition-colors">Area Parkir\</p>  
\</button>  
\<button class="flex-none w-48 group snap-start" onclick="document.getElementById('main-360-viewer').style.backgroundImage = 'linear-gradient(to top, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 40%), url(https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=2000&auto=format&fit=crop)'">  
\<div class="relative h-32 w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">  
\<img alt="Ruang Komunal" class="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBo5Rh0V4jaT46WHP_zh4pPKkWVq_Gbb5VA1WO1Smq0f8_o7fr_VH8V_AaLsA1Sm0532HvJKAvVPQ8SXLLnDUuX8H7Lty7ibaByEsBoHKrgxFQWgfe5hrvXPyeVMkNNqq7tzQp5mBpGbeem7D4V7jpgQjGNICRZVxFfG5eT4rKbuqpVRd6EYvQH31CM1z-KCjcken4VZp7pnxllPiH-b4j_EgsPdTstR4o2Ttjst-rl5rWVshz_BVYAVLmMJhXGIhf-PiVaRcznPSE">  
\<div class="absolute top-2 right-2">  
\<span class="bg-black/60 backdrop-blur-md text-white text-\[10px\] font-black px-2 py-1 rounded-full flex items-center gap-1 border border-white/10">  
\<span class="material-symbols-outlined text-xs">360\</span>  
\</span>  
\</div>  
\</div>  
\<p class="mt-2 text-white/40 group-hover:text-primary text-xs font-bold uppercase text-center tracking-wider transition-colors">Ruang Komunal\</p>  
\</button>  
\</div>  
\</div>  
\<div class="flex flex-col gap-2">  
\<div class="flex items-center gap-3 px-4">  
\<span class="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">TERSEDIA\</span>  
\<span class="text-white/40 text-sm font-medium">Lantai 2 • Unit Hook\</span>  
\</div>  
\<h1 class="text-white tracking-tighter text-4xl md:text-6xl font-extrabold leading-tight px-4 text-left uppercase">  
                       Kamar A-04 \<span class="text-primary italic">(LT.2)\</span>  
\</h1>  
\</div>  
\<div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">  
\<div class="glass-card flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer group">  
\<div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">  
\<span class="material-symbols-outlined text-3xl">bolt\</span>  
\</div>  
\<p class="text-white text-sm font-bold leading-normal text-center">1300 VA Token\</p>  
\</div>  
\<div class="glass-card flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer group">  
\<div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">  
\<span class="material-symbols-outlined text-3xl">shower\</span>  
\</div>  
\<p class="text-white text-sm font-bold leading-normal text-center">Kamar Mandi Dalam\</p>  
\</div>  
\<div class="glass-card flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer group">  
\<div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">  
\<span class="material-symbols-outlined text-3xl">wifi\</span>  
\</div>  
\<p class="text-white text-sm font-bold leading-normal text-center">50 Mbps WiFi\</p>  
\</div>  
\<div class="glass-card flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-white/10 hover:border-primary/50 transition-all hover:bg-primary/5 cursor-pointer group">  
\<div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">  
\<span class="material-symbols-outlined text-3xl">bed\</span>  
\</div>  
\<p class="text-white text-sm font-bold leading-normal text-center">Full Furnished\</p>  
\</div>  
\</div>  
\<div class="p-4 pt-4 pb-20">  
\<button class="relative w-full h-20 rounded-full flex items-center justify-center gap-3 text-background-dark font-black text-xl md:text-2xl tracking-tight transition-all active:scale-95 overflow-hidden group">  
\<div class="absolute inset-0 bg-gradient-to-r from-primary via-\[#a3ff52\] to-cyber-blue group-hover:opacity-90 transition-opacity">\</div>  
\<div class="absolute inset-0 opacity-50 blur-2xl bg-gradient-to-r from-primary to-cyber-blue scale-110">\</div>  
\<span class="relative z-10">AMANKAN KAMAR INI\</span>  
\<span class="relative z-10 text-2xl group-hover:translate-x-2 transition-transform">🚀\</span>  
\</button>  
\<div class="flex justify-center mt-6 gap-6">  
\<div class="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-widest">  
\<span class="material-symbols-outlined text-sm">verified\_user\</span>  
                           Verified Listing  
                       \</div>  
\<div class="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-widest">  
\<span class="material-symbols-outlined text-sm">schedule\</span>  
                           Update 2h ago  
                       \</div>  
\</div>  
\</div>  
\</div>  
\</main>  
\<div class="fixed top-1/4 -left-20 size-80 bg-primary/10 blur-\[100px\] pointer-events-none">\</div>  
\<div class="fixed bottom-1/4 -right-20 size-80 bg-cyber-blue/10 blur-\[100px\] pointer-events-none">\</div>  
\</div>

\</body>\</html>s