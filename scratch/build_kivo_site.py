# -*- coding: utf-8 -*-
"""
Kivo AI — Full Production Redesign Generator
Pass 1 — Visual Redesign + Motion & Effects
"""
import os

def generate_html():
    return '''<!DOCTYPE html>
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
    /* ========================================================================= */
    /* 1. GLOBAL MOTION DESIGN SYSTEM & EASING TOKENS                            */
    /* ========================================================================= */
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

    /* Baseline Reset with Light Theme Depth */
    body {
      background-color: #F5F8FA;
      color: #0B1424;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      line-height: 1.6;
    }

    /* Card System */
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

    .kivo-glass {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(215, 224, 230, 0.8);
    }

    /* Sticky Navbar Glass Effect on Scroll */
    .nav-scrolled {
      background: rgba(245, 248, 250, 0.92) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      border-bottom: 1px solid #D7E0E6 !important;
      box-shadow: 0 4px 20px rgba(15, 30, 45, 0.05) !important;
    }

    /* Ambient Hero Glow (Subtle & Slow) */
    .hero-ambient-glow {
      background: radial-gradient(circle at 50% 30%, rgba(22, 199, 189, 0.12) 0%, rgba(8, 187, 208, 0.06) 45%, transparent 70%);
      animation: ambientGlowPulse 12s ease-in-out infinite alternate;
    }
    @keyframes ambientGlowPulse {
      0% { transform: scale(1) translateY(0); opacity: 0.8; }
      100% { transform: scale(1.12) translateY(-15px); opacity: 1; }
    }

    /* Gradient Text Accent */
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

    /* CTA Press Micro-interaction */
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

    /* Fluid Hero Typography */
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

    /* Page Load Reveal Keyframes */
    .reveal-0 { animation: loadFadeUp 0.6s var(--ease-out-quint) 0.0s both; }
    .reveal-1 { animation: loadFadeUp 0.6s var(--ease-out-quint) 0.1s both; }
    .reveal-2 { animation: loadFadeUp 0.6s var(--ease-out-quint) 0.2s both; }
    .reveal-3 { animation: loadFadeUp 0.6s var(--ease-out-quint) 0.3s both; }
    .reveal-4 { animation: loadFadeUp 0.6s var(--ease-out-quint) 0.45s both; }
    .reveal-panel { animation: loadSlideIn 0.8s var(--ease-out-quint) 0.35s both; }

    @keyframes loadFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes loadSlideIn {
      from { opacity: 0; transform: translateX(24px); }
      to { opacity: 1; transform: translateX(0); }
    }

    /* Dynamic 16-bar Sound Wave Visualizer */
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

    /* Architecture Data Flow Animated Signal */
    @keyframes dataPulseFlow {
      0% { transform: translateY(-100%); opacity: 0; }
      30% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(200%); opacity: 0; }
    }
    .data-flow-signal {
      animation: dataPulseFlow 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    }

    /* AI Cursor Physics */
    #live-ai-cursor {
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes clickRipple {
      0% { transform: scale(0.3); opacity: 1; }
      100% { transform: scale(2.6); opacity: 0; }
    }
    .cursor-ripple {
      animation: clickRipple 0.5s ease-out forwards;
    }

    /* Senior Mode Experience */
    body.senior-mode-active #standard-experience { display: none !important; }
    body.senior-mode-active #senior-experience { display: block !important; }
    #senior-experience { display: none; }

    /* Auth & Profile Overlays */
    body.auth-mode-active #account-experience { display: flex !important; }
    #account-experience { display: none; }
    .profile-modal-hidden { display: none !important; }
    .profile-modal-visible { display: flex !important; }

    /* Scroll Reveal Helper Class */
    .scroll-reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s var(--ease-out-quint), transform 0.6s var(--ease-out-quint);
    }
    .scroll-reveal.revealed {
      opacity: 1;
      transform: translateY(0);
    }

    /* Reduced Motion (WCAG 2.3.3) */
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
      .data-flow-signal { animation: none !important; }
    }
  </style>
</head>
<body class="antialiased selection:bg-kivo-teal/20 selection:text-kivo-tealDark">

  <!-- ========================================================================= -->
  <!-- MAIN KIVO STANDARD EXPERIENCE                                             -->
  <!-- ========================================================================= -->
  <div id="standard-experience">

    <!-- ========================================================================= -->
    <!-- 1. STICKY GLASS NAVBAR                                                    -->
    <!-- ========================================================================= -->
    <header id="main-navbar" class="fixed top-0 inset-x-0 z-40 bg-kivo-bg/85 backdrop-blur-xl border-b border-kivo-border transition-all duration-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        
        <!-- Left: Logo & Brand Identity -->
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

        <!-- Center: Semantic Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1.5 rounded-full bg-kivo-surfacePanel border border-kivo-border text-xs font-semibold text-kivo-textSecondary" role="navigation" aria-label="Main Navigation">
          <a href="#live-demo" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Live Simulator</a>
          <a href="#architecture" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Amazon Nova</a>
          <a href="#pillars" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Four Pillars</a>
          <a href="#comparison" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Old vs Kivo</a>
          <a href="#calculator" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">ROI Calculator</a>
          <a href="#pricing" class="px-3.5 py-1.5 rounded-full hover:text-kivo-tealDark hover:bg-white transition-all cta-press">Pricing</a>
        </nav>

        <!-- Right: Actions & Auth State Container -->
        <div class="flex items-center gap-2.5">
          
          <!-- Senior Mode Toggle -->
          <button onclick="toggleSeniorMode()" id="nav-senior-btn" class="min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-kivo-surfaceElevated border border-kivo-border text-kivo-textSecondary hover:text-kivo-text hover:border-kivo-teal/60 transition-all flex items-center gap-1.5 cta-press shadow-kivo-sm" aria-label="Toggle Senior Accessibility View">
            <span class="text-sm">👓</span>
            <span id="nav-senior-label" class="hidden sm:inline">Senior Mode</span>
          </button>

          <!-- LOGGED OUT STATE (Sign In + Try Kivo Live) -->
          <div id="nav-logged-out" class="flex items-center gap-2">
            <button onclick="openAuth('signin')" class="min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold text-kivo-textSecondary hover:text-kivo-tealDark hover:bg-kivo-surfacePanel transition-colors cta-press" aria-label="Sign in to your account">
              Sign In
            </button>
            <button onclick="scrollToLiveDemo()" class="min-h-[40px] px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-xs shadow-kivo-sm transition-all flex items-center justify-center gap-1.5 cta-press" aria-label="Try Kivo Live">
              <span>Try Kivo Live</span>
              <span class="text-xs">→</span>
            </button>
          </div>

          <!-- LOGGED IN STATE (Avatar, Name, Upgrade Badge, Notifications) -->
          <div id="nav-logged-in" class="hidden items-center gap-2 sm:gap-3">
            
            <!-- Notifications Bell with Unread Dot -->
            <button onclick="openNotificationsModal()" id="btn-nav-notifs" class="relative min-h-[40px] w-10 flex items-center justify-center rounded-xl bg-white border border-kivo-border text-kivo-textSecondary hover:text-kivo-tealDark hover:border-kivo-teal transition-all cta-press shadow-kivo-sm" aria-label="View notifications">
              <span class="text-base">🔔</span>
              <span id="nav-notif-dot" class="absolute top-2 right-2 w-2 h-2 rounded-full bg-kivo-teal animate-pulse"></span>
            </button>

            <!-- Upgrade / Pro Badge -->
            <button onclick="openUpgradeModal()" id="btn-nav-upgrade" class="min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-kivo-sm transition-all flex items-center gap-1.5 cta-press">
              <span>✨</span>
              <span id="nav-upgrade-label">Upgrade</span>
            </button>
            <div id="nav-pro-badge" class="hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-mono font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>KIVO PRO</span>
            </div>

            <!-- Profile Trigger Dropdown -->
            <div class="relative">
              <button onclick="toggleProfileDropdown(event)" id="btn-profile-trigger" class="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal flex items-center gap-2.5 transition-all cta-press shadow-kivo-sm" aria-expanded="false" aria-haspopup="true" aria-label="User profile menu">
                <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[1.5px] flex items-center justify-center shadow-sm">
                  <div class="w-full h-full bg-kivo-surfaceDark rounded-full flex items-center justify-center text-white text-[11px] font-bold font-mono" id="nav-avatar-initials">
                    VK
                  </div>
                </div>
                <span class="text-xs font-bold text-kivo-text max-w-[90px] truncate" id="nav-profile-firstname">Vishal</span>
                <span class="text-[10px] text-kivo-textMuted transition-transform duration-200" id="nav-profile-chevron">▼</span>
              </button>

              <!-- Profile Dropdown Menu -->
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
                  <button onclick="openProfileModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors" role="menuitem">
                    <span>👤</span>
                    <span>Your Profile & Account</span>
                  </button>
                  <button onclick="openBillingModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors" role="menuitem">
                    <span>💳</span>
                    <span>Subscription & Billing</span>
                  </button>
                  <button onclick="openSettingsModal(); closeProfileDropdown();" class="w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-kivo-textSecondary hover:bg-kivo-surfacePanel hover:text-kivo-text flex items-center gap-2.5 transition-colors" role="menuitem">
                    <span>⚙️</span>
                    <span>Caretaker Preferences</span>
                  </button>
                </div>

                <div class="border-t border-kivo-border pt-2 mt-2">
                  <button onclick="handleSignOut()" class="w-full px-3.5 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors" role="menuitem">
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

    <!-- SPACER FOR FIXED NAVBAR -->
    <div class="h-18 sm:h-20"></div>

    <main>

      <!-- ===================================================================== -->
      <!-- 2. HERO SECTION (Voice-First AI Caretaker for Elderly)                -->
      <!-- ===================================================================== -->
      <section id="hero" class="relative bg-kivo-bgHero py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-kivo-border">
        
        <!-- Ambient Teal/Cyan Glow Behind Hero -->
        <div class="hero-ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none rounded-full blur-[100px]" aria-hidden="true"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            <!-- Left Hero Column (7 Cols): Headline, Value Prop & CTAs -->
            <div class="lg:col-span-7 space-y-7 text-center lg:text-left">
              
              <!-- Eyebrow Pill -->
              <div class="reveal-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-kivo-border shadow-kivo-sm">
                <span class="w-2 h-2 rounded-full bg-kivo-teal animate-pulse"></span>
                <span class="text-xs font-bold text-kivo-textSecondary tracking-tight">Amazon Nova AI Digital Caretaker</span>
              </div>

              <!-- Main Hero Heading (Fluid Clamp) -->
              <h1 class="reveal-1 hero-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
                You Speak. <br />
                <span class="gradient-text-accent">Kivo Clicks.</span>
              </h1>

              <!-- Subheading -->
              <p class="reveal-2 text-base sm:text-lg lg:text-xl text-kivo-textSecondary font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Kivo allows elderly parents to speak naturally. Amazon Nova models autonomously understand requests, verify physical prescriptions, navigate websites, and execute tasks — keeping families reassured in real time.
              </p>

              <!-- Intent Pills Quick Selector -->
              <div class="reveal-3 space-y-2 pt-1">
                <span class="text-xs font-mono font-bold text-kivo-textMuted uppercase tracking-wider block">Try spoken natural-language intents:</span>
                <div class="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <button onclick="selectDemoScenario('medicine-refill'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>💊</span>
                    <span>"Order my blood pressure pills"</span>
                  </button>
                  <button onclick="selectDemoScenario('grocery-restock'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>🛒</span>
                    <span>"Get 2L toned milk & brown bread"</span>
                  </button>
                  <button onclick="selectDemoScenario('ride-clinic'); scrollToLiveDemo();" class="text-xs px-3.5 py-2 rounded-xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-textSecondary hover:text-kivo-text transition-all cta-press flex items-center gap-1.5 shadow-kivo-sm">
                    <span>🚖</span>
                    <span>"Book a cab to Dr. Sharma's clinic"</span>
                  </button>
                </div>
              </div>

              <!-- Primary & Secondary CTA Buttons -->
              <div class="reveal-4 pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4">
                <button onclick="scrollToLiveDemo()" class="min-h-[52px] px-8 py-4 rounded-2xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-kivo-teal transition-all cta-press" aria-label="Try Kivo Live Demo">
                  <span>Try Kivo Live</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>

                <a href="#architecture" class="min-h-[52px] px-7 py-4 rounded-2xl bg-white border border-kivo-border hover:border-kivo-teal text-kivo-text text-sm font-bold flex items-center justify-center gap-2 transition-all cta-press shadow-kivo-sm">
                  <span>See How It Works</span>
                  <span class="text-kivo-tealDark">↓</span>
                </a>
              </div>

              <!-- Trust Badges -->
              <div class="reveal-4 pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-kivo-textMuted">
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

            <!-- Right Hero Column (5 Cols): Live Dynamic Visual Telemetry Card -->
            <div class="lg:col-span-5 reveal-panel">
              <div class="kivo-card p-6 sm:p-7 relative overflow-hidden bg-white border-kivo-border">
                
                <!-- Card Header -->
                <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-5">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3 h-3 rounded-full bg-kivo-teal animate-pulse"></span>
                    <span class="font-bold text-xs font-display tracking-tight text-kivo-text uppercase">KIVO LIVE TELEMETRY</span>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-kivo-teal/15 text-kivo-tealDark border border-kivo-teal/30">
                    VOICE → ACTION
                  </span>
                </div>

                <!-- Pipeline State Progression -->
                <div class="space-y-4">
                  
                  <!-- Step 1: Voice -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🎙️
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">Spoken Utterance</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Sonic [0.10s]</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary font-mono italic truncate">"Kivo, order my blood pressure medication"</p>
                    </div>
                  </div>

                  <!-- Step 2: Intent & Vision -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🧠
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">Intent & Profile Verified</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Lite + Vision</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary">Matched Amlodipine 5mg • Apollo Pharmacy Registry</p>
                    </div>
                  </div>

                  <!-- Step 3: Autonomous Web Action -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ⚡
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-kivo-text">Browser Automation</span>
                        <span class="text-[10px] font-mono text-emerald-600 font-bold">Nova Act</span>
                      </div>
                      <p class="text-xs text-kivo-textSecondary">Cart populated (₹380.00) • Awaiting caregiver dispatch</p>
                    </div>
                  </div>

                  <!-- Step 4: Family WhatsApp Alert -->
                  <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      💬
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-0.5">
                        <span class="font-bold text-xs text-emerald-900">Family WhatsApp Loop</span>
                        <span class="text-[10px] font-mono text-emerald-700 font-bold">Family API</span>
                      </div>
                      <p class="text-xs text-emerald-800">WhatsApp receipt queued for Rohan (Primary Caregiver)</p>
                    </div>
                  </div>

                </div>

                <!-- Live Simulator CTA Trigger -->
                <div class="pt-5 mt-4 border-t border-kivo-border">
                  <button onclick="scrollToLiveDemo()" class="w-full py-3 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold text-xs flex items-center justify-center gap-2 transition-all cta-press">
                    <span>⚡ Experience Live Simulator Below</span>
                    <span>↓</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 3. BEFORE VS KIVO (14+ Steps of Friction vs 1 Spoken Request)        -->
      <!-- ===================================================================== -->
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
            
            <!-- Left Card: The Old Way (Friction) -->
            <div class="kivo-card p-7 sm:p-9 bg-white border-rose-200 shadow-kivo-md relative">
              <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-6">
                <div>
                  <span class="text-xs font-mono font-bold text-rose-600 uppercase tracking-wider">THE OLD WAY</span>
                  <h3 class="text-xl font-bold font-display text-kivo-text mt-1">14+ Steps of Digital Friction</h3>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                  ✕
                </div>
              </div>

              <ul class="space-y-3.5 text-xs text-kivo-textSecondary">
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">1.</span>
                  <span>Unlock smartphone, remember app location, launch pharmacy app.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">2.</span>
                  <span>Encounter OTP / expired login password reset wall.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">3.</span>
                  <span>Search medicine name with tiny keyboard; struggle with spelling.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">4.</span>
                  <span>Upload physical prescription photo; verify medicine dosage (5mg vs 10mg).</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">5.</span>
                  <span>Select delivery slot, enter CVV code, pass SMS bank authorization.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-rose-500 font-bold">6.</span>
                  <span>Family members have zero visibility into whether order succeeded.</span>
                </li>
              </ul>

              <div class="mt-8 pt-4 border-t border-kivo-border flex items-center justify-between text-xs text-rose-600 font-bold">
                <span>Result: Frustration & missed medications</span>
                <span>⏱️ ~25 mins</span>
              </div>
            </div>

            <!-- Right Card: The Kivo Way (1 Spoken Request) -->
            <div class="kivo-card p-7 sm:p-9 bg-white border-kivo-teal shadow-kivo-lg relative ring-2 ring-kivo-teal/30">
              <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-6">
                <div>
                  <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider">THE KIVO WAY</span>
                  <h3 class="text-xl font-bold font-display text-kivo-text mt-1">1 Spoken Natural Request</h3>
                </div>
                <div class="w-10 h-10 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-lg">
                  ✓
                </div>
              </div>

              <ul class="space-y-3.5 text-xs text-kivo-textSecondary">
                <li class="flex items-start gap-3">
                  <span class="text-kivo-teal font-bold text-base">●</span>
                  <span>Senior says: <strong class="text-kivo-text">"Kivo, order my blood pressure tablets."</strong></span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-kivo-teal font-bold text-base">●</span>
                  <span><strong class="text-kivo-text">Nova Sonic + Lite:</strong> Extracts intent, dosage, and medical schedule.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-kivo-teal font-bold text-base">●</span>
                  <span><strong class="text-kivo-text">Nova Act:</strong> Headless browser launches, logs in, matches Apollo cart.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-kivo-teal font-bold text-base">●</span>
                  <span><strong class="text-kivo-text">Caregiver Confirmation:</strong> Pre-authorized limit dispatched automatically.</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="text-kivo-teal font-bold text-base">●</span>
                  <span><strong class="text-kivo-text">Family API:</strong> WhatsApp confirmation & tracking sent to family instantly.</span>
                </li>
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
      <!-- 4. LIVE INTERACTIVE SIMULATOR (Dominant Centerpiece)                  -->
      <!-- ===================================================================== -->
      <section id="live-demo" class="py-20 sm:py-28 bg-kivo-bgDemo border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Section Header -->
          <div class="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              INTERACTIVE WORKBENCH
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Watch Kivo Actually Work
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Speak into your microphone or choose a live elderly caretaker scenario. Watch Amazon Nova decompose intent, orchestrate headless browser execution, and notify family.
            </p>
          </div>

          <!-- Scenario Pills Bar -->
          <div class="mb-8 flex flex-wrap items-center justify-center gap-2.5" role="tablist" aria-label="Simulator Scenarios">
            <button onclick="selectDemoScenario('medicine-refill')" id="pill-scenario-medicine" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-kivo-teal text-slate-950 shadow-kivo-sm border border-kivo-teal" role="tab" aria-selected="true">
              💊 Medicine Refill
            </button>
            <button onclick="selectDemoScenario('grocery-restock')" id="pill-scenario-grocery" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              🛒 Grocery Essentials
            </button>
            <button onclick="selectDemoScenario('ride-clinic')" id="pill-scenario-ride" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              🚖 Ride to Clinic
            </button>
            <button onclick="selectDemoScenario('utility-bill')" id="pill-scenario-utility" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              💡 Utility Bill Pay
            </button>
            <button onclick="selectDemoScenario('flight-status')" id="pill-scenario-flight" class="px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cta-press bg-white text-kivo-textSecondary hover:text-kivo-text border border-kivo-border shadow-kivo-sm" role="tab" aria-selected="false">
              ✈️ Flight Status
            </button>
          </div>

          <!-- Main Interactive Workbench Layout (2 Columns) -->
          <div id="demo-interactive-workbench" class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Left Workbench Column (5 Cols): Voice Controls & Intent Decomposition -->
            <div class="lg:col-span-5 space-y-6">
              
              <!-- Voice Interaction Card -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border">
                
                <div class="flex items-center justify-between border-b border-kivo-border pb-4 mb-4">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-kivo-teal animate-pulse"></span>
                    <span class="font-bold text-xs font-display text-kivo-text uppercase">VOICE CAPTURE</span>
                  </div>
                  <span id="demo-status-pill" class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                    IDLE / READY
                  </span>
                </div>

                <!-- Spoken Utterance Box -->
                <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border mb-4">
                  <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold block mb-1">Spoken Utterance:</span>
                  <p id="demo-spoken-utterance" class="text-sm font-semibold text-kivo-text font-sans">
                    "Kivo, order my blood pressure medication from Apollo Pharmacy"
                  </p>
                </div>

                <!-- Dynamic 16-bar Sound Wave Visualizer Container -->
                <div id="demo-soundwave-wrap" class="hidden flex-col gap-2 p-3.5 rounded-2xl bg-kivo-surfaceDark text-white mb-4 transition-all">
                  <div class="flex justify-between items-center text-[10px] font-mono">
                    <span id="soundwave-status-label" class="text-kivo-teal font-bold">LISTENING TO LIVE SPEECH...</span>
                    <span id="soundwave-db-level" class="text-slate-400">Mic: Active</span>
                  </div>
                  <div id="soundwave-bars" class="h-10 flex items-center justify-center gap-1.5 px-2">
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

                <!-- Voice Buttons: Speak Mic + Listen Voice -->
                <div class="grid grid-cols-2 gap-3">
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

              <!-- Intent Decomposition (4 Distinct Cards) -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border space-y-4">
                <div class="flex items-center justify-between border-b border-kivo-border pb-3">
                  <span class="font-bold text-xs font-display text-kivo-text uppercase">INTENT DECOMPOSITION</span>
                  <span class="text-[10px] font-mono text-kivo-tealDark font-bold">Nova Lite Synthesizer</span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs">
                  
                  <!-- Card 1: Primary Task -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">PRIMARY TASK</span>
                    <div id="demo-intent-task" class="font-bold text-kivo-text">Pharmacy Refill Order</div>
                  </div>

                  <!-- Card 2: Target Profile -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">TARGET PROFILE</span>
                    <div id="demo-intent-profile" class="font-bold text-kivo-text">Dr. Sharma Rx (#A-928)</div>
                  </div>

                  <!-- Card 3: Service Platform -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">SERVICE PLATFORM</span>
                    <div id="demo-intent-platform" class="font-bold text-kivo-text">Apollo Pharmacy 24/7</div>
                  </div>

                  <!-- Card 4: Family Alert -->
                  <div class="p-3.5 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
                    <span class="text-[10px] font-mono text-kivo-textMuted uppercase font-bold">FAMILY ALERT</span>
                    <div id="demo-intent-alert" class="font-bold text-kivo-text">Rohan (+91 98450...)</div>
                  </div>

                </div>

                <!-- Nova Intent JSON Inspection Toggle -->
                <div class="pt-2">
                  <button onclick="toggleNovaIntentJson()" id="btn-toggle-json" class="w-full py-2 px-3 rounded-xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-textSecondary hover:text-kivo-text text-[11px] font-bold flex items-center justify-between transition-all cta-press" aria-expanded="false">
                    <span>Inspect Raw Nova Intent JSON</span>
                    <span id="demo-json-chevron">▼</span>
                  </button>
                  <div id="demo-json-viewer" class="hidden mt-3 p-4 rounded-2xl bg-kivo-surfaceDark text-emerald-400 font-mono text-xs overflow-x-auto relative">
                    <div class="flex justify-between items-center mb-2 pb-2 border-b border-slate-700">
                      <span class="text-[10px] text-slate-400 uppercase">Payload Schema (Amazon Nova)</span>
                      <button onclick="copyNovaIntentJson()" id="label-copy-json" class="text-[10px] text-kivo-teal hover:underline">📋 Copy JSON</button>
                    </div>
                    <pre id="demo-intent-json" class="text-[11px] leading-relaxed"></pre>
                  </div>
                </div>

              </div>

            </div>

            <!-- Right Workbench Column (7 Cols): Realistic Browser Simulator & Activity Stream -->
            <div class="lg:col-span-7 space-y-6">
              
              <!-- Browser Automation Simulator Card -->
              <div class="kivo-card overflow-hidden bg-white border-kivo-border shadow-kivo-lg">
                
                <!-- Realistic Browser Chrome / Toolbar -->
                <div class="px-4 py-3 bg-kivo-surfacePanel border-b border-kivo-border flex items-center gap-3">
                  <!-- Browser Window Control Dots -->
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>

                  <!-- Back / Forward Controls -->
                  <div class="hidden sm:flex items-center gap-1 text-kivo-textMuted text-xs">
                    <span>‹</span>
                    <span>›</span>
                    <span>↻</span>
                  </div>

                  <!-- Address Bar with SSL Lock -->
                  <div class="flex-1 min-w-0 px-3 py-1 rounded-xl bg-white border border-kivo-border flex items-center gap-2 text-xs text-kivo-textSecondary shadow-inner">
                    <span class="text-emerald-600 text-[10px]">🔒</span>
                    <span id="demo-browser-url" class="font-mono text-[11px] truncate text-kivo-text">https://apollo247.com/prescriptions/reorder</span>
                  </div>

                  <!-- Live AI Executing Badge -->
                  <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-700 text-[10px] font-mono font-bold flex-shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping"></span>
                    <span>NOVA ACT</span>
                  </div>
                </div>

                <!-- Simulated Service Viewport Area -->
                <div class="p-6 relative min-h-[280px] bg-kivo-bgHero flex flex-col justify-between">
                  
                  <!-- AI Cursor Element -->
                  <div id="live-ai-cursor" class="absolute top-12 left-1/3 z-20 pointer-events-none transition-transform duration-500">
                    <div class="relative">
                      <svg class="w-6 h-6 text-purple-600 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 2l16 12-7 2-4 6z"/>
                      </svg>
                      <span class="absolute left-6 top-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-600 text-white shadow-sm whitespace-nowrap">
                        Kivo Cursor
                      </span>
                    </div>
                  </div>

                  <!-- Service Content Area (Prescription / Order Card) -->
                  <div id="demo-service-card" class="p-5 rounded-2xl bg-white border border-kivo-border shadow-kivo-sm space-y-4">
                    <div class="flex items-start justify-between">
                      <div class="space-y-1">
                        <span id="demo-service-badge" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                          PRESCRIPTION VERIFIED
                        </span>
                        <h4 id="demo-service-title" class="font-bold text-base text-kivo-text font-display">
                          Amlodipine Besylate 5mg (Strip of 30 Tablets)
                        </h4>
                        <p id="demo-service-desc" class="text-xs text-kivo-textSecondary">
                          Apollo Pharmacy Ltd. • Prescription on file (#AP-9921-BLR)
                        </p>
                      </div>
                      <div class="text-right">
                        <span class="text-[10px] font-mono text-kivo-textMuted uppercase block">Total Charge</span>
                        <span id="demo-service-price" class="text-xl font-extrabold font-mono text-kivo-text">₹380.00</span>
                      </div>
                    </div>

                    <!-- Caregiver Safety Approval Bar -->
                    <div class="p-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-2 text-xs text-kivo-text">
                        <span>🛡️</span>
                        <span>Pre-authorized under family limit (₹1,000.00)</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button onclick="cancelPendingOrder()" class="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 border border-kivo-border text-rose-600 text-xs font-bold transition-all cta-press">
                          Cancel
                        </button>
                        <button onclick="confirmAndDispatchOrder()" id="btn-dispatch-order" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 text-xs font-extrabold shadow-kivo-sm transition-all cta-press">
                          Confirm & Dispatch Order
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Re-run Simulation Button Bar -->
                  <div class="pt-4 flex items-center justify-between text-xs text-kivo-textMuted border-t border-kivo-border mt-4">
                    <span>Scenario: <strong id="demo-active-scenario-name" class="text-kivo-text">Medicine Refill</strong></span>
                    <button onclick="rerunActiveSimulation()" class="text-kivo-tealDark font-bold hover:underline inline-flex items-center gap-1 cta-press">
                      <span>↻ Re-run Simulation</span>
                    </button>
                  </div>

                </div>

              </div>

              <!-- Agent Activity Stream Card -->
              <div class="kivo-card p-6 sm:p-7 bg-white border-kivo-border space-y-4">
                <div class="flex items-center justify-between border-b border-kivo-border pb-3">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="font-bold text-xs font-display text-kivo-text uppercase">AGENT ACTIVITY STREAM</span>
                  </div>
                  <span class="text-[10px] font-mono text-kivo-textMuted font-bold">5 Sub-Agents Synchronized</span>
                </div>

                <!-- Stream Items List -->
                <div id="demo-activity-stream" class="space-y-2.5">
                  <!-- Generated dynamically by state machine -->
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 5. AMAZON NOVA ARCHITECTURE (Voice -> Act -> Family Loop)            -->
      <!-- ===================================================================== -->
      <section id="architecture" class="py-20 sm:py-28 bg-kivo-bgArch border-b border-kivo-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider bg-kivo-teal/15 px-3 py-1 rounded-full border border-kivo-teal/30">
              TECHNICAL IMPLEMENTATION
            </span>
            <h2 class="section-title-clamp font-extrabold font-display text-kivo-text tracking-tight">
              Amazon Nova Multimodal Architecture
            </h2>
            <p class="text-base sm:text-lg text-kivo-textSecondary">
              Kivo leverages specialized Amazon Nova foundation models orchestrating seamless speech synthesis, intent parsing, document verification, autonomous browser actions, and secure caregiver notification.
            </p>
          </div>

          <!-- Architecture Node Flow -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 items-stretch">
            
            <!-- Node 1: Nova Sonic -->
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between relative group hover:border-kivo-teal">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-lg">
                  🎙️
                </div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Sonic</h3>
                <p class="text-xs text-kivo-textSecondary">
                  Captures spoken natural-language intent with low-latency audio stream processing and elder speech dialect adaptation.
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>INPUT: AUDIO</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <!-- Node 2: Nova Lite -->
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between relative group hover:border-kivo-cyan">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-lg">
                  🧠
                </div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Lite</h3>
                <p class="text-xs text-kivo-textSecondary">
                  Fast semantic intent synthesis, parameter extraction, risk classification, and structured MCP tool dispatch schema creation.
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>INTENT PARSER</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <!-- Node 3: Nova Vision -->
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between relative group hover:border-amber-400">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold text-lg">
                  👁️
                </div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Vision</h3>
                <p class="text-xs text-kivo-textSecondary">
                  Verifies physical prescription photographs, pill bottles, utility bills, and matches medical registry records.
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>OCR & VISION</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <!-- Node 4: Nova Act -->
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between relative group hover:border-purple-500">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <h3 class="font-bold text-base font-display text-kivo-text">Nova Act</h3>
                <p class="text-xs text-kivo-textSecondary">
                  Autonomous headless browser automation executing logins, cart additions, and pre-checkout staging without human clicks.
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>HEADLESS BROWSER</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

            <!-- Node 5: Family API -->
            <div class="kivo-card p-6 bg-white border-kivo-border flex flex-col justify-between relative group hover:border-emerald-500">
              <div class="space-y-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  💬
                </div>
                <h3 class="font-bold text-base font-display text-kivo-text">Family API</h3>
                <p class="text-xs text-kivo-textSecondary">
                  Real-time WhatsApp & SMS notifications with receipts, live tracking links, and 1-click caregiver emergency override.
                </p>
              </div>
              <div class="pt-4 mt-4 border-t border-kivo-border flex items-center justify-between text-[10px] font-mono text-kivo-textMuted">
                <span>WHATSAPP LOOP</span>
                <span class="text-emerald-600 font-bold">● ACTIVE</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 6. FOUR PILLARS OF KIVO                                               -->
      <!-- ===================================================================== -->
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
              Kivo bridges the generational digital divide by converting spoken natural language into secure, self-navigating web actions.
            </p>
          </div>

          <!-- 2x2 Responsive Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            <!-- Pillar 1 -->
            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-kivo-teal/15 text-kivo-tealDark flex items-center justify-center font-bold text-2xl">
                🗣️
              </div>
              <span class="text-xs font-mono font-bold text-kivo-tealDark uppercase tracking-wider block">PILLAR 01</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Voice-First Natural Interaction</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Seniors never have to navigate menus, type on keyboards, or memorize passwords. They simply speak to Kivo like talking to a trusted family member.
              </p>
            </div>

            <!-- Pillar 2 -->
            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-kivo-cyan/15 text-kivo-cyan flex items-center justify-center font-bold text-2xl">
                📑
              </div>
              <span class="text-xs font-mono font-bold text-kivo-cyan uppercase tracking-wider block">PILLAR 02</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Context & Prescription Memory</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Kivo securely remembers regular medication dosages, doctor contacts, favorite grocery essentials, and home addresses, resolving ambiguities automatically.
              </p>
            </div>

            <!-- Pillar 3 -->
            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-600 flex items-center justify-center font-bold text-2xl">
                🛡️
              </div>
              <span class="text-xs font-mono font-bold text-purple-600 uppercase tracking-wider block">PILLAR 03</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Safe Autonomous Execution</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Built-in financial guardrails, spending caps, and Human-in-the-Loop approval workflows ensure zero accidental purchases or unauthorized orders.
              </p>
            </div>

            <!-- Pillar 4 -->
            <div class="kivo-card p-8 bg-white border-kivo-border space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                ❤️
              </div>
              <span class="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">PILLAR 04</span>
              <h3 class="text-2xl font-bold font-display text-kivo-text">Real-Time Family Loop</h3>
              <p class="text-sm text-kivo-textSecondary leading-relaxed">
                Caregiver children receive immediate WhatsApp receipts and live dispatch status, giving families complete peace of mind across distances.
              </p>
            </div>

          </div>

        </div>
      </section>

      <!-- ===================================================================== -->
      <!-- 7. ROI & CAREGIVER IMPACT CALCULATOR                                  -->
      <!-- ===================================================================== -->
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
            
            <!-- Controls Card (7 Cols) -->
            <div class="lg:col-span-7 kivo-card p-8 bg-white border-kivo-border space-y-6">
              
              <!-- Slider 1: Number of Seniors Supported -->
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm font-bold text-kivo-text">
                  <label for="slider-seniors">Parents / Grandparents Supported</label>
                  <span id="label-val-seniors" class="font-mono text-kivo-tealDark text-base font-extrabold">2 Seniors</span>
                </div>
                <input type="range" id="slider-seniors" min="1" max="8" value="2" oninput="updateRoiCalculation()" class="w-full h-2 bg-kivo-surfacePanel rounded-lg appearance-none cursor-pointer accent-kivo-teal">
                <div class="flex justify-between text-[11px] font-mono text-kivo-textMuted">
                  <span>1 Parent</span>
                  <span>4 Seniors</span>
                  <span>8 Seniors</span>
                </div>
              </div>

              <!-- Slider 2: Digital Tasks Per Month -->
              <div class="space-y-2">
                <div class="flex justify-between items-center text-sm font-bold text-kivo-text">
                  <label for="slider-tasks">Digital Errands & Tasks per Month (Per Person)</label>
                  <span id="label-val-tasks" class="font-mono text-kivo-tealDark text-base font-extrabold">12 Tasks</span>
                </div>
                <input type="range" id="slider-tasks" min="4" max="40" value="12" step="2" oninput="updateRoiCalculation()" class="w-full h-2 bg-kivo-surfacePanel rounded-lg appearance-none cursor-pointer accent-kivo-teal">
                <div class="flex justify-between text-[11px] font-mono text-kivo-textMuted">
                  <span>4 Tasks</span>
                  <span>20 Tasks</span>
                  <span>40 Tasks</span>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border text-xs text-kivo-textSecondary space-y-1">
                <span class="font-bold text-kivo-text block">Includes:</span>
                <p>Pharmacy reorders, lab test booking, clinic cabs, utility bill payments, and daily grocery reorders.</p>
              </div>

            </div>

            <!-- Result Card (5 Cols) -->
            <div class="lg:col-span-5 kivo-card p-8 bg-kivo-surfaceDark text-white border-kivo-border space-y-6 shadow-kivo-lg">
              <div>
                <span class="text-xs font-mono font-bold text-kivo-teal uppercase tracking-wider block mb-1">ANNUAL TIME RECLAIMED</span>
                <div id="roi-hours-saved" class="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                  72 hrs
                </div>
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

      <!-- ===================================================================== -->
      <!-- 8. SAAS MODEL & PRICING                                               -->
      <!-- ===================================================================== -->
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
            
            <!-- Tier 1: Free Trial -->
            <div class="kivo-card p-8 sm:p-9 bg-white border-kivo-border flex flex-col justify-between">
              <div class="space-y-6">
                <div>
                  <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-kivo-surfacePanel text-kivo-textSecondary border border-kivo-border">
                    7-DAY TRIAL
                  </span>
                  <h3 class="text-2xl font-bold font-display text-kivo-text mt-3">Kivo Free Trial</h3>
                  <div class="mt-2 flex items-baseline gap-1">
                    <span class="text-4xl font-black font-mono text-kivo-text">$0</span>
                    <span class="text-xs text-kivo-textMuted">for 7 full days</span>
                  </div>
                </div>

                <ul class="space-y-3 text-xs text-kivo-textSecondary">
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Full Voice Natural Intent Decomposition</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Self-Hosted MCP Browser Automation</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Prescription & Document Vision Verification</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Family WhatsApp Notification Feed</span>
                  </li>
                </ul>
              </div>

              <div class="pt-8">
                <button onclick="openAuth('signup')" class="w-full py-4 rounded-2xl bg-kivo-surfacePanel hover:bg-kivo-border text-kivo-text font-bold text-xs border border-kivo-border transition-all cta-press">
                  Create Free Account
                </button>
              </div>
            </div>

            <!-- Tier 2: Kivo Pro -->
            <div class="kivo-card p-8 sm:p-9 bg-white border-kivo-teal shadow-kivo-lg relative ring-2 ring-kivo-teal/30 flex flex-col justify-between">
              <div class="space-y-6">
                <div class="flex justify-between items-start">
                  <div>
                    <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm">
                      MOST POPULAR
                    </span>
                    <h3 class="text-2xl font-bold font-display text-kivo-text mt-3">Kivo Pro Caretaker</h3>
                    <div class="mt-2 flex items-baseline gap-1">
                      <span class="text-4xl font-black font-mono text-kivo-text">$14.99</span>
                      <span class="text-xs text-kivo-textMuted">/ month</span>
                    </div>
                  </div>
                  <span class="text-3xl">⭐</span>
                </div>

                <ul class="space-y-3 text-xs text-kivo-textSecondary">
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span><strong class="text-kivo-text">Unlimited</strong> Autonomous Web Dispatches</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Multi-Senior Family Management (Up to 4 Parents)</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Dedicated WhatsApp Priority Alert Gateway</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Senior Accessibility High-Contrast Voice Suite</span>
                  </li>
                  <li class="flex items-center gap-2.5">
                    <span class="text-kivo-teal font-bold">✓</span>
                    <span>Zero Transaction Markups & Encrypted Card Vault</span>
                  </li>
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

      <!-- ===================================================================== -->
      <!-- 9. FINAL CALL TO ACTION (Dark Kivo Surface)                           -->
      <!-- ===================================================================== -->
      <section id="cta" class="py-20 sm:py-28 bg-kivo-surfaceDark text-white relative overflow-hidden">
        
        <!-- Ambient Radial Glow in Footer CTA -->
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

  <!-- ========================================================================= -->
  <!-- SENIOR ACCESSIBILITY MODE INTERFACE                                       -->
  <!-- ========================================================================= -->
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

      <!-- Giant Voice Button -->
      <div class="p-10 rounded-3xl bg-white border-4 border-slate-900 shadow-2xl text-center space-y-6">
        <span class="text-2xl font-bold text-slate-800 block">Tap the big button below and speak:</span>
        <button onclick="toggleVoiceRecognition()" class="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full bg-gradient-to-tr from-kivo-teal to-kivo-cyan text-slate-950 text-5xl font-black shadow-2xl flex items-center justify-center border-4 border-slate-900 cta-press">
          🎙️
        </button>
        <p class="text-2xl font-extrabold text-slate-950">"Order my medicine" or "Book a taxi"</p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button onclick="selectDemoScenario('medicine-refill'); toggleSeniorMode(); scrollToLiveDemo();" class="p-8 rounded-3xl bg-white border-4 border-slate-900 text-left space-y-2 shadow-lg cta-press">
          <span class="text-4xl">💊</span>
          <h3 class="text-2xl font-black text-slate-950">Order Medicine Refill</h3>
          <p class="text-base text-slate-700 font-bold">Refill blood pressure pills from Apollo</p>
        </button>

        <button onclick="selectDemoScenario('ride-clinic'); toggleSeniorMode(); scrollToLiveDemo();" class="p-8 rounded-3xl bg-white border-4 border-slate-900 text-left space-y-2 shadow-lg cta-press">
          <span class="text-4xl">🚖</span>
          <h3 class="text-2xl font-black text-slate-950">Call a Taxi to Clinic</h3>
          <p class="text-base text-slate-700 font-bold">Ride to Dr. Sharma's clinic in Indiranagar</p>
        </button>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- AUTHENTICATION & POSTGRESQL ACCOUNT PORTAL                                -->
  <!-- ========================================================================= -->
  <div id="account-experience" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center min-h-screen" role="dialog" aria-modal="true" aria-label="Kivo Authentication Portal" onclick="if(event.target === this) closeAuth()">
    
    <div class="relative w-full max-w-[440px] my-auto z-10 animate-[loadFadeUp_0.35s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="flex items-center justify-between mb-3 px-1">
        <button onclick="closeAuth()" class="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors" aria-label="Back to Kivo website">
          <span>← Back to Kivo</span>
        </button>
      </div>

      <div class="w-full bg-white border border-kivo-border p-7 sm:p-8 rounded-3xl shadow-2xl relative">
        
        <!-- Logo -->
        <div class="text-center mb-5">
          <div class="inline-flex items-center justify-center gap-2 mb-1">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-kivo-teal to-kivo-cyan p-[2px]">
              <div class="w-full h-full bg-kivo-surfaceDark rounded-[10px] flex items-center justify-center text-white text-xs font-bold">
                K
              </div>
            </div>
            <span class="text-xl font-bold font-display text-kivo-text">Kivo</span>
          </div>
          <p class="text-xs text-kivo-textMuted font-medium">You Speak. Kivo Clicks.</p>
        </div>

        <!-- Header -->
        <div class="text-center mb-4">
          <h2 id="auth-header-title" class="text-xl font-bold font-display text-kivo-text">Sign up for Kivo</h2>
          <p id="auth-header-subtitle" class="text-xs text-kivo-textMuted mt-0.5">Start your 7-day free trial today.</p>
        </div>

        <!-- Segmented Tab Controls: [ Sign In ] [ Sign Up ] -->
        <div id="auth-segmented-tabs" class="grid grid-cols-2 p-1 rounded-2xl bg-kivo-surfacePanel border border-kivo-border mb-5" role="tablist">
          <button onclick="switchAuthTab('signin')" id="tab-btn-signin" role="tab" aria-selected="false" class="py-2.5 rounded-xl text-xs font-semibold text-kivo-textSecondary hover:text-kivo-text transition-all cta-press text-center">
            Sign In
          </button>
          <button onclick="switchAuthTab('signup')" id="tab-btn-signup" role="tab" aria-selected="true" class="py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 shadow-sm transition-all cta-press text-center">
            Sign Up
          </button>
        </div>

        <!-- Global Error Banner -->
        <div id="auth-global-error" class="hidden mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2" role="alert">
          <span>⚠️</span>
          <div class="flex-1">
            <p id="auth-global-error-msg">Invalid email or password.</p>
          </div>
          <button onclick="dismissAuthError()" class="text-rose-500 hover:text-rose-700 text-xs">✕</button>
        </div>

        <!-- VIEW 1: SIGN UP WITH EMAIL -->
        <div id="auth-view-signup" class="space-y-3.5">
          <form id="form-signup" onsubmit="handleSignup(event)" novalidate class="space-y-3">
            <div>
              <label for="signup-name" class="block text-xs font-semibold text-kivo-text mb-1">Full Name</label>
              <input type="text" id="signup-name" placeholder="Your full name" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signup-name" class="text-[11px] text-rose-600 mt-1 block hidden">Please enter your name.</span>
            </div>

            <div>
              <label for="signup-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
              <input type="email" id="signup-email" placeholder="you@example.com" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signup-email" class="text-[11px] text-rose-600 mt-1 block hidden">Please enter a valid email.</span>
            </div>

            <div>
              <label for="signup-password" class="block text-xs font-semibold text-kivo-text mb-1">Password</label>
              <input type="password" id="signup-password" placeholder="At least 8 characters" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signup-password" class="text-[11px] text-rose-600 mt-1 block hidden">Password must be at least 8 characters.</span>
            </div>

            <div>
              <label for="signup-confirm-password" class="block text-xs font-semibold text-kivo-text mb-1">Confirm Password</label>
              <input type="password" id="signup-confirm-password" placeholder="Re-enter password" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signup-confirm" class="text-[11px] text-rose-600 mt-1 block hidden">Passwords don't match.</span>
            </div>

            <button type="submit" id="btn-submit-signup" class="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cta-press">
              <span id="label-signup-btn">Create Free Kivo Account</span>
              <svg id="spinner-signup" class="w-4 h-4 animate-spin hidden" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            </button>
          </form>
        </div>

        <!-- VIEW 2: SIGN IN WITH EMAIL -->
        <div id="auth-view-signin" class="space-y-3.5 hidden">
          <form id="form-signin" onsubmit="handleSignin(event)" novalidate class="space-y-3">
            <div>
              <label for="signin-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
              <input type="email" id="signin-email" placeholder="you@example.com" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signin-email" class="text-[11px] text-rose-600 mt-1 block hidden">Please enter your email.</span>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label for="signin-password" class="block text-xs font-semibold text-kivo-text">Password</label>
                <button type="button" onclick="showForgotPasswordView()" class="text-[11px] text-kivo-tealDark font-semibold hover:underline">Forgot password?</button>
              </div>
              <input type="password" id="signin-password" placeholder="Your password" class="w-full h-11 px-3.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal focus:bg-white transition-all" required>
              <span id="err-signin-password" class="text-[11px] text-rose-600 mt-1 block hidden">Please enter your password.</span>
            </div>

            <button type="submit" id="btn-submit-signin" class="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cta-press">
              <span id="label-signin-btn">Sign In to Kivo</span>
              <svg id="spinner-signin" class="w-4 h-4 animate-spin hidden" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
            </button>
          </form>
        </div>

        <!-- VIEW 3: FORGOT PASSWORD -->
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

        <!-- VIEW 4: SUCCESS TRANSITION -->
        <div id="auth-view-success" class="space-y-4 hidden text-center py-6">
          <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto font-bold">
            ✓
          </div>
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-kivo-text font-display" id="auth-success-title">Verified & Connected</h3>
            <p class="text-xs text-kivo-textSecondary" id="auth-success-subtitle">Welcome to Kivo.</p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- SCROLLABLE PROFILE DRAWER / MODAL (Max-Height 90vh & Complete Info)       -->
  <!-- ========================================================================= -->
  <div id="profile-modal" class="profile-modal-hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xl p-4 sm:p-6 items-center justify-center min-h-screen" role="dialog" aria-modal="true" aria-label="Your Kivo Profile" onclick="if(event.target === this) closeProfileModal()">
    
    <div class="relative w-full max-w-lg my-auto z-10 animate-[loadFadeUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
      <div class="w-full bg-white border border-kivo-border p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-kivo-border pb-4">
          <div>
            <h3 class="text-xl font-bold text-kivo-text font-display">Your Kivo Profile</h3>
            <p class="text-xs text-kivo-textMuted">Caregiver identity, contact & account credentials.</p>
          </div>
          <button onclick="closeProfileModal()" class="w-8 h-8 rounded-full bg-kivo-surfacePanel border border-kivo-border text-kivo-textSecondary hover:text-kivo-text flex items-center justify-center text-sm transition-all cta-press" aria-label="Close profile modal">
            ✕
          </button>
        </div>

        <!-- Avatar & Summary Card -->
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

        <!-- Edit Profile Form -->
        <form onsubmit="saveProfileChanges(event)" class="space-y-4">
          <div>
            <label for="edit-profile-name" class="block text-xs font-semibold text-kivo-text mb-1">Full Name</label>
            <input type="text" id="edit-profile-name" class="w-full px-3.5 py-2.5 rounded-xl bg-white border border-kivo-border text-kivo-text text-xs focus:outline-none focus:border-kivo-teal transition-all" required>
          </div>

          <div>
            <label for="edit-profile-email" class="block text-xs font-semibold text-kivo-text mb-1">Email Address</label>
            <input type="email" id="edit-profile-email" disabled class="w-full px-3.5 py-2.5 rounded-xl bg-kivo-surfacePanel border border-kivo-border text-kivo-textMuted text-xs cursor-not-allowed">
            <span class="text-[10px] text-kivo-textMuted mt-1 block">Email is managed through your PostgreSQL account.</span>
          </div>

          <!-- Actions -->
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

  <!-- ========================================================================= -->
  <!-- SETTINGS MODAL                                                            -->
  <!-- ========================================================================= -->
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
            <button onclick="toggleSeniorMode()" id="settings-senior-btn" class="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-white border border-kivo-border cta-press shadow-kivo-sm">
              Toggle
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center justify-between">
            <div>
              <strong class="text-kivo-text block text-sm">WhatsApp Family Alerts</strong>
              <span class="text-kivo-textMuted">Send instant dispatches & receipts to primary caregiver.</span>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700">ENABLED</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- NOTIFICATIONS MODAL                                                       -->
  <!-- ========================================================================= -->
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
              <span>💊 Apollo Pharmacy Refill Confirmed</span>
              <span class="text-[10px] text-emerald-700 font-mono">10:45 AM</span>
            </div>
            <p class="text-xs text-emerald-800">Amlodipine 5mg dispatched. Estimated delivery: Today by 2:00 PM.</p>
          </div>

          <div class="p-4 rounded-2xl bg-kivo-surfacePanel border border-kivo-border space-y-1">
            <div class="flex justify-between items-center text-xs font-bold text-kivo-text">
              <span>🚖 Uber Health Ride Completed</span>
              <span class="text-[10px] text-kivo-textMuted font-mono">Yesterday</span>
            </div>
            <p class="text-xs text-kivo-textSecondary">Senior arrived safely at Dr. Sharma's clinic. Driver: Rajesh (Swift Dzire).</p>
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

  <!-- ========================================================================= -->
  <!-- UPGRADE & BILLING MODALS                                                  -->
  <!-- ========================================================================= -->
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

  <!-- ========================================================================= -->
  <!-- JAVASCRIPT ENGINE (All Working Interactive Logic Intact)                  -->
  <!-- ========================================================================= -->
  <script>
    // =========================================================================
    // 1. SCENARIOS DATABASE
    // =========================================================================
    const demoScenarios = {
      'medicine-refill': {
        name: 'Medicine Refill',
        utterance: '"Kivo, order my blood pressure medication from Apollo Pharmacy"',
        voice: 'Ordering blood pressure tablets, Amlodipine 5 milligrams from Apollo Pharmacy.',
        intent: {
          primaryTask: 'Pharmacy Refill Order',
          targetProfile: 'Dr. Sharma Rx (#A-928)',
          servicePlatform: 'Apollo Pharmacy 24/7',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹380.00',
          scenarioKey: 'medicine-refill'
        },
        browser: {
          url: 'https://apollo247.com/prescriptions/reorder',
          title: 'Amlodipine Besylate 5mg (Strip of 30 Tablets)',
          desc: 'Apollo Pharmacy Ltd. • Prescription on file (#AP-9921-BLR)',
          price: '₹380.00',
          badge: 'PRESCRIPTION VERIFIED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.10s]', text: 'Spoken request captured: "order my blood pressure medication"', status: 'done' },
          { source: 'Nova Lite', time: '[0.28s]', text: 'Parsed intent: pharmacy_order_tool(item="Amlodipine 5mg")', status: 'done' },
          { source: 'Nova Vision', time: '[0.65s]', text: 'Prescription matched with Dr. Sharma clinic registry', status: 'done' },
          { source: 'Nova Act', time: '[1.10s]', text: 'Headless browser logged in, cart staged for ₹380.00', status: 'active' },
          { source: 'Family API', time: '[1.30s]', text: 'WhatsApp receipt queued for Rohan (+91 98450...)', status: 'pending' }
        ]
      },
      'grocery-restock': {
        name: 'Grocery Essentials',
        utterance: '"Kivo, get two liters of toned milk and whole wheat bread"',
        voice: 'Adding two liters of Amul toned milk and fresh wheat bread to BigBasket cart.',
        intent: {
          primaryTask: 'Grocery Restock Cart',
          targetProfile: 'Standard Pantry List',
          servicePlatform: 'BigBasket Express',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹165.00',
          scenarioKey: 'grocery-restock'
        },
        browser: {
          url: 'https://bigbasket.com/cart/instant',
          title: 'Amul Taaza 2L Milk + Whole Wheat Bread',
          desc: 'BigBasket Express Delivery • Slot: Today 4:00 PM',
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
      'ride-clinic': {
        name: 'Ride to Clinic',
        utterance: '"Kivo, book a cab to Dr. Sharma\'s clinic in Indiranagar"',
        voice: 'Booking an Uber Premier cab to Dr. Sharma Clinic in Indiranagar.',
        intent: {
          primaryTask: 'Clinic Ride Dispatch',
          targetProfile: 'Senior Accessibility Ride',
          servicePlatform: 'Uber Health Premier',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹320.00',
          scenarioKey: 'ride-clinic'
        },
        browser: {
          url: 'https://uber.com/health/dispatch',
          title: 'Uber Premier — Indiranagar Clinic Drop',
          desc: 'Driver Rajesh (Swift Dzire) • 4.9 ★ • Arriving in 4 mins',
          price: '₹320.00',
          badge: 'RIDE DISPATCH READY'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.12s]', text: 'Voice command captured: "book cab to clinic"', status: 'done' },
          { source: 'Nova Lite', time: '[0.30s]', text: 'Destination mapped: 100ft Road Indiranagar Clinic', status: 'done' },
          { source: 'Nova Vision', time: '[0.70s]', text: 'Senior accessibility entrance verified on clinic map', status: 'done' },
          { source: 'Nova Act', time: '[1.05s]', text: 'Uber Health API staged ride (₹320.00)', status: 'active' },
          { source: 'Family API', time: '[1.25s]', text: 'Live GPS trip link sent to family WhatsApp', status: 'pending' }
        ]
      },
      'utility-bill': {
        name: 'Utility Bill Pay',
        utterance: '"Kivo, pay this month\'s electricity bill"',
        voice: 'Paying Bescom electricity bill of ₹1,420 for account 90214.',
        intent: {
          primaryTask: 'Electricity Bill Payment',
          targetProfile: 'Consumer ID: 8849201',
          servicePlatform: 'BESCOM Karnataka',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹1,420.00',
          scenarioKey: 'utility-bill'
        },
        browser: {
          url: 'https://bescom.org/quickpay/consumer',
          title: 'Electricity Bill — Due Sept 24',
          desc: 'Consumer #8849201 • Units: 210 kWh • Auto-receipt generated',
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
      'flight-status': {
        name: 'Flight Status',
        utterance: '"Kivo, check if Rohan\'s flight from San Francisco is on time"',
        voice: 'Flight DL284 from San Francisco is delayed by two hours, landing at 9:30 PM.',
        intent: {
          primaryTask: 'Flight Delay Telemetry',
          targetProfile: 'Family Passenger: Rohan',
          servicePlatform: 'FlightRadar24 Stream',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          totalCharge: '₹0.00',
          scenarioKey: 'flight-status'
        },
        browser: {
          url: 'https://flightradar24.com/DL284/live',
          title: 'Flight DL284 (SFO → BLR) Delayed 120m',
          desc: 'Gate B12 • New ETA: 9:30 PM IST • Cab pick-up re-scheduled',
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

    // State Machine
    let activeScenarioKey = 'medicine-refill';
    let isListening = false;
    let isSpeaking = false;
    let speechRecognitionInstance = null;
    let audioContext = null;
    let audioStream = null;

    function selectDemoScenario(key) {
      if (!demoScenarios[key]) return;
      activeScenarioKey = key;
      const s = demoScenarios[key];

      // Update Scenario Pills
      ['medicine', 'grocery', 'ride', 'utility', 'flight'].forEach(type => {
        const pill = document.getElementById(`pill-scenario-${type}`);
        if (!pill) return;
        const matches = (type === 'medicine' && key === 'medicine-refill') ||
                        (type === 'grocery' && key === 'grocery-restock') ||
                        (type === 'ride' && key === 'ride-clinic') ||
                        (type === 'utility' && key === 'utility-bill') ||
                        (type === 'flight' && key === 'flight-status');
        if (matches) {
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

      // Update Browser Simulator
      const urlEl = document.getElementById('demo-browser-url');
      const titleEl = document.getElementById('demo-service-title');
      const descEl = document.getElementById('demo-service-desc');
      const priceEl = document.getElementById('demo-service-price');
      const badgeEl = document.getElementById('demo-service-badge');
      const scenarioNameEl = document.getElementById('demo-active-scenario-name');

      if (urlEl) urlEl.innerText = s.browser.url;
      if (titleEl) titleEl.innerText = s.browser.title;
      if (descEl) descEl.innerText = s.browser.desc;
      if (priceEl) priceEl.innerText = s.browser.price;
      if (badgeEl) badgeEl.innerText = s.browser.badge;
      if (scenarioNameEl) scenarioNameEl.innerText = s.name;

      // Update JSON Viewer
      const jsonEl = document.getElementById('demo-intent-json');
      if (jsonEl) jsonEl.innerText = JSON.stringify(s.intent, null, 2);

      // Render Activity Stream
      renderActivityStream(s.activity);
    }

    function renderActivityStream(activities) {
      const streamEl = document.getElementById('demo-activity-stream');
      if (!streamEl) return;
      streamEl.innerHTML = '';

      activities.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'p-3 rounded-2xl bg-kivo-surfacePanel border border-kivo-border flex items-center justify-between text-xs transition-all animate-[loadFadeUp_0.3s_ease_both]';
        row.style.animationDelay = `${index * 80}ms`;

        const isDone = item.status === 'done';
        const isActive = item.status === 'active';

        row.innerHTML = `
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${isDone ? 'bg-emerald-100 text-emerald-700' : (isActive ? 'bg-purple-100 text-purple-700 animate-pulse' : 'bg-slate-200 text-slate-500')}">
              ${isDone ? '✓' : (isActive ? '●' : '○')}
            </span>
            <span class="font-bold text-kivo-text font-display">${item.source}</span>
            <span class="text-kivo-textSecondary truncate">${item.text}</span>
          </div>
          <span class="text-[10px] font-mono font-bold text-kivo-textMuted flex-shrink-0 ml-2">${item.time}</span>
        `;
        streamEl.appendChild(row);
      });
    }

    function rerunActiveSimulation() {
      selectDemoScenario(activeScenarioKey);
      const btn = document.getElementById('btn-dispatch-order');
      if (btn) {
        btn.innerText = 'Confirm & Dispatch Order';
        btn.className = 'px-4 py-1.5 rounded-xl bg-gradient-to-r from-kivo-teal to-kivo-cyan hover:opacity-95 text-slate-950 text-xs font-extrabold shadow-kivo-sm transition-all cta-press';
      }
    }

    function confirmAndDispatchOrder() {
      const btn = document.getElementById('btn-dispatch-order');
      if (!btn) return;
      btn.innerText = '✓ Order Dispatched & Family Notified';
      btn.className = 'px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-sm transition-all';
      
      const s = demoScenarios[activeScenarioKey];
      if (s) {
        const completedActivity = s.activity.map(a => ({ ...a, status: 'done' }));
        renderActivityStream(completedActivity);
      }
    }

    function cancelPendingOrder() {
      const btn = document.getElementById('btn-dispatch-order');
      if (btn) {
        btn.innerText = 'Order Cancelled';
        btn.className = 'px-4 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold transition-all';
      }
    }

    function toggleNovaIntentJson() {
      const viewer = document.getElementById('demo-json-viewer');
      const chevron = document.getElementById('demo-json-chevron');
      if (!viewer) return;
      const isHidden = viewer.classList.contains('hidden');
      if (isHidden) {
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

    // Speech Recognition & Sound Wave
    function toggleVoiceRecognition() {
      const btn = document.getElementById('btn-speak-mic');
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
        alert("Speech recognition is not supported in this browser. You can select scenarios above.");
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

          // Fuzzy match to scenario
          const lower = transcript.toLowerCase();
          if (lower.includes('milk') || lower.includes('bread') || lower.includes('grocery')) {
            selectDemoScenario('grocery-restock');
          } else if (lower.includes('cab') || lower.includes('taxi') || lower.includes('clinic') || lower.includes('drive')) {
            selectDemoScenario('ride-clinic');
          } else if (lower.includes('bill') || lower.includes('electricity') || lower.includes('power')) {
            selectDemoScenario('utility-bill');
          } else if (lower.includes('flight') || lower.includes('plane') || lower.includes('airport')) {
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

    function toggleDemoVoicePlayback() {
      const label = document.getElementById('label-listen-voice');
      const icon = document.getElementById('icon-listen-voice');

      if (isSpeaking) {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        isSpeaking = false;
        if (label) label.innerText = 'Listen Voice';
        if (icon) icon.innerText = '🔊';
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

        u.onend = () => {
          isSpeaking = false;
          if (label) label.innerText = 'Listen Voice';
          if (icon) icon.innerText = '🔊';
        };
        u.onerror = () => {
          isSpeaking = false;
          if (label) label.innerText = 'Listen Voice';
          if (icon) icon.innerText = '🔊';
        };

        window.speechSynthesis.speak(u);
      }
    }

    // Smooth Scroll to Live Demo
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

      // 15 minutes (0.25h) saved per errand
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

    // =========================================================================
    // 2. AUTHENTICATION & POSTGRESQL API INTEGRATION
    // =========================================================================
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

    // Real PostgreSQL Sign Up
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

        // Success transition
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

    // Real PostgreSQL Sign In
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
        if (chevron) chevron.classList.add('rotate-180');
      } else {
        closeProfileDropdown();
      }
    }

    function closeProfileDropdown() {
      const dd = document.getElementById('nav-profile-dropdown');
      const chevron = document.getElementById('nav-profile-chevron');
      if (dd) dd.classList.add('dropdown-hidden');
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

    // Scroll Navbar Effect
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
      if (dd && !dd.classList.contains('dropdown-hidden')) {
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
'''

if __name__ == '__main__':
    html = generate_html()
    with open('d:/ElderCare/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Successfully wrote index.html, length: {len(html)} chars')

