# -*- coding: utf-8 -*-
"""
Kivo AI — Full Live Demo Polish & Interactive Upgrade
"""

with open('d:/ElderCare/scratch/build_kivo_site.py', 'w', encoding='utf-8') as f:
    f.write('''# -*- coding: utf-8 -*-
"""
Kivo AI — Full Production Redesign Generator
Pass 1 Visual System + Pass 2 Advanced Interactive Live Demo Engine
"""
import os

def generate_html():
    return """<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kivo — You Speak. Kivo Clicks. | Autonomous AI Digital Caretaker</title>
  
  <!-- Modern Accessible Typography: Inter, Space Grotesk, JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            display: ['"Space Grotesk"', '-apple-system', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            kivo: {
              bg: '#F5F8FA',
              bgHero: '#F5F9FA',
              bgAlt: '#EEF3F6',
              bgDemo: '#F7FAFB',
              bgArch: '#EDF3F5',
              surface: '#FFFFFF',
              surfaceElevated: '#F8FAFB',
              surfacePanel: '#F1F5F7',
              surfaceDark: '#07151A',
              border: '#D7E0E6',
              borderLight: 'rgba(15, 30, 45, 0.08)',
              borderFocus: '#16C7BD',
              teal: '#16C7BD',
              tealDark: '#0D9488',
              tealLight: 'rgba(22, 199, 189, 0.12)',
              cyan: '#08BBD0',
              text: '#0B1424',
              textSecondary: '#334155',
              textMuted: '#64748B',
              textSubtle: '#94A3B8',
              success: '#16A97A',
              warning: '#D89A24',
              error: '#D95C5C',
            }
          },
          boxShadow: {
            'kivo-sm': '0 2px 8px rgba(15, 30, 45, 0.04)',
            'kivo-md': '0 8px 24px rgba(15, 30, 45, 0.06)',
            'kivo-lg': '0 16px 40px rgba(15, 30, 45, 0.08)',
            'kivo-teal': '0 8px 30px rgba(22, 199, 189, 0.20)',
            'kivo-glow': '0 0 35px rgba(22, 199, 189, 0.15)',
          },
          borderRadius: {
            '2xl': '20px',
            '3xl': '24px',
            '4xl': '28px',
          }
        }
      }
    }
  </script>

  <style>
    :root {
      --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
      
      --dur-fast: 150ms;
      --dur-standard: 250ms;
      --dur-medium: 400ms;
      --dur-emphasis: 600ms;

      --kivo-bg: #F5F8FA;
      --kivo-card: #FFFFFF;
      --kivo-surface: #F8FAFB;
      --kivo-panel: #F1F5F7;
      --kivo-text: #0B1424;
      --kivo-text-sec: #334155;
      --kivo-text-muted: #64748B;
      --kivo-border: #D7E0E6;
      --kivo-teal: #16C7BD;
      --kivo-cyan: #08BBD0;
    }

    * {
      transition: background-color var(--dur-standard) var(--ease-smooth),
                  border-color var(--dur-standard) var(--ease-smooth),
                  color var(--dur-standard) var(--ease-smooth);
    }

    body {
      background-color: #F5F8FA;
      color: #0B1424;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      line-height: 1.6;
    }

    .kivo-card {
      background-color: #FFFFFF;
      border: 1px solid #D7E0E6;
      border-radius: 24px;
      box-shadow: 0 8px 24px rgba(15, 30, 45, 0.05);
      transition: transform var(--dur-standard) var(--ease-out-quint),
                  box-shadow var(--dur-standard) var(--ease-out-quint),
                  border-color var(--dur-standard) var(--ease-out-quint);
    }
    .kivo-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 32px rgba(15, 30, 45, 0.08);
      border-color: rgba(22, 199, 189, 0.4);
    }

    .kivo-panel {
      background-color: #F1F5F7;
      border: 1px solid #D7E0E6;
      border-radius: 20px;
    }

    .nav-scrolled {
      background: rgba(245, 248, 250, 0.92) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-bottom: 1px solid #D7E0E6 !important;
      box-shadow: 0 4px 20px rgba(15, 30, 45, 0.05) !important;
    }

    .hero-ambient-glow {
      background: radial-gradient(circle at 50% 30%, rgba(22, 199, 189, 0.12) 0%, rgba(8, 187, 208, 0.06) 45%, transparent 70%);
      animation: ambientGlowPulse 12s ease-in-out infinite alternate;
    }
    @keyframes ambientGlowPulse {
      0% { transform: scale(1) translateY(0); opacity: 0.8; }
      100% { transform: scale(1.12) translateY(-15px); opacity: 1; }
    }

    .gradient-text-accent {
      background: linear-gradient(135deg, #0D9488 0%, #16C7BD 35%, #08BBD0 70%, #16A97A 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: heroGradientShift 8s ease infinite;
    }
    @keyframes heroGradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .cta-press {
      transition: transform var(--dur-fast) var(--ease-spring),
                  box-shadow var(--dur-fast) var(--ease-smooth),
                  opacity var(--dur-fast) var(--ease-smooth);
    }
    .cta-press:hover {
      transform: translateY(-2px);
    }
    .cta-press:active {
      transform: scale(0.97) translateY(0);
    }

    .hero-title-clamp {
      font-size: clamp(40px, 6.2vw, 76px);
      line-height: 1.08;
      letter-spacing: -0.035em;
    }

    .section-title-clamp {
      font-size: clamp(28px, 4vw, 48px);
      line-height: 1.15;
      letter-spacing: -0.025em;
    }

    /* Soundwave bars */
    @keyframes soundWavePulse {
      0%, 100% { height: 6px; opacity: 0.45; transform: scaleY(0.4); }
      50% { height: 32px; opacity: 1; transform: scaleY(1); filter: drop-shadow(0 0 6px rgba(22, 199, 189, 0.7)); }
    }
    .sound-wave-animating {
      animation: soundWavePulse 0.75s ease-in-out infinite alternate;
    }
    .sound-wave-bar:nth-child(1) { animation-delay: 0.05s; }
    .sound-wave-bar:nth-child(2) { animation-delay: 0.2s; }
    .sound-wave-bar:nth-child(3) { animation-delay: 0.35s; }
    .sound-wave-bar:nth-child(4) { animation-delay: 0.5s; }
    .sound-wave-bar:nth-child(5) { animation-delay: 0.15s; }
    .sound-wave-bar:nth-child(6) { animation-delay: 0.3s; }
    .sound-wave-bar:nth-child(7) { animation-delay: 0.45s; }
    .sound-wave-bar:nth-child(8) { animation-delay: 0.25s; }
    .sound-wave-bar:nth-child(9) { animation-delay: 0.4s; }
    .sound-wave-bar:nth-child(10) { animation-delay: 0.1s; }
    .sound-wave-bar:nth-child(11) { animation-delay: 0.55s; }
    .sound-wave-bar:nth-child(12) { animation-delay: 0.3s; }
    .sound-wave-bar:nth-child(13) { animation-delay: 0.15s; }
    .sound-wave-bar:nth-child(14) { animation-delay: 0.45s; }
    .sound-wave-bar:nth-child(15) { animation-delay: 0.25s; }
    .sound-wave-bar:nth-child(16) { animation-delay: 0.1s; }

    /* AI Cursor Physics */
    #live-ai-cursor {
      transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes clickRipple {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.6); opacity: 0; }
    }
    .cursor-ripple {
      animation: clickRipple 0.5s ease-out forwards;
    }

    /* Modal Display */
    body.senior-mode-active #standard-experience { display: none !important; }
    body.senior-mode-active #senior-experience { display: block !important; }
    #senior-experience { display: none; }

    body.auth-mode-active #account-experience { display: flex !important; }
    #account-experience { display: none; }
    .profile-modal-hidden { display: none !important; }
    .profile-modal-visible { display: flex !important; }

    .dropdown-hidden { display: none !important; }
    .dropdown-visible { display: block !important; }

    /* Stage Progress Pill */
    .stage-pill-active {
      background-color: #16C7BD !important;
      color: #07151A !important;
      border-color: #16C7BD !important;
      font-weight: 800 !important;
      box-shadow: 0 4px 14px rgba(22, 199, 189, 0.3) !important;
    }
    .stage-pill-completed {
      background-color: rgba(22, 169, 122, 0.15) !important;
      color: #16A97A !important;
      border-color: rgba(22, 169, 122, 0.3) !important;
      font-weight: 700 !important;
    }
    .stage-pill-pending {
      background-color: #FFFFFF !important;
      color: #64748B !important;
      border-color: #D7E0E6 !important;
    }

    @media (prefers-reduced-motion: reduce) {
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      .gradient-text-accent { animation: none !important; }
      .sound-wave-animating { animation: none !important; }
      .hero-ambient-glow { animation: none !important; }
    }
  </style>
</head>
<body class="antialiased selection:bg-kivo-teal/20 selection:text-kivo-tealDark">

  <!-- MAIN KIVO EXPERIENCE -->
  <div id="standard-experience">

    <!-- 1. STICKY GLASS NAVBAR -->
    <header id="main-navbar" class="fixed top-0 inset-x-0 z-40 bg-kivo-bg/85 backdrop-blur-xl border-b border-kivo-border transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        <a href="#" class="flex items-center gap-3 group cta-press" aria-label="Kivo Home">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[2px] shadow-kivo-sm transition-transform duration-300 group-hover:scale-105">
            <div class="w-full h-full bg-kivo-surface rounded-[18px] flex items-center justify-center">
              <svg class="w-5 h-5 text-kivo-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="9.5" r="3.2" />
                <path d="M5.5 9.5a6.5 6.5 0 0 0 13 0" />
                <path d="M12 16v3.5" />
                <path d="M8.5 19.5h7" />
              </svg>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold font-display tracking-tight text-kivo-text leading-tight group-hover:text-kivo-tealDark transition-colors">Kivo</span>
            <span class="text-[11px] font-medium text-kivo-textMuted tracking-tight -mt-0.5">You Speak. Kivo Clicks.</span>
          </div>
        </a>

        <nav class="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-kivo-surfacePanel border border-kivo-border text-xs font-semibold text-kivo-textSecondary" role="navigation">
          <a href="#live-demo" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Live Simulator</a>
          <a href="#architecture" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Amazon Nova</a>
          <a href="#pillars" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Four Pillars</a>
          <a href="#comparison" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Old vs Kivo</a>
          <a href="#calculator" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">ROI Calculator</a>
          <a href="#pricing" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Pricing</a>
        </nav>

        <div class="flex items-center gap-2.5">
          <button onclick="toggleSeniorMode()" id="nav-senior-btn" class="min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-kivo-surfaceElevated border border-kivo-border text-kivo-textSecondary hover:text-kivo-text hover:border-kivo-teal/60 transition-all flex items-center gap-1.5 cta-press shadow-kivo-sm" aria-label="Toggle Senior Accessibility View">
            <span class="text-sm">👓</span>
            <span id="nav-senior-label" class="hidden sm:inline">Senior Mode</span>
          </button>

          <!-- Logged out -->
          <div id="nav-logged-out" class="flex items-center gap-2">
            <button onclick="openAuth('signin')" class="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-kivo-textSecondary hover:text-kivo-tealDark hover:bg-kivo-surfacePanel transition-colors cta-press">
              Sign In
            </button>
            <button onclick="scrollToLiveDemo()" class="min-h-[40px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-xs shadow-kivo-sm transition-all flex items-center justify-center gap-1.5 cta-press">
              <span>Try Kivo Live</span>
              <span class="text-xs">→</span>
            </button>
          </div>

          <!-- Logged in -->
          <div id="nav-logged-in" class="hidden items-center gap-2 sm:gap-3">
            <button onclick="openNotificationsModal()" id="btn-nav-notifs" class="relative min-h-[40px] w-10 flex items-center justify-center rounded-xl bg-white border border-kivo-border text-kivo-textSecondary hover:text-kivo-tealDark transition-all cta-press shadow-kivo-sm">
              <span class="text-base">🔔</span>
              <span id="nav-notif-dot" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-kivo-teal animate-pulse"></span>
            </button>

            <button onclick="openUpgradeModal()" id="btn-nav-upgrade" class="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-kivo-sm transition-all flex items-center gap-1.5 cta-press">
              <span>✨</span>
              <span id="nav-upgrade-label">Upgrade</span>
            </button>
            <div id="nav-pro-badge" class="hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-mono font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>KIVO PRO</span>
            </div>

            <div class="relative">
              <button onclick="toggleProfileDropdown(event)" id="btn-profile-trigger" class="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal flex items-center gap-2.5 transition-all cta-press shadow-kivo-sm" aria-expanded="false" aria-haspopup="true">
                <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[1.5px] flex items-center justify-center shadow-sm">
                  <div class="w-full h-full bg-kivo-surfaceDark rounded-full flex items-center justify-center text-white text-[11px] font-bold font-mono" id="nav-avatar-initials">
                    VK
                  </div>
                </div>
                <span class="text-xs font-bold text-kivo-text max-w-[90px] truncate" id="nav-profile-firstname">Vishal</span>
                <span class="text-[10px] text-kivo-textMuted" id="nav-profile-chevron">▼</span>
              </button>

              <div id="nav-profile-dropdown" class="dropdown-hidden absolute right-0 mt-2 w-80 sm:w-88 rounded-3xl bg-white border border-kivo-border shadow-kivo-lg p-3 z-50 transition-all duration-200" role="menu">
                <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border mb-2 flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[2px] flex-shrink-0">
                    <div class="w-full h-full rounded-full bg-kivo-surfaceDark flex items-center justify-center text-white text-base font-bold font-mono" id="dropdown-avatar-initials">
                      VK
                    </div>
                  </div>
                  <div class="overflow-hidden">
                    <div class="font-bold text-sm text-kivo-text truncate" id="dropdown-fullname">Vishal Khadatare</div>
                    <div class="text-xs text-kivo-textMuted truncate" id="dropdown-email">vishal@email.com</div>
                    <div class="mt-1 flex items-center gap-1.5">
                      <span id="dropdown-sub-badge" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-kivo-teal/15 text-kivo-tealDark border border-kivo-teal/30">TRIAL</span>
                      <span id="dropdown-sub-days" class="text-[11px] text-kivo-textMuted">6 days left</span>
                    </div>
                  </div>
                </div>

                <div class="space-y-1">
                  <button onclick="openProfileModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors">
                    <span>👤</span>
                    <span>Your Profile & Account</span>
                  </button>
                  <button onclick="openBillingModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors">
                    <span>💳</span>
                    <span>Subscription & Billing</span>
                  </button>
                  <button onclick="openSettingsModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors">
                    <span>⚙️</span>
                    <span>Caretaker Preferences</span>
                  </button>
                </div>

                <div class="border-t border-kivo-border pt-2 mt-2">
                  <button onclick="handleSignOut()" class="w-full px-3.5 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors">
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </header>

    <div class="h-18 sm:h-20"></div>

    <main>

      <!-- 2. HERO SECTION -->
      <section id="hero" class="relative bg-kivo-bgHero py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-kivo-border">
        <div class="hero-ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full blur-[100px]" aria-hidden="true"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <div class="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-kivo-border shadow-kivo-sm">
                <span class="w-2 h-2 rounded-full bg-kivo-teal animate-pulse"></span>
                <span class="text-xs font-bold text-kivo-textSecondary tracking-tight">Amazon Nova AI Digital Caretaker</span>
              </div>

              <h1 class="hero-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
                You Speak. <br />
                <span class="gradient-text-accent">Kivo Clicks.</span>
              </h1>

              <p class="text-base sm:text-lg lg:text-xl text-kivo-textSecondary font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kivo allows elderly parents to speak naturally. Amazon Nova models autonomously understand requests, verify physical prescriptions, navigate websites, and execute tasks — keeping families reassured in real time.
              </p>

              <div class="space-y-2 pt-1">
                <span class="text-xs font-mono font-bold text-kivo-textMuted uppercase tracking-wider block">Try spoken natural-language intents:</span>
                <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <button onclick="selectDemoScenario('medicine-refill'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>💊</span>
                    <span>"Order my Pantocid 40mg medication"</span>
                  </button>
                  <button onclick="selectDemoScenario('ride-clinic'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>🚕</span>
                    <span>"Book my usual cab to Dr. Sharma tomorrow at 10 AM"</span>
                  </button>
                  <button onclick="selectDemoScenario('utility-bill'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>⚡</span>
                    <span>"Pay my electricity bill for this month"</span>
                  </button>
                </div>
              </div>

              <div class="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                <button onclick="scrollToLiveDemo()" class="min-h-[52px] px-8 py-4 rounded-2xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-kivo-teal transition-all cta-press">
                  <span>Try Kivo Live</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>

                <a href="#architecture" class="min-h-[52px] px-7 py-4 rounded-2xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-text text-sm font-bold flex items-center justify-center gap-2 transition-all cta-press shadow-kivo-sm">
                  <span>See How It Works</span>
                  <span class="text-kivo-tealDark">↓</span>
                </a>
              </div>

              <div class="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-kivo-textMuted">
                <span class="flex items-center gap-1.5 font-semibold text-kivo-textSecondary">
                  <span class="text-kivo-teal">✓</span> Self-Hosted MCP Server
                </span>
                <span class="flex items-center gap-1.5 font-semibold text-kivo-textSecondary">
                  <span class="text-kivo-teal">✓</span> Human-in-the-Loop Safety
                </span>
                <span class="flex items-center gap-1.5 font-semibold text-kivo-textSecondary">
                  <span class="text-kivo-teal">✓</span> Real-Time Family Alert Loop
                </span>
              </div>
            </div>

            <div class="lg:col-span-5">
              <div class="kivo-card p-6 sm:p-7 relative overflow-hidden bg-white border-kivo-border">
                <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-5">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full bg-kivo-teal animate-pulse"></span>
                    <span class="font-bold text-xs font-display tracking-tight text-kivo-text uppercase">KIVO LIVE PIPELINE</span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-kivo-teal/15 text-kivo-tealDark border border-kivo-teal/30">
                    VOICE → ACTION
                  </span>
                </div>

                <div class="space-y-4">
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-xs flex-shrink-0">🎙️</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">1. Spoken Request</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Sonic [0.10s]</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary font-mono italic truncate">"Order my Pantocid 40mg medication"</p>
                    </div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-xs flex-shrink-0">🧠</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">2. Intent & Vision Verified</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Lite + Vision</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary">Pantocid 40mg • Dr. Sharma Clinic Registry</p>
                    </div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-xs flex-shrink-0">⚡</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">3. Browser Automation</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Act</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary">Apollo Pharmacy Cart Staged (₹142.50) • Awaiting approval</p>
                    </div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">💬</div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-emerald-900">4. Family Notification</span>
                        <span class="text-[10px] font-mono text-emerald-700 font-bold">Family API</span>
                      </div>
                      <p class="text-xs text-emerald-800">WhatsApp receipt queued for Rohan (Primary Caregiver)</p>
                    </div>
                  </div>
                </div>

                <div class="pt-5 mt-4 border-t border-kivo-border">
                  <button onclick="scrollToLiveDemo()" class="w-full py-3 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold text-xs flex items-center justify-center gap-2 transition-all cta-press">
                    <span>⚡ Watch Full Interactive Simulator Below</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- 3. BEFORE VS KIVO -->
      <section id="comparison" class="py-20 sm:py-28 bg-kivo-bgAlt border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              ELIMINATING DIGITAL FRICTION
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              The Old Way vs The Kivo Way
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Elderly seniors struggle with complex multi-step mobile apps, passwords, and checkout flows. Kivo reduces 14+ friction steps to 1 spoken sentence.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div class="kivo-card p-7 sm:p-9 bg-white border-rose-200 shadow-kivo-md relative">
              <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-6">
                <div>
                  <span class="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">THE OLD WAY</span>
                  <h3 class="text-xl font-bold font-display text-kivo-text mt-1">14+ Steps of Digital Friction</h3>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">✕</div>
              </div>

              <ul class="space-y-3.5 text-xs text-kivo-textSecondary">
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">1.</span><span>Unlock smartphone, remember app location, launch pharmacy app.</span></li>
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">2.</span><span>Encounter OTP / expired login password reset wall.</span></li>
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">3.</span><span>Search medicine name with tiny keyboard; struggle with spelling.</span></li>
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">4.</span><span>Upload physical prescription photo; verify medicine dosage.</span></li>
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">5.</span><span>Select delivery slot, enter CVV code, pass SMS bank authorization.</span></li>
                <li class="flex items-start gap-3"><span class="text-rose-500 font-bold">6.</span><span>Family members have zero visibility into whether order succeeded.</span></li>
              </ul>

              <div class="mt-8 pt-4 border-t border-kivo-border flex items-center justify-between text-xs text-rose-600 font-bold">
                <span>Result: Frustration & missed medications</span>
                <span>⏱️ ~25 mins</span>
              </div>
            </div>

            <div class="kivo-card p-7 sm:p-9 bg-white border-kivo-teal shadow-kivo-lg relative ring-2 ring-kivo-teal/30">
              <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-6">
                <div>
                  <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider">THE KIVO WAY</span>
                  <h3 class="text-xl font-bold font-display text-kivo-text mt-1">1 Spoken Natural Request</h3>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-lg">✓</div>
              </div>

              <ul class="space-y-3.5 text-xs text-kivo-textSecondary">
                <li class="flex items-start gap-3"><span class="text-kivo-teal font-bold text-base">●</span><span>Senior says: <strong class="text-kivo-text">"Kivo, order my Pantocid 40mg tablets."</strong></span></li>
                <li class="flex items-start gap-3"><span class="text-kivo-teal font-bold text-base">●</span><span><strong class="text-kivo-text">Nova Sonic + Lite:</strong> Extracts intent, dosage, and medical schedule.</span></li>
                <li class="flex items-start gap-3"><span class="text-kivo-teal font-bold text-base">●</span><span><strong class="text-kivo-text">Nova Act:</strong> Headless browser launches, logs in, matches Apollo cart.</span></li>
                <li class="flex items-start gap-3"><span class="text-kivo-teal font-bold text-base">●</span><span><strong class="text-kivo-text">Caregiver Confirmation:</strong> Pre-authorized limit dispatched automatically.</span></li>
                <li class="flex items-start gap-3"><span class="text-kivo-teal font-bold text-base">●</span><span><strong class="text-kivo-text">Family API:</strong> WhatsApp confirmation & tracking sent to family instantly.</span></li>
              </ul>

              <div class="mt-8 pt-4 border-t border-kivo-border flex items-center justify-between text-xs text-kivo-tealDark font-bold">
                <span>Result: Autonomous, safe & verified</span>
                <span class="text-emerald-600 font-extrabold font-mono">⏱️ &lt; 3 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 4. LIVE INTERACTIVE SIMULATOR (Dominant Full-Featured Centerpiece)    -->
      <!-- ===================================================================== -->
      <section id="live-demo" class="py-20 sm:py-28 bg-kivo-bgDemo border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              INTERACTIVE AGENT WORKBENCH
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Watch Kivo Actually Work
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Speak with your microphone or choose a scenario. Step through the real 5-stage agent workflow with browser automation and family alerts.
            </p>
          </div>

          <!-- Scenario Selector Tabs -->
          <div class="mb-6 flex flex-wrap items-center justify-center gap-2.5" role="tablist" aria-label="Simulator Scenarios">
            <button onclick="selectDemoScenario('medicine-refill')" id="pill-scenario-medicine" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-kivo-teal text-slate-950 shadow-kivo-sm border border-kivo-teal" role="tab" aria-selected="true">
              💊 Medicine Refill
            </button>
            <button onclick="selectDemoScenario('ride-clinic')" id="pill-scenario-ride" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              🚕 Book a Cab
            </button>
            <button onclick="selectDemoScenario('utility-bill')" id="pill-scenario-utility" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              ⚡ Pay a Bill
            </button>
            <button onclick="selectDemoScenario('grocery-restock')" id="pill-scenario-grocery" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              🛒 Grocery Essentials
            </button>
            <button onclick="selectDemoScenario('flight-status')" id="pill-scenario-flight" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              ✈️ Flight Status
            </button>
          </div>

          <!-- 5-STAGE PROGRESS BAR & PLAYBACK CONTROLS -->
          <div class="kivo-card p-4 sm:p-5 bg-white border-kivo-border mb-8 shadow-kivo-sm space-y-4">
            <!-- Stage Pills -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div id="stage-step-1" class="stage-pill-active py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5">
                <span>1. Voice Stream</span>
              </div>
              <div id="stage-step-2" class="stage-pill-pending py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5">
                <span>2. Intent & Risk</span>
              </div>
              <div id="stage-step-3" class="stage-pill-pending py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5">
                <span>3. Vision/Vault</span>
              </div>
              <div id="stage-step-4" class="stage-pill-pending py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5">
                <span>4. Browser Act</span>
              </div>
              <div id="stage-step-5" class="stage-pill-pending py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1">
                <span>5. Family Alert</span>
              </div>
            </div>

            <!-- Controls: Auto-Play, Next Step, Reset, Speed Control -->
            <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-kivo-border text-xs">
              <div class="flex items-center gap-2">
                <button onclick="toggleAutoPlay()" id="btn-demo-autoplay" class="px-4 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold shadow-kivo-sm flex items-center gap-1.5 cta-press">
                  <span id="icon-autoplay">▶</span>
                  <span id="label-autoplay">Auto-Play Workflow</span>
                </button>
                <button onclick="advanceNextStage()" id="btn-demo-next" class="px-3.5 py-2 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold border border-kivo-border flex items-center gap-1.5 cta-press">
                  <span>Next Step ⏭</span>
                </button>
                <button onclick="resetDemoSession()" class="px-3 py-2 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-textSecondary hover:text-kivo-text font-semibold border border-kivo-border cta-press">
                  <span>↺ Reset</span>
                </button>
              </div>

              <!-- Speed Selector & Current Status -->
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1 text-[11px] font-mono text-kivo-textMuted bg-kivo-surfacePanel px-2 py-1 rounded-lg border border-kivo-border">
                  <span>Speed:</span>
                  <button onclick="setDemoSpeed(0.5)" id="speed-05" class="px-1.5 py-0.5 rounded text-kivo-textSecondary hover:text-kivo-text">0.5x</button>
                  <button onclick="setDemoSpeed(1.0)" id="speed-10" class="px-1.5 py-0.5 rounded bg-kivo-teal text-slate-950 font-bold">1x</button>
                  <button onclick="setDemoSpeed(1.5)" id="speed-15" class="px-1.5 py-0.5 rounded text-kivo-textSecondary hover:text-kivo-text">1.5x</button>
                  <button onclick="setDemoSpeed(2.0)" id="speed-20" class="px-1.5 py-0.5 rounded text-kivo-textSecondary hover:text-kivo-text">2x</button>
                </div>
                <span id="demo-global-status-badge" class="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-kivo-teal/15 text-kivo-tealDark border border-kivo-teal/30">
                  READY
                </span>
              </div>
            </div>
          </div>

          <!-- WORKBENCH 2-COLUMN GRID -->
          <div id="demo-interactive-workbench" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- LEFT COLUMN (5 Cols): Spoken Request, Voice Panel, Intent & JSON -->
            <div class="lg:col-span-5 space-y-6">
              
              <!-- Voice Interaction Card -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border space-y-4">
                <div class="flex items-center justify-between border-b border-kivo-border pb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-kivo-teal animate-pulse"></span>
                    <span class="font-bold text-xs font-display text-kivo-text uppercase">SPOKEN UTTERANCE</span>
                  </div>
                  <span id="demo-voice-state-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    STAGE 1 ACTIVE
                  </span>
                </div>

                <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border">
                  <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold block mb-1">Spoken Request:</span>
                  <p id="demo-spoken-utterance" class="text-sm font-semibold text-kivo-text font-sans">
                    "Kivo, order my Pantocid 40mg medication from Apollo Pharmacy"
                  </p>
                </div>

                <!-- Custom Voice Input Fallback -->
                <div class="space-y-1.5">
                  <label for="custom-voice-text-input" class="text-[10px] font-mono font-bold text-kivo-textMuted uppercase block">Or Type Custom Request (Fallback):</label>
                  <div class="flex gap-2">
                    <input type="text" id="custom-voice-text-input" placeholder="e.g. Book cab to clinic or pay electricity bill" class="flex-1 px-3 py-2 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-xs text-kivo-text focus:outline-none focus:border-kivo-teal focus:bg-white" />
                    <button onclick="handleCustomTextVoiceSubmit()" class="px-3.5 py-2 rounded-xl bg-kivo-surfaceDark text-white text-xs font-bold hover:bg-slate-800 transition-all cta-press">
                      Process
                    </button>
                  </div>
                </div>

                <!-- Dynamic 16-bar Sound Wave Visualizer -->
                <div id="demo-soundwave-wrap" class="hidden flex-col gap-2 p-3.5 rounded-2xl bg-kivo-surfaceDark text-white transition-all">
                  <div class="flex justify-between items-center text-[10px] font-mono">
                    <span id="soundwave-status-label" class="text-kivo-teal font-bold">LISTENING TO LIVE SPEECH...</span>
                    <span id="soundwave-db-level" class="text-slate-400">Mic: Active</span>
                  </div>
                  <div id="soundwave-bars" class="h-9 flex items-center justify-center gap-1.5 px-2">
                    <div class="sound-wave-bar w-1.5 h-2 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-3 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-4 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-5 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-3 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-6 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-4 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-7 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-5 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-3 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-6 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-4 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-5 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-3 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-4 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                    <div class="sound-wave-bar w-1.5 h-2 bg-gradient-to-t from-kivo-teal to-kivo-cyan rounded-full"></div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-1">
                  <button onclick="toggleVoiceRecognition()" id="btn-speak-mic" class="relative min-h-[44px] px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-kivo-sm transition-all flex items-center justify-center gap-2 cta-press" aria-label="Speak with microphone">
                    <span id="mic-pulse-ring" class="hidden absolute inset-0 rounded-xl bg-kivo-teal/40 animate-ping pointer-events-none"></span>
                    <span id="icon-speak-mic">🎙️</span>
                    <span id="label-speak-mic">Speak With Mic</span>
                  </button>

                  <button onclick="toggleDemoVoicePlayback()" id="btn-listen-voice" class="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold text-xs border border-kivo-border transition-all flex items-center justify-center gap-2 cta-press" aria-label="Listen to voice synthesis">
                    <span id="icon-listen-voice">🔊</span>
                    <span id="label-listen-voice">Listen Voice</span>
                  </button>
                </div>
              </div>

              <!-- Intent Decomposition (4 Dynamic Cards) -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border space-y-4">
                <div class="flex items-center justify-between border-b border-kivo-border pb-3">
                  <span class="font-bold text-xs font-display text-kivo-text uppercase">INTENT DECOMPOSITION</span>
                  <span class="text-[10px] font-mono text-kivo-tealDark font-bold">Nova Lite Synthesizer</span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">PRIMARY TASK</span>
                    <div id="demo-intent-task" class="font-bold text-kivo-text">Medicine Refill & Checkout</div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">TARGET PROFILE</span>
                    <div id="demo-intent-profile" class="font-bold text-kivo-text">Pantocid 40mg Rx (#P-402)</div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">SERVICE PLATFORM</span>
                    <div id="demo-intent-platform" class="font-bold text-kivo-text">Apollo Pharmacy 24/7</div>
                  </div>

                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">FAMILY ALERT</span>
                    <div id="demo-intent-alert" class="font-bold text-kivo-text">Rohan (Caregiver WhatsApp)</div>
                  </div>
                </div>

                <!-- Nova Intent JSON Inspection Toggle -->
                <div class="pt-2">
                  <button onclick="toggleNovaIntentJson()" id="btn-toggle-json" class="w-full py-2.5 px-3.5 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-textSecondary hover:text-kivo-text text-xs font-bold flex items-center justify-between transition-all cta-press" aria-expanded="false">
                    <span>{ } View Nova Intent JSON</span>
                    <span id="demo-json-chevron">▼</span>
                  </button>
                  <div id="demo-json-viewer" class="hidden mt-3 p-4 rounded-2xl bg-kivo-surfaceDark text-emerald-400 font-mono text-xs overflow-x-auto relative">
                    <div class="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                      <span class="text-[10px] text-slate-400 uppercase font-bold">Amazon Nova Intent Payload</span>
                      <button onclick="copyNovaIntentJson()" id="label-copy-json" class="text-[11px] text-kivo-teal font-bold hover:underline">📋 Copy JSON</button>
                    </div>
                    <pre id="demo-intent-json" class="text-[11px] leading-relaxed"></pre>
                  </div>
                </div>
              </div>

            </div>

            <!-- RIGHT COLUMN (7 Cols): Dynamic Browser Simulation & Activity Stream -->
            <div class="lg:col-span-7 space-y-6">
              
              <!-- Browser Simulator Card -->
              <div class="kivo-card overflow-hidden bg-white border-kivo-border shadow-kivo-lg">
                <!-- Browser Chrome Header -->
                <div class="px-4 py-3 bg-kivo-surfacePanel border-b border-kivo-border flex items-center gap-3">
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>

                  <div class="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-white border border-kivo-border flex items-center gap-2 text-xs text-kivo-textSecondary shadow-inner">
                    <span class="text-emerald-600 text-[10px]">🔒</span>
                    <span id="demo-browser-url" class="font-mono text-[11px] truncate text-kivo-text">https://apollo247.com/prescriptions/reorder</span>
                  </div>

                  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
                    <span id="demo-browser-live-badge">NOVA ACT RUNNING</span>
                  </div>
                </div>

                <!-- Browser Viewport Area -->
                <div class="p-6 relative min-h-[320px] bg-kivo-bgHero flex flex-col justify-between">
                  <!-- AI Cursor -->
                  <div id="live-ai-cursor" class="absolute top-16 left-1/3 z-20 pointer-events-none transition-transform duration-500">
                    <div class="relative">
                      <svg class="w-6 h-6 text-purple-600 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 2l16 12-7 2-4 6z"/>
                      </svg>
                      <span id="cursor-tooltip" class="absolute left-6 top-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-600 text-white shadow-sm whitespace-nowrap">
                        Kivo AI Cursor
                      </span>
                    </div>
                  </div>

                  <!-- Dynamic Service Content Card -->
                  <div id="demo-service-card" class="p-5 rounded-2xl bg-white border border-kivo-border shadow-kivo-sm space-y-4">
                    <div class="flex items-start justify-between gap-3">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span id="demo-service-badge" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            PRESCRIPTION VERIFIED
                          </span>
                          <span class="text-[10px] font-mono text-kivo-textMuted">[ DEMO SERVICE SIMULATION ]</span>
                        </div>
                        <h4 id="demo-service-title" class="font-bold text-base sm:text-lg text-kivo-text font-display">
                          Pantocid 40mg (Strip of 15 Gastro Tablets)
                        </h4>
                        <p id="demo-service-desc" class="text-xs text-kivo-textSecondary">
                          Apollo Pharmacy Ltd. • Prescription on file (#AP-402-PUNE) • Delivery: Flat 402, Green Acres, Pune
                        </p>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <span class="text-[10px] font-mono text-kivo-textMuted uppercase block">Total Charge</span>
                        <span id="demo-service-price" class="text-xl sm:text-2xl font-black font-mono text-kivo-text">₹142.50</span>
                      </div>
                    </div>

                    <!-- Caregiver Safety Approval Bar -->
                    <div id="demo-approval-card" class="p-4 rounded-xl bg-kivo-surfacePanel border border-kivo-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-2 text-xs text-kivo-text">
                        <span>🛡️</span>
                        <span><strong class="text-kivo-text">Human-in-the-Loop:</strong> Pre-authorized limit (₹1,000.00)</span>
                      </div>
                      <div class="flex items-center gap-2 justify-end">
                        <button onclick="cancelPendingOrder()" id="btn-cancel-order" class="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 border border-kivo-border text-rose-600 text-xs font-bold transition-all cta-press">
                          Cancel
                        </button>
                        <button onclick="confirmAndDispatchOrder()" id="btn-dispatch-order" class="px-5 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 text-xs font-extrabold shadow-kivo-sm transition-all cta-press">
                          Confirm & Dispatch Order
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Real-Time Browser Step Description Bar -->
                  <div class="pt-4 flex flex-wrap items-center justify-between text-xs text-kivo-textMuted border-t border-kivo-border mt-4 gap-2">
                    <span class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-kivo-teal animate-pulse"></span>
                      <span>Status: <strong id="demo-live-step-status" class="text-kivo-text">Staged cart awaiting caregiver approval</strong></span>
                    </span>
                    <button onclick="rerunActiveSimulation()" class="text-kivo-tealDark font-bold hover:underline inline-flex items-center gap-1 cta-press">
                      <span>↻ Re-run Simulation</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Agent Activity Stream -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border space-y-4">
                <div class="flex items-center justify-between border-b border-kivo-border pb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="font-bold text-xs font-display text-kivo-text uppercase">AGENT ACTIVITY STREAM</span>
                  </div>
                  <span id="demo-activity-counter" class="text-[10px] font-mono text-kivo-textMuted font-bold">5 Sub-Agents Synchronized</span>
                </div>

                <div id="demo-activity-stream" class="space-y-2.5">
                  <!-- Rendered dynamically step by step -->
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      <!-- 5. AMAZON NOVA ARCHITECTURE -->
      <section id="architecture" class="py-20 sm:py-28 bg-kivo-bgArch border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              TECHNICAL ARCHITECTURE
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Amazon Nova Multimodal Pipeline
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Kivo coordinates Amazon Nova models for acoustic speech processing, high-speed reasoning, vision OCR, headless browser actions, and family communication.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 items-stretch">
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between group hover:border-kivo-teal">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-lg">🎙️</div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Sonic</h3>
                <p class="text-xs text-kivo-textSecondary">Audio stream capture & acoustic dialect adaptation for elderly speech clarity.</p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>STAGE 1</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between group hover:border-kivo-cyan">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-lg">🧠</div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Lite</h3>
                <p class="text-xs text-kivo-textSecondary">Intent decomposition, entity resolution, and MCP tool execution schema synthesis.</p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>STAGE 2</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between group hover:border-amber-400">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold text-lg">👁️</div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Vision</h3>
                <p class="text-xs text-kivo-textSecondary">Prescription OCR, medicine bottle matching, and physical invoice verification.</p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>STAGE 3</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between group hover:border-purple-500">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-lg">⚡</div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Act</h3>
                <p class="text-xs text-kivo-textSecondary">Headless browser web automation completing forms, carts, and pre-checkout flows.</p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>STAGE 4</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between group hover:border-emerald-500">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-lg">💬</div>
                <h3 class="font-bold text-base font-display text-kivo-text">Family API</h3>
                <p class="text-xs text-kivo-textSecondary">WhatsApp receipts, dispatch updates, and caregiver emergency override gateway.</p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>STAGE 5</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. FOUR PILLARS -->
      <section id="pillars" class="py-20 sm:py-28 bg-kivo-bg border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              CORE PRODUCT PILLARS
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Designed for Dignity, Independence & Peace of Mind
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Kivo bridges the digital divide by converting spoken natural language into secure self-navigating web actions.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-2xl">🗣️</div>
              <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider block">PILLAR 01</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Voice-First Natural Interaction</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Seniors never have to navigate menus, type on keyboards, or memorize passwords. They simply speak to Kivo like talking to a family member.
              </p>
            </div>

            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-2xl">📑</div>
              <span class="text-xs font-mono font-bold text-kivo-cyan uppercase tracking-wider block">PILLAR 02</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Context & Prescription Memory</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Kivo securely stores regular dosages, favorite pantries, doctor contacts, and addresses, resolving ambiguities automatically.
              </p>
            </div>

            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-2xl">🛡️</div>
              <span class="text-xs font-mono font-bold text-purple-600 uppercase tracking-wider block">PILLAR 03</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Safe Autonomous Execution</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Financial spending caps, pre-authorized limits, and Human-in-the-Loop approval workflows ensure zero unauthorized orders.
              </p>
            </div>

            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-2xl">❤️</div>
              <span class="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">PILLAR 04</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Real-Time Family Loop</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Caregivers receive instant WhatsApp receipts and live dispatch status, giving families reassurance across distances.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. ROI CALCULATOR -->
      <section id="calculator" class="py-20 sm:py-28 bg-kivo-bgAlt border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              CAREGIVER VALUE CALCULATOR
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Calculate Time Saved & Peace of Mind
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              See how many hours of caregiver coordination and digital friction Kivo eliminates for your family every year.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            <div class="lg:col-span-7 kivo-card p-8 bg-white border-kivo-border space-y-6">
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm font-bold text-kivo-text">
                  <label for="slider-seniors">Parents / Grandparents Supported</label>
                  <span id="label-val-seniors" class="font-mono text-kivo-tealDark text-base font-extrabold">2 Seniors</span>
                </div>
                <input type="range" id="slider-seniors" min="1" max="8" value="2" oninput="updateRoiCalculation()" class="w-full h-2 bg-kivo-surfacePanel rounded-lg appearance-none cursor-pointer accent-kivo-teal">
              </div>

              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm font-bold text-kivo-text">
                  <label for="slider-tasks">Digital Errands per Month (Per Person)</label>
                  <span id="label-val-tasks" class="font-mono text-kivo-tealDark text-base font-extrabold">12 Tasks</span>
                </div>
                <input type="range" id="slider-tasks" min="4" max="40" value="12" step="2" oninput="updateRoiCalculation()" class="w-full h-2 bg-kivo-surfacePanel rounded-lg appearance-none cursor-pointer accent-kivo-teal">
              </div>

              <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border text-xs text-kivo-textSecondary space-y-1">
                <span class="font-bold text-kivo-text block">Includes:</span>
                <p>Pharmacy reorders, lab test booking, clinic cabs, utility bill payments, and daily grocery restocks.</p>
              </div>
            </div>

            <div class="lg:col-span-5 kivo-card p-8 bg-kivo-surfaceDark text-white border-kivo-border space-y-6 shadow-kivo-lg">
              <div>
                <span class="text-xs font-mono font-bold text-kivo-teal uppercase tracking-wider block mb-1">ANNUAL TIME RECLAIMED</span>
                <div id="roi-hours-saved" class="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">72 hrs</div>
                <span class="text-xs text-slate-400 mt-1 block">per year of digital coordination saved</span>
              </div>

              <div class="grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
                <div>
                  <span class="text-[10px] font-mono text-slate-400 uppercase block">Stress Reduction</span>
                  <span id="roi-stress-reduc" class="text-2xl font-bold font-mono text-emerald-400">85%</span>
                </div>
                <div>
                  <span class="text-[10px] font-mono text-slate-400 uppercase block">Family Days Saved</span>
                  <span id="roi-days-saved" class="text-2xl font-bold font-mono text-kivo-cyan">9 Days</span>
                </div>
              </div>

              <p class="text-[11px] text-slate-400 italic">
                * Illustrative estimate based on average 15 minutes of digital friction per senior errand.
              </p>

              <button onclick="scrollToLiveDemo()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md transition-all cta-press">
                Start 7-Day Free Trial →
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. PRICING -->
      <section id="pricing" class="py-20 sm:py-28 bg-kivo-bg border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              TRANSPARENT PRICING
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Simple, Predictable Caretaker Plans
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Start with a full-featured 7-day free trial. No credit card required to explore.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            <div class="kivo-card p-8 sm:p-9 bg-white border-kivo-border flex flex-col justify-between">
              <div class="space-y-6">
                <div>
                  <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-kivo-surfacePanel text-kivo-textSecondary border border-kivo-border">7-DAY TRIAL</span>
                  <h3 class="text-2xl font-bold font-display text-kivo-text mt-3">Kivo Free Trial</h3>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-4xl font-black font-mono text-kivo-text">$0</span>
                    <span class="text-xs text-kivo-textMuted">for 7 full days</span>
                  </div>
                </div>

                <ul class="space-y-3 text-xs text-kivo-textSecondary">
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Full Voice Intent Decomposition</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Self-Hosted MCP Browser Automation</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Prescription Vision Verification</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Family WhatsApp Notification Feed</span></li>
                </ul>
              </div>

              <div class="pt-8">
                <button onclick="openAuth('signup')" class="w-full py-4 rounded-2xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold text-xs border border-kivo-border transition-all cta-press">
                  Create Free Account
                </button>
              </div>
            </div>

            <div class="kivo-card p-8 sm:p-9 bg-white border-kivo-teal shadow-kivo-lg relative ring-2 ring-kivo-teal/30 flex flex-col justify-between">
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm">MOST POPULAR</span>
                    <h3 class="text-2xl font-bold font-display text-kivo-text mt-3">Kivo Pro Caretaker</h3>
                    <div class="mt-2 flex items-baseline gap-1">
                      <span class="text-4xl font-black font-mono text-kivo-text">$14.99</span>
                      <span class="text-xs text-kivo-textMuted">/ month</span>
                    </div>
                  </div>
                  <span class="text-3xl">⭐</span>
                </div>

                <ul class="space-y-3 text-xs text-kivo-textSecondary">
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span><strong class="text-kivo-text">Unlimited</strong> Autonomous Web Dispatches</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Multi-Senior Family Management (Up to 4 Parents)</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Dedicated WhatsApp Priority Alert Gateway</span></li>
                  <li class="flex items-center gap-2.5"><span class="text-kivo-teal font-bold">✓</span><span>Senior Accessibility High-Contrast Voice Suite</span></li>
                </ul>
              </div>

              <div class="pt-8">
                <button onclick="openUpgradeModal('checkout')" class="w-full py-4 rounded-2xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-sm shadow-kivo-teal transition-all cta-press">
                  Upgrade to Kivo Pro →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 9. FINAL CTA -->
      <section id="cta" class="py-20 sm:py-28 bg-kivo-surfaceDark text-white relative overflow-hidden">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-kivo-teal/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true"></div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-7">
          <span class="text-xs font-mono font-bold text-kivo-teal uppercase tracking-wider bg-kivo-teal/15 px-3.5 py-1.5 rounded-full border border-kivo-teal/30">
            EXPERIENCE THE FUTURE OF CARETAKING
          </span>

          <h2 class="text-4xl sm:text-6xl font-black font-display text-white tracking-tight leading-tight">
            Speak your intent. <br />
            <span class="gradient-text-accent">Let Kivo handle the rest.</span>
          </h2>

          <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            "The future of ambient computing isn't configuring complex apps — it's speaking naturally and letting intelligent autonomous agents protect and support the people you love."
          </p>

          <div class="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onclick="scrollToLiveDemo()" class="min-h-[52px] px-8 py-4 rounded-2xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-sm shadow-kivo-teal transition-all cta-press">
              Try Kivo Live Demo
            </button>
            <button onclick="openAuth('signup')" class="min-h-[52px] px-8 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 text-sm font-bold transition-all cta-press">
              Sign Up Free
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- FOOTER -->
    <footer class="bg-white border-t border-kivo-border py-12 text-xs text-kivo-textMuted">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold font-display text-kivo-text text-sm">Kivo AI</span>
          <span>— Autonomous Digital Caretaker for Elderly Users</span>
        </div>
        <div class="text-kivo-textSecondary font-mono text-[11px]">
          Amazon Developer Hackathon 2026 • Powered by Amazon Nova & MCP
        </div>
      </div>
    </footer>

  </div>

  <!-- SENIOR MODE -->
  <div id="senior-experience" class="min-h-screen bg-amber-50/50 p-6 sm:p-12 text-slate-950">
    <div class="max-w-4xl mx-auto space-y-8">
      <div class="flex justify-between items-center border-b-4 border-slate-900 pb-6">
        <div>
          <h1 class="text-4xl sm:text-5xl font-black font-display text-slate-950">Kivo Senior Mode</h1>
          <p class="text-xl font-bold text-slate-700 mt-2">Large buttons. Simple speech. Zero typing.</p>
        </div>
        <button onclick="toggleSeniorMode()" class="px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-lg border-2 border-slate-900 cta-press shadow-lg">
          Exit Senior Mode ✕
        </button>
      </div>

      <div class="p-10 rounded-3xl bg-white border-4 border-slate-900 shadow-2xl text-center space-y-6">
        <span class="text-2xl font-bold text-slate-800 block">Tap the big button below and speak:</span>
        <button onclick="toggleVoiceRecognition()" class="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan text-slate-950 text-5xl font-black shadow-2xl flex items-center justify-center border-4 border-slate-900 cta-press">
          🎙️
        </button>
        <p class="text-2xl font-extrabold text-slate-950">"Order my medicine" or "Book my clinic cab"</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button onclick="selectDemoScenario('medicine-refill'); toggleSeniorMode(); scrollToLiveDemo();" class="p-8 rounded-3xl bg-white border-4 border-slate-900 text-left space-y-2 shadow-lg cta-press">
          <span class="text-4xl">💊</span>
          <h3 class="text-2xl font-black text-slate-950">Order Pantocid 40mg Refill</h3>
          <p class="text-base text-slate-700 font-bold">Refill gastro pills from Apollo Pharmacy</p>
        </button>

        <button onclick="selectDemoScenario('ride-clinic'); toggleSeniorMode(); scrollToLiveDemo();" class="p-8 rounded-3xl bg-white border-4 border-slate-900 text-left space-y-2 shadow-lg cta-press">
          <span class="text-4xl">🚖</span>
          <h3 class="text-2xl font-black text-slate-950">Call Cab to Dr. Sharma Clinic</h3>
          <p class="text-base text-slate-700 font-bold">Ride to Dr. Sharma Clinic tomorrow at 10 AM</p>
        </button>
      </div>
    </div>
  </div>

  <!-- AUTH PORTAL -->
  <div id="account-experience" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeAuth()">
    <div class="relative w-full max-w-[440px] my-auto z-10 animate-[loadFadeUp_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="flex items-center justify-between mb-3 px-1">
        <button onclick="closeAuth()" class="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors">
          <span>← Back to Kivo</span>
        </button>
      </div>

      <div class="w-full bg-white border border-kivo-border p-7 sm:p-8 rounded-3xl shadow-2xl relative">
        <div class="text-center mb-5">
          <div class="inline-flex items-center justify-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[2px]">
              <div class="w-full h-full bg-kivo-surfaceDark rounded-[10px] flex items-center justify-center text-white text-xs font-bold">K</div>
            </div>
            <span class="text-xl font-bold font-display text-kivo-text">Kivo</span>
          </div>
          <p class="text-xs text-kivo-textMuted font-medium">You Speak. Kivo Clicks.</p>
        </div>

        <div class="text-center mb-4">
          <h2 id="auth-header-title" class="text-xl font-bold font-display text-kivo-text">Sign up for Kivo</h2>
          <p id="auth-header-subtitle" class="text-xs text-kivo-textMuted mt-0.5">Start your 7-day free trial today.</p>
        </div>

        <div id="auth-segmented-tabs" class="grid grid-cols-2 p-1 rounded-2xl bg-kivo-surfacePanel border border-kivo-border mb-5" role="tablist">
          <button onclick="switchAuthTab('signin')" id="tab-btn-signin" role="tab" aria-selected="false" class="py-2.5 rounded-xl text-xs font-semibold text-kivo-textSecondary hover:text-kivo-text transition-all cta-press text-center">
            Sign In
          </button>
          <button onclick="switchAuthTab('signup')" id="tab-btn-signup" role="tab" aria-selected="true" class="py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm transition-all cta-press text-center">
            Sign Up
          </button>
        </div>

        <div id="auth-global-error" class="hidden mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2" role="alert">
          <span>⚠️</span>
          <div class="flex-1">
            <p id="auth-global-error-msg">Invalid email or password.</p>
          </div>
          <button onclick="dismissAuthError()" class="text-rose-500 hover:text-rose-700 text-xs">✕</button>
        </div>

        <!-- Sign Up View -->
        <div id="auth-view-signup" class="space-y-3.5">
          <form id="form-signup" onsubmit="handleSignup(event)" novalidate class="space-y-3">
            <div>
              <label for="signup-name" class="block text-xs font-semibold text-kivo-text mb-1">Full Name</label>
              <input type="text" id="signup-name" placeholder="Your full name" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <div>
              <label for="signup-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
              <input type="email" id="signup-email" placeholder="you@example.com" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <div>
              <label for="signup-password" class="block text-xs font-semibold text-kivo-text mb-1">Password</label>
              <input type="password" id="signup-password" placeholder="At least 8 characters" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <div>
              <label for="signup-confirm-password" class="block text-xs font-semibold text-kivo-text mb-1">Confirm Password</label>
              <input type="password" id="signup-confirm-password" placeholder="Re-enter password" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <button type="submit" id="btn-submit-signup" class="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cta-press">
              <span id="label-signup-btn">Create Free Kivo Account</span>
              <svg id="spinner-signup" class="w-4 h-4 animate-spin hidden" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            </button>
          </form>
        </div>

        <!-- Sign In View -->
        <div id="auth-view-signin" class="space-y-3.5 hidden">
          <form id="form-signin" onsubmit="handleSignin(event)" novalidate class="space-y-3">
            <div>
              <label for="signin-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
              <input type="email" id="signin-email" placeholder="you@example.com" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="signin-password" class="block text-xs font-semibold text-kivo-text">Password</label>
                <button type="button" onclick="showForgotPasswordView()" class="text-[11px] text-kivo-tealDark font-semibold hover:underline">Forgot password?</button>
              </div>
              <input type="password" id="signin-password" placeholder="Your password" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white" required>
            </div>
            <button type="submit" id="btn-submit-signin" class="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cta-press">
              <span id="label-signin-btn">Sign In to Kivo</span>
              <svg id="spinner-signin" class="w-4 h-4 animate-spin hidden" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            </button>
          </form>
        </div>

        <div id="auth-view-forgot" class="space-y-3.5 hidden">
          <div id="forgot-success-banner" class="hidden p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            ✓ Password reset link sent to your email.
          </div>
          <form id="form-forgot" onsubmit="handleForgotPassword(event)" class="space-y-3">
            <div>
              <label for="forgot-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
              <input type="email" id="forgot-email" placeholder="you@example.com" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal" required>
            </div>
            <button type="submit" class="w-full h-12 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md cta-press">
              Send Reset Link
            </button>
          </form>
          <div class="text-center pt-2">
            <button onclick="switchAuthTab('signin')" class="text-xs text-kivo-textMuted hover:text-kivo-text font-semibold">
              ← Back to Sign In
            </button>
          </div>
        </div>

        <div id="auth-view-success" class="space-y-4 hidden text-center py-6">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto font-bold">✓</div>
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-kivo-text font-display" id="auth-success-title">Verified & Connected</h3>
            <p class="text-xs text-kivo-textSecondary" id="auth-success-subtitle">Welcome to Kivo.</p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- PROFILE MODAL (Max-Height 90vh & Complete Info) -->
  <div id="profile-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeProfileModal()">
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Your Kivo Profile</h3>
            <p class="text-xs text-kivo-textMuted">Caregiver identity, contact & account credentials.</p>
          </div>
          <button onclick="closeProfileModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel border border-kivo-border text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm transition-all cta-press">
            ✕
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[2px] flex items-center justify-center shadow-md flex-shrink-0">
            <div class="w-full h-full rounded-full bg-kivo-surfaceDark flex items-center justify-center text-white text-xl font-black font-mono" id="modal-profile-initials">
              VK
            </div>
          </div>
          <div class="space-y-1 overflow-hidden">
            <div class="font-bold text-kivo-text text-base truncate" id="modal-profile-fullname-display">Vishal Khadatare</div>
            <div class="text-xs text-kivo-textSecondary flex items-center gap-1.5 truncate">
              <span id="modal-profile-email-display">vishal@email.com</span>
              <span class="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Verified</span>
            </div>
            <span class="inline-block text-[10px] text-kivo-tealDark font-mono bg-kivo-teal/15 px-2 py-0.5 rounded border border-kivo-teal/30">
              ROLE: PRIMARY CAREGIVER
            </span>
          </div>
        </div>

        <!-- Recent Activity Section in Profile -->
        <div class="space-y-2">
          <span class="text-xs font-mono font-bold text-kivo-text uppercase tracking-wider block">Recent Kivo Activity:</span>
          <div id="profile-recent-activity" class="space-y-2 text-xs">
            <div class="p-3 rounded-xl bg-kivo-surfacePanel border border-kivo-border flex justify-between items-center">
              <span>💊 Pantocid 40mg Refill (Apollo Pharmacy)</span>
              <span class="text-emerald-700 font-bold font-mono">✓ Completed</span>
            </div>
          </div>
        </div>

        <form onsubmit="saveProfileChanges(event)" class="space-y-4">
          <div>
            <label for="edit-profile-name" class="block text-xs font-semibold text-kivo-text mb-1">Full Name</label>
            <input type="text" id="edit-profile-name" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal" required>
          </div>

          <div>
            <label for="edit-profile-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
            <input type="email" id="edit-profile-email" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-textMuted text-xs cursor-not-allowed">
            <span class="text-[10px] text-kivo-textMuted mt-1 block">Managed through PostgreSQL authentication.</span>
          </div>

          <div class="pt-3 border-t border-kivo-border flex items-center justify-end gap-3">
            <button type="button" onclick="closeProfileModal()" class="px-4 py-2 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text text-xs font-semibold cta-press">
              Cancel
            </button>
            <button type="submit" class="px-6 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md cta-press">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- SETTINGS MODAL -->
  <div id="settings-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeSettingsModal()">
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Caretaker Settings</h3>
            <p class="text-xs text-kivo-textMuted">Preferences, Senior Mode and notifications.</p>
          </div>
          <button onclick="closeSettingsModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm cta-press">
            ✕
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center justify-between">
            <div>
              <strong class="text-kivo-text block text-sm">Senior Accessibility Mode</strong>
              <span class="text-kivo-textMuted">High-contrast large touch targets and voice-first UI.</span>
            </div>
            <button onclick="toggleSeniorMode()" class="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white border border-kivo-border cta-press shadow-kivo-sm">
              Toggle
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center justify-between">
            <div>
              <strong class="text-kivo-text block text-sm">WhatsApp Family Alerts</strong>
              <span class="text-kivo-textMuted">Send instant receipts to primary caregiver.</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700">ENABLED</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- NOTIFICATIONS MODAL -->
  <div id="notifications-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeNotificationsModal()">
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Family Notification Feed</h3>
            <p class="text-xs text-kivo-textMuted">Live alerts from Kivo autonomous dispatches.</p>
          </div>
          <button onclick="closeNotificationsModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm cta-press">
            ✕
          </button>
        </div>

        <div id="notifications-list" class="space-y-3">
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>💊 Apollo Pharmacy: Pantocid 40mg Dispatched</span>
              <span class="text-[10px] text-emerald-700 font-mono">10:45 AM</span>
            </div>
            <p class="text-xs text-emerald-800">Delivering to Pune address. Total: ₹142.50. Tracking live.</p>
          </div>

          <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-kivo-text">
              <span>🚖 Uber Health Premier Ride Confirmed</span>
              <span class="text-[10px] text-kivo-textMuted font-mono">Yesterday</span>
            </div>
            <p class="text-xs text-kivo-textSecondary">Dr. Sharma Clinic drop-off. Driver: Rajesh (Swift Dzire).</p>
          </div>
        </div>

        <div class="pt-2 border-t border-kivo-border text-center">
          <button onclick="markAllNotificationsRead()" class="text-xs text-kivo-tealDark font-bold hover:underline cta-press">
            Mark all notifications as read
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- UPGRADE MODAL -->
  <div id="upgrade-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeUpgradeModal()">
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Upgrade to Kivo Pro</h3>
            <p class="text-xs text-kivo-textMuted">Unlimited autonomous digital caretaker actions.</p>
          </div>
          <button onclick="closeUpgradeModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm cta-press">
            ✕
          </button>
        </div>

        <div class="p-5 rounded-2xl bg-gradient-to-r from-kivo-teal/15 to-kivo-cyan/15 border border-kivo-teal/30 space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-bold text-sm text-kivo-text font-display">Kivo Pro Caretaker Plan</span>
            <span class="text-2xl font-black font-mono text-kivo-text">$14.99/mo</span>
          </div>
          <p class="text-xs text-kivo-textSecondary">Unlimited orders, multi-senior management, priority WhatsApp gateway.</p>
        </div>

        <button onclick="handleCheckoutPayment(event)" id="btn-submit-payment" class="w-full py-4 rounded-2xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-sm shadow-kivo-teal transition-all cta-press">
          <span id="label-submit-payment">Pay $14.99 & Activate Kivo Pro</span>
        </button>
      </div>
    </div>
  </div>

  <!-- BILLING MODAL -->
  <div id="billing-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" onclick="if(event.target === this) closeBillingModal()">
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Subscription & Billing</h3>
            <p class="text-xs text-kivo-textMuted">Manage membership and payment methods.</p>
          </div>
          <button onclick="closeBillingModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm cta-press">
            ✕
          </button>
        </div>

        <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-kivo-textMuted">Current Plan:</span>
            <strong id="billing-plan-title" class="text-kivo-text font-bold">Kivo Free Trial (Active)</strong>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-kivo-textMuted">Trial Remaining:</span>
            <span id="billing-date-value" class="font-bold text-kivo-tealDark">6 days remaining</span>
          </div>
        </div>

        <button onclick="closeBillingModal(); openUpgradeModal('checkout');" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md cta-press">
          Upgrade to Kivo Pro ($14.99/mo)
        </button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT STATE ENGINE (Complete Interactive & Asynchronous Flow) -->
  <script>
    // 1. SCENARIOS DATABASE
    const demoScenarios = {
      'medicine-refill': {
        key: 'medicine-refill',
        name: 'Medicine Refill',
        utterance: '"Kivo, order my Pantocid 40mg medication from Apollo Pharmacy"',
        voice: 'Ordering Pantocid 40 milligrams prescription refill from Apollo Pharmacy.',
        intent: {
          intent: 'medicine_refill',
          primaryTask: 'Medicine Refill & Checkout',
          targetProfile: 'Pantocid 40mg Rx (#P-402)',
          servicePlatform: 'Apollo Pharmacy 24/7',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹142.50',
          deliveryAddress: 'Flat 402, Green Acres, Pune',
          approvalRequired: true,
          scenarioKey: 'medicine-refill'
        },
        steps: [
          {
            stage: 1,
            url: 'https://apollo247.com',
            status: 'Listening to spoken intent: "order my Pantocid 40mg"...',
            cursor: { x: 80, y: 120, label: 'Acoustic Stream' },
            badge: 'VOICE STREAM'
          },
          {
            stage: 2,
            url: 'https://apollo247.com/prescriptions/search',
            status: 'Nova Lite decomposing intent & parameters...',
            cursor: { x: 180, y: 90, label: 'Parsing Intent' },
            badge: 'INTENT RECOGNIZED'
          },
          {
            stage: 3,
            url: 'https://apollo247.com/vault/rx-verify',
            status: 'Nova Vision matching prescription (#P-402) on file...',
            cursor: { x: 260, y: 140, label: 'Verifying Rx' },
            badge: 'PRESCRIPTION MATCHED'
          },
          {
            stage: 4,
            url: 'https://apollo247.com/cart/review',
            status: 'Nova Act staged cart: Pantocid 40mg (₹142.50) • Awaiting caregiver approval',
            cursor: { x: 380, y: 220, label: 'Staged for Approval' },
            badge: 'WAITING FOR APPROVAL'
          },
          {
            stage: 5,
            url: 'https://apollo247.com/orders/AP-88402-CONFIRMED',
            status: 'Order dispatched successfully • WhatsApp receipt sent to Rohan',
            cursor: { x: 340, y: 180, label: 'Dispatched ✓' },
            badge: 'TASK COMPLETED'
          }
        ],
        browserContent: {
          title: 'Pantocid 40mg (Strip of 15 Gastro Tablets)',
          desc: 'Apollo Pharmacy Ltd. • Prescription on file (#AP-402-PUNE) • Delivery: Flat 402, Green Acres, Pune',
          price: '₹142.50',
          badge: 'PRESCRIPTION VERIFIED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.10s]', text: 'Spoken request captured: "order my Pantocid 40mg"', status: 'done' },
          { source: 'Nova Lite', time: '[0.28s]', text: 'Parsed intent: pharmacy_order_tool(item="Pantocid 40mg")', status: 'done' },
          { source: 'Nova Vision', time: '[0.65s]', text: 'Prescription matched with Dr. Sharma clinic registry', status: 'done' },
          { source: 'Nova Act', time: '[1.10s]', text: 'Headless browser logged in, cart staged for ₹142.50', status: 'active' },
          { source: 'Family API', time: '[1.30s]', text: 'WhatsApp receipt queued for Rohan (+91 98450...)', status: 'pending' }
        ]
      },

      'ride-clinic': {
        key: 'ride-clinic',
        name: 'Book a Cab',
        utterance: '"Kivo, book my usual cab to Dr. Sharma tomorrow at 10 AM"',
        voice: 'Booking an Uber Premier cab to Dr. Sharma Clinic for tomorrow at 10 AM.',
        intent: {
          intent: 'ride_dispatch',
          primaryTask: 'Clinic Ride Dispatch',
          targetProfile: 'Senior Accessibility Ride',
          servicePlatform: 'Uber Health Premier',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹320.00',
          destination: 'Dr. Sharma Clinic, 100ft Rd, Indiranagar',
          approvalRequired: true,
          scenarioKey: 'ride-clinic'
        },
        steps: [
          {
            stage: 1,
            url: 'https://uber.com/health/request',
            status: 'Listening to spoken intent: "book cab to Dr. Sharma at 10 AM"...',
            cursor: { x: 80, y: 120, label: 'Voice Audio' },
            badge: 'VOICE STREAM'
          },
          {
            stage: 2,
            url: 'https://uber.com/health/destination',
            status: 'Nova Lite resolving destination: Dr. Sharma Clinic, Indiranagar...',
            cursor: { x: 200, y: 100, label: 'Mapping Destination' },
            badge: 'INTENT RECOGNIZED'
          },
          {
            stage: 3,
            url: 'https://uber.com/health/accessibility-check',
            status: 'Nova Vision validating clinic ground-floor wheelchair ramp access...',
            cursor: { x: 270, y: 150, label: 'Checking Access' },
            badge: 'PROFILE VERIFIED'
          },
          {
            stage: 4,
            url: 'https://uber.com/health/dispatch-staged',
            status: 'Nova Act staged Premier ride with Driver Rajesh (Swift Dzire) • Awaiting approval',
            cursor: { x: 380, y: 220, label: 'Awaiting Approval' },
            badge: 'WAITING FOR APPROVAL'
          },
          {
            stage: 5,
            url: 'https://uber.com/trips/UBER-HEALTH-99201',
            status: 'Cab confirmed for 10:00 AM • Live GPS trip link sent to family WhatsApp',
            cursor: { x: 340, y: 180, label: 'Ride Booked ✓' },
            badge: 'TASK COMPLETED'
          }
        ],
        browserContent: {
          title: 'Uber Premier — Dr. Sharma Clinic Drop',
          desc: 'Driver Rajesh (Swift Dzire) • 4.9 ★ • Scheduled: Tomorrow 10:00 AM • Indiranagar Clinic Entrance',
          price: '₹320.00',
          badge: 'RIDE DISPATCH READY'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.12s]', text: 'Voice command captured: "book cab to Dr. Sharma"', status: 'done' },
          { source: 'Nova Lite', time: '[0.30s]', text: 'Destination mapped: 100ft Road Indiranagar Clinic', status: 'done' },
          { source: 'Nova Vision', time: '[0.70s]', text: 'Senior accessibility entrance verified on clinic map', status: 'done' },
          { source: 'Nova Act', time: '[1.05s]', text: 'Uber Health API staged ride (₹320.00)', status: 'active' },
          { source: 'Family API', time: '[1.25s]', text: 'Live GPS trip link sent to family WhatsApp', status: 'pending' }
        ]
      },

      'utility-bill': {
        key: 'utility-bill',
        name: 'Pay a Bill',
        utterance: '"Kivo, pay my electricity bill for this month"',
        voice: 'Paying Bescom electricity bill of ₹1,420 for consumer account 8849201.',
        intent: {
          intent: 'bill_payment',
          primaryTask: 'Electricity Bill Payment',
          targetProfile: 'Consumer ID: 8849201',
          servicePlatform: 'BESCOM Karnataka Portal',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹1,420.00',
          approvalRequired: true,
          scenarioKey: 'utility-bill'
        },
        steps: [
          {
            stage: 1,
            url: 'https://bescom.org/quickpay',
            status: 'Listening to spoken intent: "pay my electricity bill"...',
            cursor: { x: 80, y: 120, label: 'Audio In' },
            badge: 'VOICE STREAM'
          },
          {
            stage: 2,
            url: 'https://bescom.org/quickpay/account',
            status: 'Nova Lite fetching consumer ID 8849201 from caregiver vault...',
            cursor: { x: 190, y: 110, label: 'Vault Query' },
            badge: 'INTENT RECOGNIZED'
          },
          {
            stage: 3,
            url: 'https://bescom.org/quickpay/validate',
            status: 'Nova Vision cross-referencing statement meter units (210 kWh)...',
            cursor: { x: 280, y: 160, label: 'Validating Statement' },
            badge: 'BILL VERIFIED'
          },
          {
            stage: 4,
            url: 'https://bescom.org/quickpay/checkout',
            status: 'Nova Act staged payment gateway (₹1,420.00) • Awaiting caregiver approval',
            cursor: { x: 380, y: 220, label: 'Awaiting Approval' },
            badge: 'WAITING FOR APPROVAL'
          },
          {
            stage: 5,
            url: 'https://bescom.org/receipt/BESCOM-992140',
            status: 'Electricity bill paid in full • PDF receipt stored and sent to WhatsApp',
            cursor: { x: 340, y: 180, label: 'Paid ✓' },
            badge: 'TASK COMPLETED'
          }
        ],
        browserContent: {
          title: 'Electricity Bill — BESCOM Account #8849201',
          desc: 'Consumer: Vishal Khadatare • Meter Units: 210 kWh • Due: Sept 24 • Auto-receipt generated',
          price: '₹1,420.00',
          badge: 'BILL VERIFIED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.10s]', text: 'Voice intent captured: "pay electricity bill"', status: 'done' },
          { source: 'Nova Lite', time: '[0.26s]', text: 'Fetched Bescom account: 8849201', status: 'done' },
          { source: 'Nova Vision', time: '[0.60s]', text: 'Validated meter ID against historical PDF statement', status: 'done' },
          { source: 'Nova Act', time: '[1.00s]', text: 'Staged payment gateway authorization', status: 'active' },
          { source: 'Family API', time: '[1.20s]', text: 'Receipt and paid status stored for family record', status: 'pending' }
        ]
      },

      'grocery-restock': {
        key: 'grocery-restock',
        name: 'Grocery Essentials',
        utterance: '"Kivo, get two liters of toned milk and whole wheat bread"',
        voice: 'Adding two liters of Amul toned milk and fresh wheat bread to BigBasket cart.',
        intent: {
          intent: 'grocery_restock',
          primaryTask: 'Grocery Restock Cart',
          targetProfile: 'Standard Pantry List',
          servicePlatform: 'BigBasket Express',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹165.00',
          approvalRequired: true,
          scenarioKey: 'grocery-restock'
        },
        steps: [
          {
            stage: 1,
            url: 'https://bigbasket.com/express',
            status: 'Listening to spoken intent: "get toned milk and bread"...',
            cursor: { x: 80, y: 120, label: 'Audio In' },
            badge: 'VOICE STREAM'
          },
          {
            stage: 2,
            url: 'https://bigbasket.com/cart',
            status: 'Nova Lite mapping pantry preferences: Amul Taaza 2L + Whole Wheat Bread...',
            cursor: { x: 200, y: 100, label: 'Mapping Items' },
            badge: 'INTENT RECOGNIZED'
          },
          {
            stage: 3,
            url: 'https://bigbasket.com/cart/brand-match',
            status: 'Nova Vision matching brand barcodes against kitchen inventory...',
            cursor: { x: 280, y: 140, label: 'Barcodes Matched' },
            badge: 'ITEMS VERIFIED'
          },
          {
            stage: 4,
            url: 'https://bigbasket.com/checkout/instant',
            status: 'Nova Act BigBasket cart ready (₹165.00) • Slot: Today 4:00 PM • Awaiting approval',
            cursor: { x: 380, y: 220, label: 'Awaiting Approval' },
            badge: 'WAITING FOR APPROVAL'
          },
          {
            stage: 5,
            url: 'https://bigbasket.com/orders/BB-EXPRESS-9921',
            status: 'Grocery restock order placed • Family WhatsApp summary sent',
            cursor: { x: 340, y: 180, label: 'Order Placed ✓' },
            badge: 'TASK COMPLETED'
          }
        ],
        browserContent: {
          title: 'Amul Taaza 2L Milk + Whole Wheat Bread',
          desc: 'BigBasket Express Delivery • Slot: Today 4:00 PM • Delivery to Pune Home',
          price: '₹165.00',
          badge: 'INSTANT RESTOCK'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.08s]', text: 'Voice parsed: "get 2 liters toned milk and bread"', status: 'done' },
          { source: 'Nova Lite', time: '[0.25s]', text: 'Mapped pantry preferences: Amul Taaza & Harvest Gold', status: 'done' },
          { source: 'Nova Vision', time: '[0.55s]', text: 'Brand packaging barcodes matched with kitchen inventory', status: 'done' },
          { source: 'Nova Act', time: '[0.95s]', text: 'BigBasket cart checkout ready (₹165.00)', status: 'active' },
          { source: 'Family API', time: '[1.20s]', text: 'Caregiver grocery summary dispatched via WhatsApp', status: 'pending' }
        ]
      },

      'flight-status': {
        key: 'flight-status',
        name: 'Flight Status',
        utterance: '"Kivo, check if Rohan\'s flight from San Francisco is on time"',
        voice: 'Flight DL284 from San Francisco is delayed by two hours, landing at 9:30 PM.',
        intent: {
          intent: 'flight_telemetry',
          primaryTask: 'Flight Delay Telemetry',
          targetProfile: 'Family Passenger: Rohan',
          servicePlatform: 'FlightRadar24 Stream',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹0.00',
          approvalRequired: false,
          scenarioKey: 'flight-status'
        },
        steps: [
          {
            stage: 1,
            url: 'https://flightradar24.com',
            status: 'Listening to spoken intent: "check flight from San Francisco"...',
            cursor: { x: 80, y: 120, label: 'Audio In' },
            badge: 'VOICE STREAM'
          },
          {
            stage: 2,
            url: 'https://flightradar24.com/live/DL284',
            status: 'Nova Lite querying aviation telemetry for DL284...',
            cursor: { x: 200, y: 100, label: 'Tracking Flight' },
            badge: 'INTENT RECOGNIZED'
          },
          {
            stage: 3,
            url: 'https://flightradar24.com/live/terminal-b12',
            status: 'Nova Vision parsing arrival board: 120 min delay detected...',
            cursor: { x: 280, y: 150, label: 'Delay Detected' },
            badge: 'DELAY VERIFIED'
          },
          {
            stage: 4,
            url: 'https://uber.com/health/auto-reschedule',
            status: 'Nova Act automatically adjusted airport clinic taxi arrival to 9:30 PM...',
            cursor: { x: 380, y: 220, label: 'Auto Rescheduling' },
            badge: 'AUTO ACTION'
          },
          {
            stage: 5,
            url: 'https://whatsapp.com/family-alert/DL284-DELAY',
            status: 'Alert sent: "Flight delayed by 2h, airport cab safely updated to 9:30 PM"',
            cursor: { x: 340, y: 180, label: 'Alert Sent ✓' },
            badge: 'TASK COMPLETED'
          }
        ],
        browserContent: {
          title: 'Flight DL284 (SFO → BLR) Delayed 120m',
          desc: 'Gate B12 • New ETA: 9:30 PM IST • Airport taxi automatically rescheduled',
          price: 'Free',
          badge: 'TELEMETRY ACTIVE'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.09s]', text: 'Spoken request: "check Rohan flight from SF"', status: 'done' },
          { source: 'Nova Lite', time: '[0.27s]', text: 'Queried flight radar for DL284 passenger Rohan', status: 'done' },
          { source: 'Nova Vision', time: '[0.65s]', text: 'Parsed airport terminal board display', status: 'done' },
          { source: 'Nova Act', time: '[1.00s]', text: 'Automatically adjusted clinic taxi arrival by +2 hours', status: 'active' },
          { source: 'Family API', time: '[1.15s]', text: 'Alert sent: "Flight delayed, airport cab updated"', status: 'done' }
        ]
      }
    };

    // State Variables
    let activeScenarioKey = 'medicine-refill';
    let currentStageIndex = 0; // 0 to 4 (stages 1 to 5)
    let isAutoPlaying = false;
    let autoPlayTimer = null;
    let demoSpeed = 1.0;
    let isListening = false;
    let isSpeaking = false;
    let isOrderProcessing = false;
    let speechRecognitionInstance = null;

    // Service Layer: Orders
    const orderService = {
      async createOrder(scenarioKey) {
        const s = demoScenarios[scenarioKey];
        if (!s) return null;
        const amountNum = parseFloat(s.intent.totalCharge.replace(/[^0-9.]/g, '')) || 0.0;
        const newOrder = {
          id: Date.now(),
          scenario_key: scenarioKey,
          service_name: s.intent.servicePlatform,
          title: s.browserContent.title,
          amount: amountNum,
          currency: 'INR',
          status: 'CONFIRMED',
          family_alert_sent: true,
          created_at: new Date().toISOString()
        };

        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newOrder)
          });
        } catch (e) {}

        // Add to local history & update profile view
        notificationService.addNotification({
          title: `✓ ${s.name} Completed`,
          message: `${s.browserContent.title} (${s.intent.totalCharge}) confirmed and dispatched.`,
          type: 'order_confirmed'
        });

        updateProfileRecentActivity(`${s.browserContent.title} (${s.intent.totalCharge})`);
        return newOrder;
      }
    };

    // Service Layer: Notifications
    const notificationService = {
      addNotification(item) {
        const list = document.getElementById('notifications-list');
        const dot = document.getElementById('nav-notif-dot');
        if (dot) dot.classList.remove('hidden');

        if (list) {
          const card = document.createElement('div');
          card.className = 'p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 animate-[loadFadeUp_0.3s_ease_both]';
          card.innerHTML = `
            <div class="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>${item.title}</span>
              <span class="text-[10px] text-emerald-700 font-mono">Just now</span>
            </div>
            <p class="text-xs text-emerald-800">${item.message}</p>
          `;
          list.insertBefore(card, list.firstChild);
        }
      }
    };

    function updateProfileRecentActivity(text) {
      const el = document.getElementById('profile-recent-activity');
      if (!el) return;
      const row = document.createElement('div');
      row.className = 'p-3 rounded-xl bg-kivo-surfacePanel border border-kivo-border flex justify-between items-center';
      row.innerHTML = `<span>${text}</span><span class="text-emerald-700 font-bold font-mono">✓ Completed</span>`;
      el.insertBefore(row, el.firstChild);
    }

    // Select Scenario
    function selectDemoScenario(key) {
      if (!demoScenarios[key]) return;
      activeScenarioKey = key;
      currentStageIndex = 0;
      stopAutoPlay();

      const s = demoScenarios[key];

      // Update Tab Buttons
      ['medicine', 'ride', 'utility', 'grocery', 'flight'].forEach(type => {
        const pill = document.getElementById(`pill-scenario-${type}`);
        if (!pill) return;
        const match = (type === 'medicine' && key === 'medicine-refill') ||
                      (type === 'ride' && key === 'ride-clinic') ||
                      (type === 'utility' && key === 'utility-bill') ||
                      (type === 'grocery' && key === 'grocery-restock') ||
                      (type === 'flight' && key === 'flight-status');
        if (match) {
          pill.className = 'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-kivo-teal text-slate-950 shadow-kivo-sm border border-kivo-teal';
          pill.setAttribute('aria-selected', 'true');
        } else {
          pill.className = 'px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm';
          pill.setAttribute('aria-selected', 'false');
        }
      });

      // Update Utterance
      const utteranceEl = document.getElementById('demo-spoken-utterance');
      if (utteranceEl) utteranceEl.innerText = s.utterance;

      // Update Intent Cards
      const taskEl = document.getElementById('demo-intent-task');
      const profEl = document.getElementById('demo-intent-profile');
      const platEl = document.getElementById('demo-intent-platform');
      const alertEl = document.getElementById('demo-intent-alert');
      if (taskEl) taskEl.innerText = s.intent.primaryTask;
      if (profEl) profEl.innerText = s.intent.targetProfile;
      if (platEl) platEl.innerText = s.intent.servicePlatform;
      if (alertEl) alertEl.innerText = s.intent.familyAlert;

      // Update JSON Viewer
      const jsonEl = document.getElementById('demo-intent-json');
      if (jsonEl) jsonEl.innerText = JSON.stringify(s.intent, null, 2);

      // Render Stage 0 (Stage 1 Active)
      renderStage(0);
    }

    // Render Stage (0 to 4)
    function renderStage(stageIdx) {
      currentStageIndex = stageIdx;
      const s = demoScenarios[activeScenarioKey];
      if (!s) return;
      const step = s.steps[stageIdx] || s.steps[0];

      // Update 5-Stage Progress Bar UI
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`stage-step-${i}`);
        if (!el) continue;
        if (i - 1 < stageIdx) {
          el.className = 'stage-pill-completed py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5';
          el.innerHTML = `<span>✓ ${i}. ${getStageName(i)}</span>`;
        } else if (i - 1 === stageIdx) {
          el.className = 'stage-pill-active py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5';
          el.innerHTML = `<span>● ${i}. ${getStageName(i)}</span>`;
        } else {
          el.className = 'stage-pill-pending py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5';
          el.innerHTML = `<span>${i}. ${getStageName(i)}</span>`;
        }
      }

      // Update Browser Simulator Chrome
      const urlEl = document.getElementById('demo-browser-url');
      const badgeEl = document.getElementById('demo-browser-live-badge');
      const stepStatusEl = document.getElementById('demo-live-step-status');
      const globalStatus = document.getElementById('demo-global-status-badge');
      const voicePill = document.getElementById('demo-voice-state-pill');

      if (urlEl) urlEl.innerText = step.url;
      if (badgeEl) badgeEl.innerText = step.badge;
      if (stepStatusEl) stepStatusEl.innerText = step.status;
      if (globalStatus) globalStatus.innerText = step.badge;
      if (voicePill) voicePill.innerText = `STAGE ${stageIdx + 1} OF 5`;

      // Update Browser Content Card
      const titleEl = document.getElementById('demo-service-title');
      const descEl = document.getElementById('demo-service-desc');
      const priceEl = document.getElementById('demo-service-price');
      const cardBadge = document.getElementById('demo-service-badge');

      if (titleEl) titleEl.innerText = s.browserContent.title;
      if (descEl) descEl.innerText = s.browserContent.desc;
      if (priceEl) priceEl.innerText = s.intent.totalCharge;
      if (cardBadge) cardBadge.innerText = s.browserContent.badge;

      // Update Approval Card & Buttons
      const approvalCard = document.getElementById('demo-approval-card');
      const dispatchBtn = document.getElementById('btn-dispatch-order');
      const cancelBtn = document.getElementById('btn-cancel-order');

      if (stageIdx === 4) {
        // Stage 5: Completed
        if (dispatchBtn) {
          dispatchBtn.innerText = '✓ Order Confirmed & Dispatched';
          dispatchBtn.className = 'px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-sm cursor-default';
          dispatchBtn.disabled = true;
        }
        if (cancelBtn) cancelBtn.classList.add('hidden');
      } else {
        if (dispatchBtn) {
          dispatchBtn.innerText = 'Confirm & Dispatch Order';
          dispatchBtn.className = 'px-5 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 text-xs font-extrabold shadow-kivo-sm transition-all cta-press';
          dispatchBtn.disabled = false;
        }
        if (cancelBtn) cancelBtn.classList.remove('hidden');
      }

      // Animate AI Cursor
      animateAiCursor(step.cursor);

      // Render Activity Stream up to current stage
      renderActivityStreamProgressive(stageIdx);
    }

    function getStageName(idx) {
      const names = ['', 'Voice Stream', 'Intent & Risk', 'Vision/Vault', 'Browser Act', 'Family Alert'];
      return names[idx] || '';
    }

    // Animate AI Cursor Position
    function animateAiCursor(cursor) {
      const cursorEl = document.getElementById('live-ai-cursor');
      const tooltipEl = document.getElementById('cursor-tooltip');
      if (!cursorEl || !cursor) return;

      cursorEl.style.transform = `translate(${cursor.x}px, ${cursor.y}px)`;
      if (tooltipEl && cursor.label) {
        tooltipEl.innerText = cursor.label;
      }

      // Add click ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'cursor-ripple absolute w-6 h-6 rounded-full bg-purple-500/40 pointer-events-none -left-1 -top-1';
      cursorEl.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    // Progressive Activity Stream
    function renderActivityStreamProgressive(stageIdx) {
      const s = demoScenarios[activeScenarioKey];
      if (!s) return;
      const streamEl = document.getElementById('demo-activity-stream');
      if (!streamEl) return;
      streamEl.innerHTML = '';

      s.activity.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'p-3 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center justify-between text-xs transition-all';

        let statusType = 'pending';
        if (index < stageIdx) statusType = 'done';
        else if (index === stageIdx) statusType = 'active';

        const isDone = statusType === 'done';
        const isActive = statusType === 'active';

        row.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${isDone ? 'bg-emerald-100 text-emerald-700' : (isActive ? 'bg-purple-100 text-purple-700 animate-pulse' : 'bg-slate-200 text-slate-500')}">
              ${isDone ? '✓' : (isActive ? '●' : '○')}
            </span>
            <span class="font-bold text-kivo-text font-display">${item.source}</span>
            <span class="text-kivo-textSecondary truncate">${item.text}</span>
          </div>
          <span class="text-[10px] font-mono font-bold text-kivo-textMuted flex-shrink-0 ml-2">${isDone ? item.time : (isActive ? 'RUNNING' : 'QUEUED')}</span>
        `;
        streamEl.appendChild(row);
      });
    }

    // Next Step
    function advanceNextStage() {
      if (currentStageIndex < 4) {
        renderStage(currentStageIndex + 1);
        if (currentStageIndex === 4) {
          orderService.createOrder(activeScenarioKey);
        }
      } else {
        renderStage(0);
      }
    }

    // Auto-Play
    function toggleAutoPlay() {
      if (isAutoPlaying) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    }

    function startAutoPlay() {
      isAutoPlaying = true;
      const label = document.getElementById('label-autoplay');
      const icon = document.getElementById('icon-autoplay');
      if (label) label.innerText = 'Pause Workflow';
      if (icon) icon.innerText = '⏸';

      function stepCycle() {
        if (!isAutoPlaying) return;
        if (currentStageIndex < 4) {
          advanceNextStage();
          const baseDelay = (currentStageIndex === 3) ? 2200 : 1600;
          autoPlayTimer = setTimeout(stepCycle, baseDelay / demoSpeed);
        } else {
          stopAutoPlay();
        }
      }

      autoPlayTimer = setTimeout(stepCycle, 1500 / demoSpeed);
    }

    function stopAutoPlay() {
      isAutoPlaying = false;
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer);
        autoPlayTimer = null;
      }
      const label = document.getElementById('label-autoplay');
      const icon = document.getElementById('icon-autoplay');
      if (label) label.innerText = 'Auto-Play Workflow';
      if (icon) icon.innerText = '▶';
    }

    function setDemoSpeed(speed) {
      demoSpeed = speed;
      [0.5, 1.0, 1.5, 2.0].forEach(s => {
        const id = `speed-${String(s).replace('.', '')}`;
        const btn = document.getElementById(id);
        if (!btn) return;
        if (s === speed) {
          btn.className = 'px-1.5 py-0.5 rounded bg-kivo-teal text-slate-950 font-bold';
        } else {
          btn.className = 'px-1.5 py-0.5 rounded text-kivo-textSecondary hover:text-kivo-text';
        }
      });
    }

    function resetDemoSession() {
      stopAutoPlay();
      selectDemoScenario(activeScenarioKey);
    }

    function rerunActiveSimulation() {
      stopAutoPlay();
      renderStage(0);
      startAutoPlay();
    }

    // Caregiver Order Actions
    async function confirmAndDispatchOrder() {
      if (isOrderProcessing) return;
      isOrderProcessing = true;
      const btn = document.getElementById('btn-dispatch-order');
      if (btn) {
        btn.innerText = 'Processing Dispatch...';
        btn.disabled = true;
      }

      setTimeout(async () => {
        await orderService.createOrder(activeScenarioKey);
        renderStage(4);
        isOrderProcessing = false;
      }, 700 / demoSpeed);
    }

    function cancelPendingOrder() {
      stopAutoPlay();
      const statusEl = document.getElementById('demo-live-step-status');
      const globalStatus = document.getElementById('demo-global-status-badge');
      const btn = document.getElementById('btn-dispatch-order');

      if (statusEl) statusEl.innerText = 'Action cancelled by caregiver. Safe state preserved.';
      if (globalStatus) globalStatus.innerText = 'CANCELLED';
      if (btn) {
        btn.innerText = 'Action Cancelled';
        btn.className = 'px-5 py-2 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold';
        btn.disabled = true;
      }
    }

    function toggleNovaIntentJson() {
      const viewer = document.getElementById('demo-json-viewer');
      const chevron = document.getElementById('demo-json-chevron');
      if (!viewer) return;
      if (viewer.classList.contains('hidden')) {
        viewer.classList.remove('hidden');
        if (chevron) chevron.innerText = '▲';
      } else {
        viewer.classList.add('hidden');
        if (chevron) chevron.innerText = '▼';
      }
    }

    function copyNovaIntentJson() {
      const jsonEl = document.getElementById('demo-intent-json');
      const label = document.getElementById('label-copy-json');
      if (!jsonEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(jsonEl.innerText).then(() => {
        if (label) {
          label.innerText = '✓ Copied!';
          setTimeout(() => { label.innerText = '📋 Copy JSON'; }, 2000);
        }
      });
    }

    // Custom text input fallback
    function handleCustomTextVoiceSubmit() {
      const input = document.getElementById('custom-voice-text-input');
      const val = input ? input.value.trim() : '';
      if (!val) return;

      const utteranceEl = document.getElementById('demo-spoken-utterance');
      if (utteranceEl) utteranceEl.innerText = `"${val}"`;
      input.value = '';

      const lower = val.toLowerCase();
      if (lower.includes('cab') || lower.includes('taxi') || lower.includes('clinic') || lower.includes('uber')) {
        selectDemoScenario('ride-clinic');
      } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('power')) {
        selectDemoScenario('utility-bill');
      } else if (lower.includes('milk') || lower.includes('bread') || lower.includes('grocery')) {
        selectDemoScenario('grocery-restock');
      } else if (lower.includes('flight') || lower.includes('plane') || lower.includes('airport')) {
        selectDemoScenario('flight-status');
      } else {
        selectDemoScenario('medicine-refill');
      }
      startAutoPlay();
    }

    // Speech Recognition
    function toggleVoiceRecognition() {
      const label = document.getElementById('label-speak-mic');
      const soundWaveWrap = document.getElementById('demo-soundwave-wrap');
      const pulseRing = document.getElementById('mic-pulse-ring');

      if (isListening) {
        if (speechRecognitionInstance) {
          try { speechRecognitionInstance.stop(); } catch(e) {}
        }
        isListening = false;
        if (label) label.innerText = 'Speak With Mic';
        if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
        if (pulseRing) pulseRing.classList.add('hidden');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Microphone voice recognition is unavailable in this browser. Please use the text input below.");
        return;
      }

      try {
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.continuous = false;
        speechRecognitionInstance.interimResults = true;
        speechRecognitionInstance.lang = 'en-US';

        speechRecognitionInstance.onstart = () => {
          isListening = true;
          if (label) label.innerText = '● Listening...';
          if (soundWaveWrap) soundWaveWrap.classList.remove('hidden');
          if (pulseRing) pulseRing.classList.remove('hidden');
        };

        speechRecognitionInstance.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          const utteranceEl = document.getElementById('demo-spoken-utterance');
          if (utteranceEl) utteranceEl.innerText = `"${transcript}"`;

          const lower = transcript.toLowerCase();
          if (lower.includes('cab') || lower.includes('taxi') || lower.includes('clinic')) {
            selectDemoScenario('ride-clinic');
          } else if (lower.includes('bill') || lower.includes('electricity')) {
            selectDemoScenario('utility-bill');
          } else if (lower.includes('milk') || lower.includes('bread') || lower.includes('grocery')) {
            selectDemoScenario('grocery-restock');
          } else if (lower.includes('flight') || lower.includes('plane')) {
            selectDemoScenario('flight-status');
          } else {
            selectDemoScenario('medicine-refill');
          }
        };

        speechRecognitionInstance.onend = () => {
          isListening = false;
          if (label) label.innerText = 'Speak With Mic';
          if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
          if (pulseRing) pulseRing.classList.add('hidden');
          startAutoPlay();
        };

        speechRecognitionInstance.onerror = () => {
          isListening = false;
          if (label) label.innerText = 'Speak With Mic';
          if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
          if (pulseRing) pulseRing.classList.add('hidden');
        };

        speechRecognitionInstance.start();
      } catch (err) {
        console.warn('Speech Recognition error:', err);
      }
    }

    // Voice Synthesis Playback
    function toggleDemoVoicePlayback() {
      const label = document.getElementById('label-listen-voice');
      const icon = document.getElementById('icon-listen-voice');
      const soundWaveWrap = document.getElementById('demo-soundwave-wrap');

      if (isSpeaking) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        isSpeaking = false;
        if (label) label.innerText = 'Listen Voice';
        if (icon) icon.innerText = '🔊';
        if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
        return;
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const s = demoScenarios[activeScenarioKey];
        const text = s ? s.voice : "Kivo is ready to assist you.";

        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.94;
        u.pitch = 1.0;

        isSpeaking = true;
        if (label) label.innerText = 'Stop Voice';
        if (icon) icon.innerText = '■';
        if (soundWaveWrap) soundWaveWrap.classList.remove('hidden');

        u.onend = () => {
          isSpeaking = false;
          if (label) label.innerText = 'Listen Voice';
          if (icon) icon.innerText = '🔊';
          if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
        };
        u.onerror = () => {
          isSpeaking = false;
          if (label) label.innerText = 'Listen Voice';
          if (icon) icon.innerText = '🔊';
          if (soundWaveWrap) soundWaveWrap.classList.add('hidden');
        };

        window.speechSynthesis.speak(u);
      }
    }

    // Scroll Helper
    function scrollToLiveDemo() {
      closeAuth();
      closeProfileModal();
      closeSettingsModal();
      closeNotificationsModal();
      closeUpgradeModal();
      closeBillingModal();
      closeProfileDropdown();

      const demo = document.getElementById('live-demo');
      if (demo) {
        demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          const micBtn = document.getElementById('btn-speak-mic');
          if (micBtn) {
            micBtn.classList.add('ring-4', 'ring-kivo-teal/50');
            setTimeout(() => micBtn.classList.remove('ring-4', 'ring-kivo-teal/50'), 2000);
          }
        }, 500);
      }
    }

    // ROI Calculator Engine
    function updateRoiCalculation() {
      const seniorsInput = document.getElementById('slider-seniors');
      const tasksInput = document.getElementById('slider-tasks');
      const labelSeniors = document.getElementById('label-val-seniors');
      const labelTasks = document.getElementById('label-val-tasks');
      const hoursSavedEl = document.getElementById('roi-hours-saved');
      const daysSavedEl = document.getElementById('roi-days-saved');

      const seniors = parseInt(seniorsInput ? seniorsInput.value : 2, 10);
      const tasks = parseInt(tasksInput ? tasksInput.value : 12, 10);

      if (labelSeniors) labelSeniors.innerText = `${seniors} Senior${seniors > 1 ? 's' : ''}`;
      if (labelTasks) labelTasks.innerText = `${tasks} Tasks`;

      const totalHours = Math.round(seniors * tasks * 12 * 0.25);
      const daysSaved = Math.max(1, Math.round(totalHours / 8));

      if (hoursSavedEl) hoursSavedEl.innerText = `${totalHours} hrs`;
      if (daysSavedEl) daysSavedEl.innerText = `${daysSaved} Days`;
    }

    // Senior Mode Toggle
    let seniorModeActive = false;
    function toggleSeniorMode() {
      seniorModeActive = !seniorModeActive;
      if (seniorModeActive) {
        document.body.classList.add('senior-mode-active');
      } else {
        document.body.classList.remove('senior-mode-active');
      }
    }

    // AUTHENTICATION & POSTGRESQL API INTEGRATION
    let currentAuthTab = 'signup';

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').toLowerCase().trim());
    }

    function showAuthError(msg) {
      const banner = document.getElementById('auth-global-error');
      const label = document.getElementById('auth-global-error-msg');
      if (label) label.innerText = msg || 'An error occurred.';
      if (banner) banner.classList.remove('hidden');
    }

    function dismissAuthError() {
      const banner = document.getElementById('auth-global-error');
      if (banner) banner.classList.add('hidden');
    }

    function switchAuthTab(tab) {
      currentAuthTab = tab;
      dismissAuthError();

      const title = document.getElementById('auth-header-title');
      const subtitle = document.getElementById('auth-header-subtitle');
      const tabSignin = document.getElementById('tab-btn-signin');
      const tabSignup = document.getElementById('tab-btn-signup');
      const viewSignup = document.getElementById('auth-view-signup');
      const viewSignin = document.getElementById('auth-view-signin');
      const viewForgot = document.getElementById('auth-view-forgot');
      const viewSuccess = document.getElementById('auth-view-success');

      if (viewForgot) viewForgot.classList.add('hidden');
      if (viewSuccess) viewSuccess.classList.add('hidden');

      if (tab === 'signin') {
        if (title) title.innerText = 'Sign in to Kivo';
        if (subtitle) subtitle.innerText = 'Welcome back to your caretaker portal.';
        if (tabSignin) tabSignin.className = 'py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm transition-all cta-press text-center';
        if (tabSignup) tabSignup.className = 'py-2.5 rounded-xl text-xs font-semibold text-kivo-textSecondary hover:text-kivo-text transition-all cta-press text-center';
        if (viewSignup) viewSignup.classList.add('hidden');
        if (viewSignin) viewSignin.classList.remove('hidden');
      } else {
        if (title) title.innerText = 'Sign up for Kivo';
        if (subtitle) subtitle.innerText = 'Start your 7-day free trial today.';
        if (tabSignup) tabSignup.className = 'py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm transition-all cta-press text-center';
        if (tabSignin) tabSignin.className = 'py-2.5 rounded-xl text-xs font-semibold text-kivo-textSecondary hover:text-kivo-text transition-all cta-press text-center';
        if (viewSignin) viewSignin.classList.add('hidden');
        if (viewSignup) viewSignup.classList.remove('hidden');
      }
    }

    function showForgotPasswordView() {
      dismissAuthError();
      const viewSignup = document.getElementById('auth-view-signup');
      const viewSignin = document.getElementById('auth-view-signin');
      const viewForgot = document.getElementById('auth-view-forgot');
      if (viewSignup) viewSignup.classList.add('hidden');
      if (viewSignin) viewSignin.classList.add('hidden');
      if (viewForgot) viewForgot.classList.remove('hidden');
    }

    function openAuth(tab = 'signup') {
      document.body.classList.add('auth-mode-active');
      switchAuthTab(tab);
    }

    function closeAuth() {
      document.body.classList.remove('auth-mode-active');
    }

    async function handleSignup(e) {
      e.preventDefault();
      dismissAuthError();

      const nameInput = document.getElementById('signup-name');
      const emailInput = document.getElementById('signup-email');
      const pwInput = document.getElementById('signup-password');
      const confirmInput = document.getElementById('signup-confirm-password');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = pwInput ? pwInput.value : '';
      const confirmPw = confirmInput ? confirmInput.value : '';

      if (!name) { showAuthError('Please enter your full name.'); return; }
      if (!validateEmail(email)) { showAuthError('Please enter a valid email address.'); return; }
      if (password.length < 8) { showAuthError('Password must be at least 8 characters long.'); return; }
      if (password !== confirmPw) { showAuthError('Passwords do not match.'); return; }

      const btn = document.getElementById('btn-submit-signup');
      const label = document.getElementById('label-signup-btn');
      const spinner = document.getElementById('spinner-signup');

      if (btn) btn.disabled = true;
      if (label) label.innerText = 'Creating account in PostgreSQL...';
      if (spinner) spinner.classList.remove('hidden');

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            role: 'Primary Caregiver'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          showAuthError(data.detail || 'Sign up failed. Please try again.');
          if (btn) btn.disabled = false;
          if (label) label.innerText = 'Create Free Kivo Account';
          if (spinner) spinner.classList.add('hidden');
          return;
        }

        const userData = data.user || { name, email, initials: 'VK', role: 'Primary Caregiver' };
        setCurrentUser(userData);

        if (btn) btn.disabled = false;
        if (label) label.innerText = 'Create Free Kivo Account';
        if (spinner) spinner.classList.add('hidden');

        const viewSignup = document.getElementById('auth-view-signup');
        const viewSuccess = document.getElementById('auth-view-success');
        const titleSuccess = document.getElementById('auth-success-title');
        const subtitleSuccess = document.getElementById('auth-success-subtitle');

        if (viewSignup) viewSignup.classList.add('hidden');
        if (titleSuccess) titleSuccess.innerText = 'Account Created in PostgreSQL';
        if (subtitleSuccess) subtitleSuccess.innerText = `Welcome to Kivo, ${userData.name || name}.`;
        if (viewSuccess) viewSuccess.classList.remove('hidden');

        setTimeout(() => {
          closeAuth();
          renderAuthState(userData);
        }, 1100);

      } catch (err) {
        showAuthError('Unable to connect to backend server. Please verify it is running.');
        if (btn) btn.disabled = false;
        if (label) label.innerText = 'Create Free Kivo Account';
        if (spinner) spinner.classList.add('hidden');
      }
    }

    async function handleSignin(e) {
      e.preventDefault();
      dismissAuthError();

      const emailInput = document.getElementById('signin-email');
      const pwInput = document.getElementById('signin-password');

      const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
      const password = pwInput ? pwInput.value : '';

      if (!validateEmail(email)) { showAuthError('Please enter a valid email address.'); return; }
      if (!password) { showAuthError('Please enter your password.'); return; }

      const btn = document.getElementById('btn-submit-signin');
      const label = document.getElementById('label-signin-btn');
      const spinner = document.getElementById('spinner-signin');

      if (btn) btn.disabled = true;
      if (label) label.innerText = 'Verifying credentials in PostgreSQL...';
      if (spinner) spinner.classList.remove('hidden');

      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          showAuthError(data.detail || 'Invalid email or password.');
          if (btn) btn.disabled = false;
          if (label) label.innerText = 'Sign In to Kivo';
          if (spinner) spinner.classList.add('hidden');
          return;
        }

        const userData = data.user;
        setCurrentUser(userData);

        if (btn) btn.disabled = false;
        if (label) label.innerText = 'Sign In to Kivo';
        if (spinner) spinner.classList.add('hidden');

        const viewSignin = document.getElementById('auth-view-signin');
        const viewSuccess = document.getElementById('auth-view-success');
        const titleSuccess = document.getElementById('auth-success-title');
        const subtitleSuccess = document.getElementById('auth-success-subtitle');

        if (viewSignin) viewSignin.classList.add('hidden');
        if (titleSuccess) titleSuccess.innerText = 'Verified & Signed In';
        if (subtitleSuccess) subtitleSuccess.innerText = `Welcome back, ${userData.name || 'Caregiver'}.`;
        if (viewSuccess) viewSuccess.classList.remove('hidden');

        setTimeout(() => {
          closeAuth();
          renderAuthState(userData);
        }, 1100);

      } catch (err) {
        showAuthError('Unable to connect to backend server. Please verify it is running.');
        if (btn) btn.disabled = false;
        if (label) label.innerText = 'Sign In to Kivo';
        if (spinner) spinner.classList.add('hidden');
      }
    }

    function handleForgotPassword(e) {
      e.preventDefault();
      const banner = document.getElementById('forgot-success-banner');
      if (banner) banner.classList.remove('hidden');
    }

    // User State Storage Helpers
    function getCurrentUser() {
      try {
        const stored = localStorage.getItem('kivo_auth_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) return parsed;
        }
      } catch (e) {}
      return null;
    }

    function setCurrentUser(user) {
      try {
        localStorage.setItem('kivo_auth_user', JSON.stringify(user));
      } catch (e) {}
    }

    function clearCurrentUser() {
      try {
        localStorage.removeItem('kivo_auth_user');
      } catch (e) {}
    }

    function renderAuthState(user) {
      const navLoggedOut = document.getElementById('nav-logged-out');
      const navLoggedIn = document.getElementById('nav-logged-in');

      if (user) {
        if (navLoggedOut) navLoggedOut.classList.add('hidden');
        if (navLoggedIn) navLoggedIn.classList.remove('hidden');

        const navAvatar = document.getElementById('nav-avatar-initials');
        const navName = document.getElementById('nav-profile-firstname');
        const ddAvatar = document.getElementById('dropdown-avatar-initials');
        const ddFullName = document.getElementById('dropdown-fullname');
        const ddEmail = document.getElementById('dropdown-email');
        const modalAvatar = document.getElementById('modal-profile-initials');
        const modalFullName = document.getElementById('modal-profile-fullname-display');
        const modalEmail = document.getElementById('modal-profile-email-display');
        const editNameInput = document.getElementById('edit-profile-name');
        const editEmailInput = document.getElementById('edit-profile-email');

        const initials = user.initials || 'VK';
        const fullName = user.name || user.full_name || 'Vishal Khadatare';
        const firstName = user.first_name || fullName.split(' ')[0] || 'Vishal';
        const email = user.email || 'vishal@email.com';

        if (navAvatar) navAvatar.innerText = initials;
        if (navName) navName.innerText = firstName;
        if (ddAvatar) ddAvatar.innerText = initials;
        if (ddFullName) ddFullName.innerText = fullName;
        if (ddEmail) ddEmail.innerText = email;
        if (modalAvatar) modalAvatar.innerText = initials;
        if (modalFullName) modalFullName.innerText = fullName;
        if (modalEmail) modalEmail.innerText = email;
        if (editNameInput) editNameInput.value = fullName;
        if (editEmailInput) editEmailInput.value = email;
      } else {
        if (navLoggedIn) navLoggedIn.classList.add('hidden');
        if (navLoggedOut) navLoggedOut.classList.remove('hidden');
      }
    }

    function handleSignOut() {
      clearCurrentUser();
      closeProfileDropdown();
      closeProfileModal();
      closeSettingsModal();
      closeNotificationsModal();
      closeUpgradeModal();
      closeBillingModal();
      renderAuthState(null);
    }

    // Profile Dropdown
    function toggleProfileDropdown(e) {
      if (e) e.stopPropagation();
      const dd = document.getElementById('nav-profile-dropdown');
      const chevron = document.getElementById('nav-profile-chevron');
      if (!dd) return;
      if (dd.classList.contains('dropdown-hidden')) {
        dd.classList.remove('dropdown-hidden');
        dd.classList.add('dropdown-visible');
        if (chevron) chevron.classList.add('rotate-180');
      } else {
        closeProfileDropdown();
      }
    }

    function closeProfileDropdown() {
      const dd = document.getElementById('nav-profile-dropdown');
      const chevron = document.getElementById('nav-profile-chevron');
      if (dd) {
        dd.classList.remove('dropdown-visible');
        dd.classList.add('dropdown-hidden');
      }
      if (chevron) chevron.classList.remove('rotate-180');
    }

    // Modal Handlers
    function openProfileModal() {
      const user = getCurrentUser();
      if (!user) {
        openAuth('signin');
        return;
      }
      renderAuthState(user);
      const modal = document.getElementById('profile-modal');
      if (modal) {
        modal.classList.remove('profile-modal-hidden');
        modal.classList.add('profile-modal-visible');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeProfileModal() {
      const modal = document.getElementById('profile-modal');
      if (modal) {
        modal.classList.remove('profile-modal-visible');
        modal.classList.add('profile-modal-hidden');
        document.body.style.overflow = '';
      }
    }

    async function saveProfileChanges(e) {
      e.preventDefault();
      const nameInput = document.getElementById('edit-profile-name');
      const newName = nameInput ? nameInput.value.trim() : '';
      if (!newName) return;

      const user = getCurrentUser() || { email: 'vishal@email.com' };
      user.name = newName;
      user.full_name = newName;
      setCurrentUser(user);
      renderAuthState(user);
      closeProfileModal();

      try {
        await fetch('/api/accounts/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, full_name: newName })
        });
      } catch (err) {}
    }

    function openSettingsModal() {
      const modal = document.getElementById('settings-modal');
      if (modal) {
        modal.classList.remove('profile-modal-hidden');
        modal.classList.add('profile-modal-visible');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeSettingsModal() {
      const modal = document.getElementById('settings-modal');
      if (modal) {
        modal.classList.remove('profile-modal-visible');
        modal.classList.add('profile-modal-hidden');
        document.body.style.overflow = '';
      }
    }

    function openNotificationsModal() {
      const modal = document.getElementById('notifications-modal');
      if (modal) {
        modal.classList.remove('profile-modal-hidden');
        modal.classList.add('profile-modal-visible');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeNotificationsModal() {
      const modal = document.getElementById('notifications-modal');
      if (modal) {
        modal.classList.remove('profile-modal-visible');
        modal.classList.add('profile-modal-hidden');
        document.body.style.overflow = '';
      }
    }

    function markAllNotificationsRead() {
      const dot = document.getElementById('nav-notif-dot');
      if (dot) dot.classList.add('hidden');
    }

    function openUpgradeModal(view = 'pricing') {
      const user = getCurrentUser();
      if (!user) {
        openAuth('signup');
        return;
      }
      const modal = document.getElementById('upgrade-modal');
      if (modal) {
        modal.classList.remove('profile-modal-hidden');
        modal.classList.add('profile-modal-visible');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeUpgradeModal() {
      const modal = document.getElementById('upgrade-modal');
      if (modal) {
        modal.classList.remove('profile-modal-visible');
        modal.classList.add('profile-modal-hidden');
        document.body.style.overflow = '';
      }
    }

    function openBillingModal() {
      const user = getCurrentUser();
      if (!user) {
        openAuth('signin');
        return;
      }
      const modal = document.getElementById('billing-modal');
      if (modal) {
        modal.classList.remove('profile-modal-hidden');
        modal.classList.add('profile-modal-visible');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeBillingModal() {
      const modal = document.getElementById('billing-modal');
      if (modal) {
        modal.classList.remove('profile-modal-visible');
        modal.classList.add('profile-modal-hidden');
        document.body.style.overflow = '';
      }
    }

    function handleCheckoutPayment(e) {
      e.preventDefault();
      const label = document.getElementById('label-submit-payment');
      if (label) label.innerText = 'Processing Payment...';

      setTimeout(() => {
        const user = getCurrentUser() || { name: 'Vishal Khadatare', email: 'vishal@email.com' };
        user.subscriptionStatus = 'pro';
        user.plan = 'kivo_pro';
        setCurrentUser(user);
        renderAuthState(user);
        closeUpgradeModal();
        alert('🎉 Kivo Pro subscription activated successfully!');
      }, 800);
    }

    // Scroll Navbar
    window.addEventListener('scroll', () => {
      const nav = document.getElementById('main-navbar');
      if (window.scrollY > 20) {
        if (nav) nav.classList.add('nav-scrolled');
      } else {
        if (nav) nav.classList.remove('nav-scrolled');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const dd = document.getElementById('nav-profile-dropdown');
      const trigger = document.getElementById('btn-profile-trigger');
      if (dd && dd.classList.contains('dropdown-visible')) {
        if (!dd.contains(e.target) && !trigger.contains(e.target)) {
          closeProfileDropdown();
        }
      }
    });

    // Escape Key Handler
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProfileDropdown();
        closeProfileModal();
        closeSettingsModal();
        closeNotificationsModal();
        closeUpgradeModal();
        closeBillingModal();
        closeAuth();
      }
    });

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
      const user = getCurrentUser();
      renderAuthState(user);
      selectDemoScenario('medicine-refill');
      updateRoiCalculation();
    });
  </script>

</body>
</html>
"""

if __name__ == '__main__':
    html = generate_html()
    with open('d:/ElderCare/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Successfully generated index.html with enhanced Live Demo, length: {len(html)}')
''')
print('Updated build_kivo_site.py successfully')

