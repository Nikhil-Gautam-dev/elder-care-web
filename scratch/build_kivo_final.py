import os

final_html = r'''<!DOCTYPE html>
<html lang="en" class="scroll-smooth light-theme">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Kivo — Autonomous Digital Caretaker for the Elderly | "You Speak. Kivo Clicks."</title>
  <meta name="description" content="Kivo is an AI-powered autonomous digital caretaker for the elderly. Speak naturally to refill medicine, book cabs, and pay utility bills while keeping family informed." />
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%200%22%2024%22%2024%22 fill=%22none%22 stroke=%22%230FA7A0%22 stroke-width=%222%22><path stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z%22/></svg>">

  <!-- Google Fonts: Plus Jakarta Sans, Outfit & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
            display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
          }
        }
      }
    }
  </script>

  <style>
    /* ========================================================================= */
    /* 1. UNIFIED DESIGN SYSTEM — CSS CUSTOM PROPERTIES (Pass 12 Light-First)    */
    /* ========================================================================= */
    :root, html.light-theme {
      --bg-page: #F4F7F9;
      --bg-section: #EEF3F6;
      --bg-panel: #F8FAFB;
      --bg-card: #FFFFFF;
      --bg-inner: #F1F5F8;
      --bg-input: #FFFFFF;
      --text-primary: #0B1424;
      --text-secondary: #334155;
      --text-muted: #64748B;
      --text-tech: #53677A;
      --border-subtle: #E2E8F0;
      --border-main: #D5E0E6;
      --border-strong: #BFCFD8;
      --kivo-teal: #0FA7A0;
      --kivo-cyan: #0FA7A0;
      --kivo-accent: #12C9C2;
      --kivo-blue: #237DD6;
      --color-success: #15956D;
      --color-warning: #C58A24;
      --color-danger: #C94F4F;
      --color-purple: #7C3AED;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
      --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.05);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08);
      --glow-cyan: 0 0 14px rgba(15, 167, 160, 0.25);
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --touch-min: 42px;
    }

    /* 2. DARK THEME OVERRIDES */
    html.dark-theme {
      --bg-page: #05080D;
      --bg-section: #070C13;
      --bg-panel: #0A111A;
      --bg-card: #0D1622;
      --bg-inner: #101A27;
      --bg-input: #09121C;
      --text-primary: #F4F8FB;
      --text-secondary: #B8C7D4;
      --text-muted: #7E91A3;
      --text-tech: #718598;
      --border-subtle: #142332;
      --border-main: #1A2C3A;
      --border-strong: #284454;
      --kivo-teal: #13B8AE;
      --kivo-cyan: #18D7D0;
      --kivo-accent: #18D7D0;
      --kivo-blue: #3AA8FF;
      --color-success: #20C997;
      --color-warning: #E4AA3A;
      --color-danger: #EF6A6A;
      --color-purple: #A78BFA;
      --shadow-sm: 0 2px 6px -1px rgba(0, 0, 0, 0.5);
      --shadow-md: 0 6px 18px -3px rgba(0, 0, 0, 0.6);
      --shadow-lg: 0 16px 40px -4px rgba(0, 0, 0, 0.8);
      --glow-cyan: 0 0 16px -2px rgba(24, 215, 208, 0.3);
    }

    /* 3. SENIOR MODE (Refined Usability & Accessibility Layer) */
    html.senior-mode {
      --touch-min: 52px;
    }

    html.senior-mode body {
      font-size: 1.08rem;
      line-height: 1.65;
    }

    html.senior-mode button, 
    html.senior-mode a.kivo-btn, 
    html.senior-mode input, 
    html.senior-mode select {
      min-height: var(--touch-min);
      font-size: 1rem;
    }

    html.senior-mode .hero-title-clamp {
      font-size: clamp(2.3rem, 4.4vw, 3.8rem);
    }
    html.senior-mode .section-title-clamp {
      font-size: clamp(1.5rem, 2.5vw, 2.2rem);
    }

    html.senior-mode .senior-hide { display: none !important; }
    html.senior-mode .senior-only { display: block !important; }
    .senior-only { display: none; }

    /* High Contrast Class */
    html.high-contrast {
      --text-primary: #000000 !important;
      --text-secondary: #0F172A !important;
      --border-main: #0284C7 !important;
      --bg-page: #FFFFFF !important;
      --bg-section: #F1F5F9 !important;
      --bg-card: #FFFFFF !important;
    }
    html.dark-theme.high-contrast {
      --text-primary: #FFFFFF !important;
      --text-secondary: #F8FAFC !important;
      --border-main: #38BDF8 !important;
      --bg-page: #000000 !important;
      --bg-section: #050B14 !important;
      --bg-card: #0D1622 !important;
    }

    /* Global Transitions for Smooth Theme Switching */
    body, header, section, div, button, input, select, pre {
      transition: background-color 200ms ease, border-color 200ms ease, color 150ms ease, box-shadow 200ms ease;
    }

    /* Accessibility Focus Rings */
    *:focus-visible {
      outline: 2px solid var(--kivo-cyan) !important;
      outline-offset: 2px !important;
      border-radius: 6px;
    }

    body {
      background-color: var(--bg-page);
      color: var(--text-primary);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Typography Clamps */
    .hero-title-clamp {
      font-size: clamp(2.2rem, 4.2vw, 3.6rem);
      line-height: 1.12;
      letter-spacing: -0.025em;
    }
    .section-title-clamp {
      font-size: clamp(1.4rem, 2.4vw, 2.1rem);
      line-height: 1.22;
      letter-spacing: -0.015em;
    }

    /* UI Component Classes */
    .kivo-card {
      background: var(--bg-card);
      border: 1px solid var(--border-main);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .kivo-card:hover {
      border-color: var(--border-strong);
    }
    .kivo-panel {
      background: var(--bg-panel);
      border: 1px solid var(--border-main);
      border-radius: var(--radius-md);
    }
    .kivo-input {
      background: var(--bg-input);
      border: 1px solid var(--border-main);
      color: var(--text-primary);
      border-radius: var(--radius-md);
    }
    .kivo-input:focus {
      border-color: var(--kivo-cyan);
      box-shadow: 0 0 0 1px var(--kivo-cyan);
    }

    .cta-press {
      transition: transform 100ms ease, opacity 100ms ease;
    }
    .cta-press:active {
      transform: scale(0.98);
    }

    /* Audio visualizer wave pulses */
    @keyframes wavePulse {
      0%, 100% { height: 6px; }
      50% { height: 22px; }
    }
    .wave-bar {
      animation: wavePulse 1s ease-in-out infinite;
    }
    .wave-bar:nth-child(2) { animation-delay: 0.15s; }
    .wave-bar:nth-child(3) { animation-delay: 0.3s; }
    .wave-bar:nth-child(4) { animation-delay: 0.45s; }
    .wave-bar:nth-child(5) { animation-delay: 0.2s; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-page); }
    ::-webkit-scrollbar-thumb { background: var(--border-main); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--kivo-cyan); }
  </style>
</head>

<body class="antialiased selection:bg-[#0FA7A0] selection:text-white">

  <!-- Accessibility Skip Link -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-white focus:rounded-lg focus:font-bold focus:text-xs">
    Skip to main content
  </a>

  <div id="a11y-status-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>

  <!-- Toast Notification Container -->
  <div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none" aria-live="polite"></div>

  <!-- ========================================================================= -->
  <!-- 1. TOP APPLICATION NAVBAR                                                 -->
  <!-- ========================================================================= -->
  <header class="sticky top-0 z-40 backdrop-blur-md border-b shadow-sm transition-all h-16" style="background: var(--bg-section); border-color: var(--border-main);">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <a href="#" class="flex items-center gap-2.5 group focus:outline-none" aria-label="Kivo Home">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
            <!-- Shield Vector Icon -->
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
          </div>
          <span class="text-lg font-bold font-display tracking-tight transition-colors" style="color: var(--text-primary);">
            Kivo<span style="color: var(--kivo-cyan);">.</span>
          </span>
        </a>
        <span class="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold" style="background: var(--bg-input); border: 1px solid var(--border-main); color: var(--text-tech);">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          v2.4 AGENT CONSOLE
        </span>
      </div>

      <!-- Navigation Links -->
      <nav class="hidden lg:flex items-center gap-5 font-medium text-xs senior-hide" style="color: var(--text-secondary);" aria-label="Main Navigation">
        <a href="#how-it-works" class="hover:text-teal-600 transition-colors">How It Works</a>
        <a href="#live-demo" class="font-semibold transition-colors flex items-center gap-1.5" style="color: var(--kivo-cyan);">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--kivo-cyan);"></span>
          Live Demo
        </a>
        <a href="#pillars" class="hover:text-teal-600 transition-colors">Pillars</a>
        <a href="#nova-architecture" class="hover:text-teal-600 transition-colors">Nova AI</a>
        <a href="#calculator" class="hover:text-teal-600 transition-colors">ROI Calculator</a>
        <a href="#pricing" class="hover:text-teal-600 transition-colors">Pricing</a>
      </nav>

      <!-- Center-Right Controls & Profile Center -->
      <div class="flex items-center gap-2 sm:gap-2.5">
        
        <!-- TRY NOW Button (Pass 12 Canonical Route) -->
        <button onclick="handleTryNowClick()" id="btn-nav-try-now" class="h-9 sm:h-10 px-3.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 cta-press whitespace-nowrap text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));" aria-label="Try Kivo Digital Caretaker">
          <span>TRY NOW</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        </button>

        <!-- Theme Switcher Button -->
        <button onclick="cycleThemeMode()" id="btn-nav-theme" class="h-9 sm:h-10 w-9 sm:w-10 rounded-xl flex items-center justify-center transition-all cta-press" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);" title="Toggle Theme (Light / Dark / System)" aria-label="Toggle Color Theme">
          <svg id="theme-icon-light" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>
          <svg id="theme-icon-dark" class="w-4 h-4 hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/></svg>
        </button>

        <!-- Senior Mode Toggle -->
        <button onclick="toggleSeniorMode()" id="btn-senior-mode-toggle" class="h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 sm:gap-2 transition-all cta-press" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);" aria-pressed="false" aria-label="Toggle Senior Mode">
          <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span id="label-senior-mode-text" class="hidden sm:inline" style="color: var(--text-secondary);">Senior Mode: OFF</span>
          <span id="pill-senior-dot" class="w-2 h-2 rounded-full bg-slate-400"></span>
        </button>

        <!-- Notification Bell -->
        <button onclick="openNotificationsDrawer()" id="btn-nav-notifs" class="relative h-9 sm:h-10 w-9 sm:w-10 rounded-xl flex items-center justify-center transition-all cta-press flex-shrink-0" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);" aria-label="Open Caretaker Notifications">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
          <span id="nav-notif-badge" class="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px] ring-1 ring-white">
            0
          </span>
        </button>

        <!-- PASS 12: GUEST STATE BUTTON — [ LogIn ] Sign In to Kivo (Visible when unauthenticated) -->
        <div id="nav-guest-area" class="flex items-center">
          <button onclick="navigateToLogin()" id="btn-guest-signin" class="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-2 cta-press whitespace-nowrap" style="background: var(--bg-card); border: 1.5px solid var(--kivo-cyan); color: var(--kivo-cyan);" aria-label="Sign In to Kivo">
            <svg class="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/>
            </svg>
            <span>Sign In to Kivo</span>
          </button>
        </div>

        <!-- PASS 12: AUTHENTICATED STATE — Profile Control Center Dropdown Trigger (Hidden when unauthenticated) -->
        <div class="relative hidden" id="nav-auth-area">
          <button onclick="toggleProfileDropdown()" id="btn-nav-profile" class="h-9 sm:h-10 pl-1.5 pr-2.5 rounded-xl flex items-center gap-2 transition-all cta-press shadow-sm focus:outline-none" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);" aria-expanded="false" aria-haspopup="true" aria-label="User Account Menu">
            <div class="relative flex-shrink-0">
              <div id="nav-user-avatar" class="w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
                AD
              </div>
              <span id="nav-user-status-dot" class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
            <span id="nav-user-name" class="font-bold text-xs max-w-[70px] sm:max-w-[100px] truncate">Admin</span>
            <span id="nav-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">PRO</span>
            <svg id="nav-profile-chevron" class="w-3 h-3 transition-transform duration-150" style="color: var(--text-secondary);" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>

          <!-- Dropdown Panel -->
          <div id="nav-profile-dropdown" class="hidden absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden text-left p-1.5" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            
            <!-- User Header -->
            <div class="p-3 rounded-xl mb-1 space-y-2" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
              <div class="flex items-center gap-3">
                <div id="dropdown-user-avatar" class="w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center text-white shadow-sm flex-shrink-0" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
                  AD
                </div>
                <div class="space-y-0.5 min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <span id="dropdown-user-name" class="font-bold text-xs font-display truncate" style="color: var(--text-primary);">Administrator</span>
                    <span id="dropdown-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">PRO</span>
                  </div>
                  <span id="dropdown-user-email" class="text-[11px] truncate block" style="color: var(--text-secondary);">admin@kivo.ai</span>
                </div>
              </div>
              
              <!-- Plan Badge -->
              <div class="px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[10px] font-mono" style="background: var(--bg-page); border: 1px solid var(--border-main);">
                <span style="color: var(--text-tech);">PLAN: <span id="dropdown-plan-text" class="font-bold" style="color: var(--text-primary);">Kivo Pro</span></span>
                <span id="dropdown-plan-days" class="text-emerald-500 font-bold">Active</span>
              </div>
            </div>

            <!-- Links -->
            <div class="space-y-0.5 text-xs font-medium" style="color: var(--text-primary);">
              <button onclick="closeProfileDropdown(); openProfileModal();" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center gap-2.5 text-left">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                <span>My Profile & Account</span>
              </button>

              <button onclick="closeProfileDropdown(); openSettingsModal('appearance');" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center gap-2.5 text-left">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span>Settings & Preferences</span>
              </button>

              <button onclick="toggleSeniorMode();" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center justify-between text-left">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span>Senior Mode</span>
                </div>
                <span id="dropdown-senior-status" class="text-[10px] font-mono font-bold" style="color: var(--text-tech);">OFF</span>
              </button>

              <button onclick="closeProfileDropdown(); openNotificationsDrawer();" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center justify-between text-left">
                <div class="flex items-center gap-2.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
                  <span>Caretaker Alerts</span>
                </div>
                <span id="dropdown-notif-count" class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px]">2</span>
              </button>

              <button onclick="closeProfileDropdown(); openDeveloperStateModal();" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center gap-2.5 text-left">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                <span>Agent State Inspector</span>
              </button>

              <button onclick="closeProfileDropdown(); openProfileModal();" id="dropdown-btn-upgrade" class="w-full px-3 py-2 rounded-lg hover:bg-teal-500/10 hover:text-teal-600 transition-colors flex items-center gap-2.5 text-left font-semibold" style="color: var(--kivo-cyan);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                <span id="dropdown-upgrade-label">Manage Subscription</span>
              </button>
            </div>

            <!-- PASS 12: Real Sign Out Action -->
            <div class="mt-1 pt-1 border-t" style="border-color: var(--border-subtle);">
              <button onclick="handleLogoutClick(event)" id="dropdown-btn-signout" class="w-full px-3 py-2 rounded-lg hover:bg-rose-500/15 text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2.5 text-xs font-semibold text-left">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                <span id="dropdown-signout-text">Sign Out</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- MAIN CONTENT CONTAINER                                                    -->
  <!-- ========================================================================= -->
  <main id="main-content">

    <!-- ======================================================================= -->
    <!-- SENIOR MODE HERO COMMAND CENTER                                         -->
    <!-- ======================================================================= -->
    <section id="senior-command-center" class="senior-only py-6 px-4 sm:px-6" style="background: var(--bg-section); border-bottom: 2px solid var(--kivo-cyan);">
      <div class="max-w-4xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs" style="background: rgba(15, 167, 160, 0.15); color: var(--kivo-cyan); border: 1px solid var(--kivo-cyan);">
          <span>👓 SENIOR MODE ACTIVE</span> • <span>Clear Layout & Large Touch Controls</span>
        </div>
        
        <h1 class="text-2xl sm:text-3xl font-bold font-display" style="color: var(--text-primary);">
          Good day! What would you like Kivo to take care of?
        </h1>

        <p class="text-sm sm:text-base font-medium" style="color: var(--text-secondary);">
          Tap a large button below or speak naturally. Kivo prepares everything and asks for your approval before placing orders.
        </p>

        <!-- 4 Large Senior Action Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
          
          <button onclick="selectDemoScenario('medicine-refill'); toggleVoiceRecognition(); scrollToLiveDemo();" class="p-5 rounded-2xl flex items-center gap-4 transition-all cta-press group" style="background: var(--bg-card); border: 2px solid var(--kivo-cyan); box-shadow: var(--glow-cyan);">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style="background: var(--kivo-cyan);">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0V12a3 3 0 01-3 3z"/></svg>
            </div>
            <div>
              <span class="block text-base font-bold font-display" style="color: var(--text-primary);">Talk to Kivo</span>
              <span class="block text-xs mt-0.5" style="color: var(--text-secondary);">Speak into mic to refill medicine, book cab or pay bill</span>
            </div>
          </button>

          <button onclick="selectDemoScenario('medicine-refill'); scrollToLiveDemo();" class="p-5 rounded-2xl flex items-center gap-4 transition-all cta-press group" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
            </div>
            <div>
              <span class="block text-base font-bold font-display" style="color: var(--text-primary);">Refill Medicine</span>
              <span class="block text-xs mt-0.5" style="color: var(--text-secondary);">Order Amlodipine 5mg from Apollo Pharmacy</span>
            </div>
          </button>

          <button onclick="selectDemoScenario('ride-clinic'); scrollToLiveDemo();" class="p-5 rounded-2xl flex items-center gap-4 transition-all cta-press group" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V14.25m13.5-6.75h-13.5"/></svg>
            </div>
            <div>
              <span class="block text-base font-bold font-display" style="color: var(--text-primary);">Book Cab to Clinic</span>
              <span class="block text-xs mt-0.5" style="color: var(--text-secondary);">Schedule accessible ride to Dr. Sharma Clinic</span>
            </div>
          </button>

          <button onclick="openNotificationsDrawer();" class="p-5 rounded-2xl flex items-center gap-4 transition-all cta-press group" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
            </div>
            <div>
              <span class="block text-base font-bold font-display" style="color: var(--text-primary);">Read Notifications</span>
              <span class="block text-xs mt-0.5" style="color: var(--text-secondary);">Hear recent orders and family alerts read aloud</span>
            </div>
          </button>

        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 2. COMPACT HERO SECTION (2-Column Product Entrance)                     -->
    <!-- ======================================================================= -->
    <section class="relative py-10 md:py-14 overflow-hidden border-b" style="background: var(--bg-page); border-color: var(--border-subtle);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          <!-- Left Product Introduction -->
          <div class="lg:col-span-7 space-y-4 text-left">
            
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[11px] font-mono" style="background: var(--bg-panel); border: 1px solid var(--border-main); color: var(--text-tech);">
              <span class="flex h-2 w-2 rounded-full animate-pulse" style="background: var(--kivo-cyan);"></span>
              <span>POWERED BY AMAZON NOVA AI & WEB AUTONOMOUS AGENTS</span>
            </div>

            <h1 class="hero-title-clamp font-bold font-display tracking-tight" style="color: var(--text-primary);">
              You Speak.<br />
              <span class="bg-clip-text text-transparent" style="background-image: linear-gradient(135deg, var(--kivo-teal), var(--kivo-blue));">
                Kivo Clicks.
              </span>
            </h1>

            <p class="text-sm sm:text-base font-normal max-w-2xl leading-relaxed" style="color: var(--text-secondary);">
              The autonomous AI caretaker for the elderly. Speak naturally to refill prescriptions, book accessible clinic rides, and pay utility bills. Kivo navigates complex web portals, requests confirmation, and keeps family caregivers synchronized.
            </p>

            <div class="pt-2 flex flex-wrap items-center gap-3">
              <!-- Pass 12: Dedicated Try Live Demo Action -->
              <button onclick="handleTryLiveDemoClick()" class="h-11 px-5 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-2 cta-press text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"/></svg>
                <span>Try Live Kivo Demo →</span>
              </button>

              <button onclick="toggleVoiceRecognition()" id="btn-hero-speak-mic" class="h-11 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cta-press" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);">
                <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0V12a3 3 0 01-3 3z"/></svg>
                <span id="hero-mic-label">Speak With Mic</span>
              </button>
            </div>

            <!-- Key Trust Metrics Strip -->
            <div class="pt-3 grid grid-cols-3 gap-3 max-w-lg text-left">
              <div class="p-2.5 rounded-lg" style="background: var(--bg-panel); border: 1px solid var(--border-subtle);">
                <span class="block text-xs font-bold font-mono" style="color: var(--kivo-cyan);">1-TAP SAFETY</span>
                <span class="text-[11px] block" style="color: var(--text-muted);">Human Approval Gate</span>
              </div>
              <div class="p-2.5 rounded-lg" style="background: var(--bg-panel); border: 1px solid var(--border-subtle);">
                <span class="block text-xs font-bold font-mono text-emerald-600">WHATSAPP</span>
                <span class="text-[11px] block" style="color: var(--text-muted);">Caregiver Loop</span>
              </div>
              <div class="p-2.5 rounded-lg" style="background: var(--bg-panel); border: 1px solid var(--border-subtle);">
                <span class="block text-xs font-bold font-mono text-amber-600">ZERO MOCK</span>
                <span class="text-[11px] block" style="color: var(--text-muted);">PostgreSQL & MCP</span>
              </div>
            </div>

          </div>

          <!-- Right Live Agent Preview Card -->
          <div class="lg:col-span-5">
            <div class="p-5 rounded-2xl space-y-3.5 shadow-lg" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              
              <!-- Agent Header -->
              <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--border-subtle);">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span class="font-mono text-xs font-bold" style="color: var(--text-primary);">KIVO AGENT • ONLINE</span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
                  Nova Sonic v2
                </span>
              </div>

              <!-- Spoken Utterance Visualizer -->
              <div class="p-3.5 rounded-xl space-y-1.5" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
                <div class="flex items-center justify-between text-[10px] font-mono" style="color: var(--text-tech);">
                  <span>CAPTURED VOICE UTTERANCE</span>
                  <span>98% CONFIDENCE</span>
                </div>
                <p class="text-xs sm:text-sm font-semibold italic" style="color: var(--text-primary);">
                  "Kivo, order my blood pressure medication from Apollo Pharmacy"
                </p>
              </div>

              <!-- Pipeline Decomposition Flow -->
              <div class="space-y-2 text-xs font-mono">
                
                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">1. Intent Classification</span>
                  <span class="font-bold text-emerald-600">PHARMACY_REFILL</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">2. Rx Prescription Matched</span>
                  <span class="font-bold text-teal-600">#AP-9921-BLR</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">3. Headless Browser Cart</span>
                  <span class="font-bold text-amber-600">Staged ₹380.00</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: rgba(15, 167, 160, 0.08); border: 1px solid rgba(15, 167, 160, 0.3);">
                  <span style="color: var(--kivo-cyan);">4. Human Approval Status</span>
                  <span class="font-bold text-teal-600 animate-pulse">WAITING APPROVAL</span>
                </div>

              </div>

              <!-- Direct Jump Action -->
              <button onclick="scrollToLiveDemo()" class="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors" style="background: var(--bg-panel); border: 1px solid var(--border-main); color: var(--kivo-cyan);">
                <span>Inspect Full Live Demo Below</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 3. LIVE KIVO DEMO WORKSPACE                                             -->
    <!-- ======================================================================= -->
    <section id="live-demo" class="py-12 md:py-16 border-b" style="background: var(--bg-section); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        
        <!-- Section Header & Scenario Switcher -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-5" style="border-color: var(--border-subtle);">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
              <span>● LIVE AGENT SIMULATOR</span>
            </div>
            <h2 class="section-title-clamp font-bold font-display mt-1" style="color: var(--text-primary);">
              Interactive Kivo Workspace
            </h2>
            <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
              Test voice commands, inspect real-time AI reasoning, observe browser cart staging, and confirm orders.
            </p>
          </div>

          <!-- Scenario Pills with Clean Vector SVG Icons -->
          <div class="flex flex-wrap items-center gap-2">
            
            <button onclick="selectDemoScenario('medicine-refill')" id="pill-scenario-medicine-refill" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cta-press flex items-center gap-1.5 text-white" style="background: var(--kivo-cyan);">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
              <span>Medicine Refill</span>
            </button>

            <button onclick="selectDemoScenario('grocery-restock')" id="pill-scenario-grocery-restock" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cta-press flex items-center gap-1.5" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-secondary);">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/></svg>
              <span>Grocery Restock</span>
            </button>

            <button onclick="selectDemoScenario('ride-clinic')" id="pill-scenario-ride-clinic" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cta-press flex items-center gap-1.5" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-secondary);">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V14.25m13.5-6.75h-13.5"/></svg>
              <span>Clinic Cab</span>
            </button>

            <button onclick="selectDemoScenario('utility-bill')" id="pill-scenario-utility-bill" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cta-press flex items-center gap-1.5" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-secondary);">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
              <span>Utility Bill</span>
            </button>

            <button onclick="selectDemoScenario('flight-status')" id="pill-scenario-flight-status" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cta-press flex items-center gap-1.5" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-secondary);">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              <span>Flight Status</span>
            </button>

          </div>
        </div>

        <!-- 2-Column Live Demo Workbench -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left: Voice & Intent Reasoning Panel -->
          <div class="lg:col-span-5 space-y-4">
            
            <div class="p-5 rounded-2xl space-y-4 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              
              <!-- Voice Bar with Web Audio Waveform Indicator -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div id="demo-voice-wave" class="flex items-center gap-1 h-5 px-2 rounded bg-teal-500/10">
                    <span class="w-1 bg-teal-600 rounded wave-bar"></span>
                    <span class="w-1 bg-teal-600 rounded wave-bar"></span>
                    <span class="w-1 bg-teal-600 rounded wave-bar"></span>
                    <span class="w-1 bg-teal-600 rounded wave-bar"></span>
                    <span class="w-1 bg-teal-600 rounded wave-bar"></span>
                  </div>
                  <span class="text-xs font-bold font-mono" style="color: var(--text-primary);">VOICE PIPELINE</span>
                </div>

                <div class="flex items-center gap-2">
                  <button onclick="toggleVoiceRecognition()" id="btn-demo-mic" class="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cta-press" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0V12a3 3 0 01-3 3z"/></svg>
                    <span id="label-speak-mic">Speak With Mic</span>
                  </button>

                  <button onclick="toggleDemoVoicePlayback()" id="btn-demo-listen" class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all" style="background: var(--bg-inner); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"/></svg>
                    <span id="label-listen-voice">Listen Voice</span>
                  </button>
                </div>
              </div>

              <!-- Spoken Utterance Display -->
              <div class="p-3.5 rounded-xl space-y-1.5" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
                <div class="flex items-center justify-between text-[10px] font-mono" style="color: var(--text-tech);">
                  <span>CAPTURED UTTERANCE</span>
                  <span id="demo-confidence-badge">CONFIDENCE 98%</span>
                </div>
                <p id="demo-spoken-utterance" class="text-sm font-semibold italic leading-relaxed" style="color: var(--text-primary);">
                  "Kivo, order my blood pressure medication from Apollo Pharmacy"
                </p>
              </div>

              <!-- Intent Decomposition Grid -->
              <div class="space-y-2 text-xs font-mono">
                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">1. Primary Intent:</span>
                  <span id="demo-intent-task" class="font-bold text-teal-600">Pharmacy Refill Order</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">2. Matched Profile:</span>
                  <span id="demo-intent-profile" class="font-bold" style="color: var(--text-primary);">Dr. Sharma Rx (#A-928)</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">3. Service Platform:</span>
                  <span id="demo-intent-platform" class="font-bold text-amber-600">Apollo Pharmacy 24/7</span>
                </div>

                <div class="p-2.5 rounded-lg flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
                  <span style="color: var(--text-secondary);">4. Family WhatsApp Alert:</span>
                  <span id="demo-intent-family" class="font-bold text-purple-600">Rohan (Caregiver WhatsApp)</span>
                </div>
              </div>

              <!-- JSON Viewer Accordion -->
              <div class="pt-1">
                <button onclick="toggleNovaIntentJson()" class="w-full py-2 px-3 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-colors" style="background: var(--bg-inner); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
                  <span>{ } View Nova Intent Schema (JSON)</span>
                  <span id="demo-json-chevron">▼</span>
                </button>
                <pre id="demo-json-viewer" class="hidden mt-2 p-3 rounded-lg font-mono text-[11px] text-teal-600 overflow-x-auto max-h-48 leading-relaxed" style="background: var(--bg-page); border: 1px solid var(--border-main);"></pre>
              </div>

            </div>

          </div>

          <!-- Right: Headless Browser Cart & Human Gate Approval -->
          <div class="lg:col-span-7 space-y-4">
            
            <div class="p-5 rounded-2xl space-y-4 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              
              <!-- Simulated Browser Address Bar -->
              <div class="p-2.5 rounded-xl flex items-center gap-2 text-xs font-mono" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <div class="flex-1 px-2.5 py-1 rounded text-[11px] truncate flex items-center justify-between" style="background: var(--bg-page); border: 1px solid var(--border-main); color: var(--text-secondary);">
                  <span id="demo-browser-url">https://apollo247.com/prescriptions/reorder</span>
                  <span class="text-emerald-500 font-bold text-[9px] uppercase">🔒 SECURE SSL</span>
                </div>
              </div>

              <!-- Headless Cart Staging Preview -->
              <div class="p-4 rounded-xl space-y-3" style="background: var(--bg-page); border: 1px solid var(--border-main);">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span id="demo-browser-badge" class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
                      PRESCRIPTION VERIFIED
                    </span>
                    <h3 id="demo-browser-title" class="text-base font-bold font-display mt-1" style="color: var(--text-primary);">
                      Amlodipine Besylate 5mg (Strip of 30 Tablets)
                    </h3>
                    <p id="demo-browser-desc" class="text-xs" style="color: var(--text-secondary);">
                      Apollo Pharmacy Ltd. • Prescription on file (#AP-9921-BLR)
                    </p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <span class="text-[10px] font-mono uppercase block" style="color: var(--text-tech);">TOTAL PRICE</span>
                    <span id="demo-browser-price" class="text-lg font-bold font-mono text-teal-600">₹380.00</span>
                  </div>
                </div>

                <!-- Human In The Loop Safety Gate -->
                <div class="p-4 rounded-xl space-y-3" style="background: rgba(15, 167, 160, 0.06); border: 1px solid rgba(15, 167, 160, 0.3);">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span class="font-mono text-xs font-bold" style="color: var(--text-primary);">SAFETY GATE: HUMAN APPROVAL REQUIRED</span>
                    </div>
                    <span class="text-[10px] font-mono text-amber-600 font-bold">1-TAP GATE</span>
                  </div>
                  
                  <p class="text-xs" style="color: var(--text-secondary);">
                    Kivo staged your order in the background. Nothing will be purchased or dispatched until you tap Confirm below.
                  </p>

                  <div class="flex flex-wrap items-center gap-2.5 pt-1">
                    <button onclick="confirmAndDispatchOrder()" id="btn-dispatch-order" class="px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5 cta-press text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                      <span id="btn-dispatch-text">Confirm & Dispatch Order</span>
                    </button>

                    <button onclick="cancelPendingOrder()" id="btn-cancel-order" class="px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cta-press" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-secondary);">
                      Dismiss
                    </button>

                    <button onclick="rerunActiveSimulation()" class="px-3 py-2.5 rounded-xl text-xs font-medium ml-auto flex items-center gap-1 transition-colors" style="color: var(--text-tech);" title="Reset Simulation">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Real-Time Activity Event Stream -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-[11px] font-mono">
                  <span class="font-bold" style="color: var(--text-primary);">REAL-TIME AGENT ACTIVITY LOG</span>
                  <span style="color: var(--text-tech);">MCP / NOVA ENGINE</span>
                </div>
                <div id="demo-activity-stream" class="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px]">
                  <!-- Injected via JavaScript -->
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 4. HOW IT WORKS (7 Structured Steps)                                    -->
    <!-- ======================================================================= -->
    <section id="how-it-works" class="py-14 md:py-20 border-b" style="background: var(--bg-page); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            <span>● 7-STAGE AGENT WORKFLOW</span>
          </div>
          <h2 class="section-title-clamp font-bold font-display" style="color: var(--text-primary);">
            How Kivo Works
          </h2>
          <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
            From spoken natural voice to autonomous headless web execution and family verification.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div class="p-4 rounded-xl space-y-2.5" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-teal-600">01 SPEAK</span>
              <div class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0V12a3 3 0 01-3 3z"/></svg>
              </div>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Natural Voice Input</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">User speaks freely in English, Hindi, or regional dialects without learning complex apps.</p>
          </div>

          <div class="p-4 rounded-xl space-y-2.5" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-teal-600">02 UNDERSTAND</span>
              <div class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
              </div>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Nova Intent Parsing</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Amazon Nova AI extracts the exact task, pharmacy reorder prescription, or ride destination.</p>
          </div>

          <div class="p-4 rounded-xl space-y-2.5" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-teal-600">03 STAGE</span>
              <div class="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>
              </div>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Autonomous Staging</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Headless browser navigates the vendor website and adds exact items to cart.</p>
          </div>

          <div class="p-4 rounded-xl space-y-2.5" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-bold text-amber-600">04 APPROVE</span>
              <div class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
              </div>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Human Approval Gate</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Senior hears simple verbal confirmation and taps 1 button. No accidental charges.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 5. FOUR PILLARS OF TRUST                                                -->
    <!-- ======================================================================= -->
    <section id="pillars" class="py-14 md:py-20 border-b" style="background: var(--bg-section); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            <span>● CORE FOUNDATION</span>
          </div>
          <h2 class="section-title-clamp font-bold font-display" style="color: var(--text-primary);">
            Four Pillars of Trust
          </h2>
          <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
            Engineered specifically for non-technical seniors and their caring families.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div class="p-5 rounded-2xl space-y-3 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 01-3-3V4.5a3 3 0 116 0V12a3 3 0 01-3 3z"/></svg>
            </div>
            <h3 class="font-bold text-base" style="color: var(--text-primary);">Voice-First Autonomy</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">No app installation or typing needed. Just speak natural requests as you would to a family member.</p>
          </div>

          <div class="p-5 rounded-2xl space-y-3 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
            </div>
            <h3 class="font-bold text-base" style="color: var(--text-primary);">Human Approval Gate</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Strict safety policy: all orders and payments require explicit senior confirmation before dispatch.</p>
          </div>

          <div class="p-5 rounded-2xl space-y-3 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            </div>
            <h3 class="font-bold text-base" style="color: var(--text-primary);">Caregiver WhatsApp Loop</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Adult children receive real-time dispatch alerts and tracking links directly on WhatsApp.</p>
          </div>

          <div class="p-5 rounded-2xl space-y-3 shadow-sm" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"/></svg>
            </div>
            <h3 class="font-bold text-base" style="color: var(--text-primary);">Universal Web Execution</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Autonomous browser tools navigate real e-commerce and utility portals through secure MCP integrations.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 6. AMAZON NOVA AI ARCHITECTURE                                          -->
    <!-- ======================================================================= -->
    <section id="nova-architecture" class="py-14 md:py-20 border-b" style="background: var(--bg-page); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            <span>● MULTI-MODEL ORCHESTRATION</span>
          </div>
          <h2 class="section-title-clamp font-bold font-display" style="color: var(--text-primary);">
            Amazon Nova AI Architecture
          </h2>
          <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
            Specialized micro-agents handling speech, reasoning, vision OCR, and web interaction.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="p-5 rounded-2xl space-y-3" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-teal-600">NOVA SONIC</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/10 text-teal-600">Speech-to-Speech</span>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Conversational Voice Engine</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Sub-300ms ultra-low latency speech recognition that accommodates natural pauses and senior speech variations.</p>
          </div>

          <div class="p-5 rounded-2xl space-y-3" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-amber-600">NOVA LITE & 2.0</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-600">Fast Reasoning</span>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Intent & Entity Decomposition</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Extracts structured parameters, checks medication records, and stages vendor requests securely.</p>
          </div>

          <div class="p-5 rounded-2xl space-y-3" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold text-purple-600">NOVA VISION OCR</span>
              <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/10 text-purple-600">Multimodal</span>
            </div>
            <h3 class="font-bold text-sm" style="color: var(--text-primary);">Prescription & Bill Verification</h3>
            <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">Reads doctor handwriting, prescription slips, electricity consumer numbers, and order invoices automatically.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 7. IMPACT & ROI CALCULATOR                                              -->
    <!-- ======================================================================= -->
    <section id="calculator" class="py-14 md:py-20 border-b" style="background: var(--bg-section); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            <span>● FAMILY TIME RECLAIMED</span>
          </div>
          <h2 class="section-title-clamp font-bold font-display" style="color: var(--text-primary);">
            Caregiver Impact Calculator
          </h2>
          <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
            Estimate how much time and anxiety Kivo saves your family each month.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div class="lg:col-span-6 p-6 rounded-2xl space-y-6" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold font-mono">
                <label for="slider-seniors" style="color: var(--text-primary);">Elderly Parents / Relatives</label>
                <span id="label-val-seniors" class="text-teal-600">2 Seniors</span>
              </div>
              <input type="range" id="slider-seniors" min="1" max="5" value="2" oninput="updateRoiCalculation()" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600">
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold font-mono">
                <label for="slider-tasks" style="color: var(--text-primary);">Monthly Errands & Tasks</label>
                <span id="label-val-tasks" class="text-teal-600">12 Tasks</span>
              </div>
              <input type="range" id="slider-tasks" min="4" max="40" value="12" oninput="updateRoiCalculation()" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600">
            </div>

          </div>

          <div class="lg:col-span-6 grid grid-cols-3 gap-4">
            
            <div class="p-5 rounded-2xl space-y-1 text-center" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              <span class="text-[10px] font-mono font-bold uppercase block" style="color: var(--text-tech);">ANNUAL HOURS</span>
              <span id="roi-hours-saved" class="text-2xl sm:text-3xl font-bold font-mono text-teal-600">72 hrs</span>
              <span class="text-[11px] block" style="color: var(--text-muted);">Saved every year</span>
            </div>

            <div class="p-5 rounded-2xl space-y-1 text-center" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              <span class="text-[10px] font-mono font-bold uppercase block" style="color: var(--text-tech);">FULL DAYS</span>
              <span id="roi-days-saved" class="text-2xl sm:text-3xl font-bold font-mono text-amber-600">9 Days</span>
              <span class="text-[11px] block" style="color: var(--text-muted);">Reclaimed back</span>
            </div>

            <div class="p-5 rounded-2xl space-y-1 text-center" style="background: var(--bg-card); border: 1px solid var(--border-main);">
              <span class="text-[10px] font-mono font-bold uppercase block" style="color: var(--text-tech);">STRESS RELIEF</span>
              <span id="roi-stress-reduc" class="text-2xl sm:text-3xl font-bold font-mono text-emerald-600">82%</span>
              <span class="text-[11px] block" style="color: var(--text-muted);">Peace of mind</span>
            </div>

          </div>

        </div>

      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 8. PRICING & SUBSCRIPTION PLANS                                         -->
    <!-- ======================================================================= -->
    <section id="pricing" class="py-14 md:py-20 border-b" style="background: var(--bg-page); border-color: var(--border-main);">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-left">
        
        <div class="max-w-2xl space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            <span>● TRANSPARENT PRICING</span>
          </div>
          <h2 class="section-title-clamp font-bold font-display" style="color: var(--text-primary);">
            Choose Your Kivo Plan
          </h2>
          <p class="text-xs sm:text-sm" style="color: var(--text-secondary);">
            Every plan includes 24/7 autonomous support, human approval gates, and family alerts.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <!-- Free Trial -->
          <div class="p-6 rounded-2xl space-y-4" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="space-y-1">
              <h3 class="font-bold text-lg" style="color: var(--text-primary);">7-Day Trial</h3>
              <p class="text-xs" style="color: var(--text-secondary);">Experience full voice autonomy.</p>
            </div>
            <div class="text-2xl font-bold font-mono" style="color: var(--text-primary);">$0 <span class="text-xs font-normal" style="color: var(--text-muted);">/ 7 days</span></div>
            <ul class="space-y-2 text-xs" style="color: var(--text-secondary);">
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Up to 10 voice tasks</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> 1 Senior account</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> WhatsApp alerts to 1 caregiver</li>
            </ul>
            <button onclick="handleTryNowClick()" class="w-full py-2.5 rounded-xl font-bold text-xs transition-colors" style="background: var(--bg-inner); border: 1px solid var(--border-main); color: var(--text-primary);">
              Start Free Trial
            </button>
          </div>

          <!-- Kivo Pro -->
          <div class="p-6 rounded-2xl space-y-4 relative shadow-lg" style="background: var(--bg-card); border: 2px solid var(--kivo-cyan); box-shadow: var(--glow-cyan);">
            <div class="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white uppercase" style="background: var(--kivo-cyan);">
              MOST POPULAR
            </div>
            <div class="space-y-1">
              <h3 class="font-bold text-lg" style="color: var(--text-primary);">Kivo Pro</h3>
              <p class="text-xs" style="color: var(--text-secondary);">Complete peace of mind for families.</p>
            </div>
            <div class="text-2xl font-bold font-mono text-teal-600">$14.99 <span class="text-xs font-normal" style="color: var(--text-muted);">/ month</span></div>
            <ul class="space-y-2 text-xs" style="color: var(--text-secondary);">
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Unlimited voice tasks</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Priority prescription refill sync</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> WhatsApp loop for up to 3 family members</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Senior Mode with high contrast</li>
            </ul>
            <button onclick="handleTryNowClick()" class="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-opacity hover:opacity-95" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
              Get Kivo Pro
            </button>
          </div>

          <!-- Family Plan -->
          <div class="p-6 rounded-2xl space-y-4" style="background: var(--bg-card); border: 1px solid var(--border-main);">
            <div class="space-y-1">
              <h3 class="font-bold text-lg" style="color: var(--text-primary);">Family Caregiver</h3>
              <p class="text-xs" style="color: var(--text-secondary);">Multiple senior households.</p>
            </div>
            <div class="text-2xl font-bold font-mono" style="color: var(--text-primary);">$29.99 <span class="text-xs font-normal" style="color: var(--text-muted);">/ month</span></div>
            <ul class="space-y-2 text-xs" style="color: var(--text-secondary);">
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Up to 3 Senior homes managed</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Unlimited family notifications</li>
              <li class="flex items-center gap-2"><span class="text-teal-600 font-bold">✓</span> Dedicated Caregiver Coordinator</li>
            </ul>
            <button onclick="handleTryNowClick()" class="w-full py-2.5 rounded-xl font-bold text-xs transition-colors" style="background: var(--bg-inner); border: 1px solid var(--border-main); color: var(--text-primary);">
              Choose Family Plan
            </button>
          </div>

        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 9. ROADMAP & FINAL CTA                                                  -->
    <!-- ======================================================================= -->
    <section class="py-14 md:py-20 text-center" style="background: var(--bg-section);">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold" style="background: rgba(15, 167, 160, 0.12); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
          <span>READY FOR YOUR LOVED ONES</span>
        </div>
        
        <h2 class="text-3xl sm:text-4xl font-bold font-display" style="color: var(--text-primary);">
          Give your parents independence.<br />
          Give yourself complete peace of mind.
        </h2>

        <p class="text-sm sm:text-base font-normal max-w-xl mx-auto" style="color: var(--text-secondary);">
          Try the live demo right now or create your account to connect your parent's phone to Kivo.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button onclick="handleTryLiveDemoClick()" class="h-11 px-6 rounded-xl font-bold text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-2 cta-press text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
            <span>Try Live Kivo Demo →</span>
          </button>
          
          <button onclick="openSettingsModal('accessibility')" class="h-11 px-5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cta-press" style="background: var(--bg-card); border: 1px solid var(--border-main); color: var(--text-primary);">
            <span>Explore Senior Mode</span>
          </button>
        </div>
      </div>
    </section>

  </main>

  <!-- ========================================================================= -->
  <!-- 10. FOOTER                                                                -->
  <!-- ========================================================================= -->
  <footer class="py-10 border-t text-left" style="background: var(--bg-page); border-color: var(--border-main);">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6" style="border-color: var(--border-subtle);">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white" style="background: var(--kivo-cyan);">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
          </div>
          <span class="font-bold font-display" style="color: var(--text-primary);">Kivo.ai</span>
          <span class="text-xs" style="color: var(--text-muted);">— Autonomous Digital Caretaker</span>
        </div>

        <div class="flex items-center gap-3 text-xs font-mono">
          <span class="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ALL SYSTEMS OPERATIONAL
          </span>
          <span style="color: var(--text-tech);">• POSTGRESQL CONNECTED</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style="color: var(--text-muted);">
        <p>© 2026 Kivo Health Technologies Inc. Built with Amazon Nova AI & Web Agents.</p>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:underline">Privacy Policy</a>
          <a href="#" class="hover:underline">Security Terms</a>
          <a href="#" class="hover:underline">HIPAA / Data Protection</a>
        </div>
      </div>

    </div>
  </footer>

  <!-- ========================================================================= -->
  <!-- MODALS & DRAWERS CONTAINER                                                -->
  <!-- ========================================================================= -->

  <!-- 1. SETTINGS MODAL (With Voice Chime Toggle) -->
  <div id="modal-settings" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
    <div onclick="closeSettingsModal()" class="fixed inset-0 bg-[#03080E]/70 backdrop-blur-[10px] transition-opacity"></div>
    
    <div class="relative max-w-2xl w-full rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] z-10 space-y-4" style="background: var(--bg-card); border: 1px solid var(--border-main);">
      
      <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--border-subtle);">
        <div>
          <h3 id="settings-modal-title" class="text-base font-bold font-display" style="color: var(--text-primary);">Settings & Preferences</h3>
          <p class="text-[11px]" style="color: var(--text-secondary);">Manage appearance, voice sounds, accessibility, and notifications.</p>
        </div>
        <button onclick="closeSettingsModal()" class="p-1 rounded-lg text-sm font-bold" style="color: var(--text-secondary);" aria-label="Close settings">✕</button>
      </div>

      <!-- Settings Tabs -->
      <div class="flex items-center gap-2 border-b pb-2" style="border-color: var(--border-subtle);">
        <button onclick="switchSettingsPanel('appearance')" id="btn-tab-settings-appearance" class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all" style="background: rgba(15, 167, 160, 0.15); color: var(--kivo-cyan);">
          Appearance
        </button>
        <button onclick="switchSettingsPanel('accessibility')" id="btn-tab-settings-accessibility" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style="color: var(--text-secondary);">
          Senior Mode
        </button>
        <button onclick="switchSettingsPanel('voice')" id="btn-tab-settings-voice" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style="color: var(--text-secondary);">
          Voice & Audio
        </button>
        <button onclick="switchSettingsPanel('subscription')" id="btn-tab-settings-subscription" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style="color: var(--text-secondary);">
          Subscription
        </button>
      </div>

      <h4 id="settings-panel-title" class="text-xs font-mono font-bold uppercase" style="color: var(--text-tech);">Appearance & Theme Settings</h4>

      <!-- Panel: Appearance -->
      <div id="panel-settings-appearance" class="space-y-3">
        <div class="p-3.5 rounded-xl flex items-center justify-between" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
          <div>
            <span class="text-xs font-bold block" style="color: var(--text-primary);">Theme Preference</span>
            <span class="text-[11px]" style="color: var(--text-secondary);">Toggle between Light (clean calm), Dark, or System mode</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="setThemeMode('light')" class="px-2.5 py-1 rounded text-xs font-semibold" style="background: var(--bg-card); border: 1px solid var(--border-main);">Light</button>
            <button onclick="setThemeMode('dark')" class="px-2.5 py-1 rounded text-xs font-semibold" style="background: var(--bg-card); border: 1px solid var(--border-main);">Dark</button>
            <button onclick="setThemeMode('system')" class="px-2.5 py-1 rounded text-xs font-semibold" style="background: var(--bg-card); border: 1px solid var(--border-main);">System</button>
          </div>
        </div>
      </div>

      <!-- Panel: Accessibility -->
      <div id="panel-settings-accessibility" class="hidden space-y-3">
        <div class="p-3.5 rounded-xl flex items-center justify-between" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
          <div>
            <span class="text-xs font-bold block" style="color: var(--text-primary);">Senior Mode</span>
            <span class="text-[11px]" style="color: var(--text-secondary);">Enlarge touch targets (52px+), simplify layout, high contrast</span>
          </div>
          <button onclick="toggleSeniorMode()" class="px-3 py-1.5 rounded-lg text-xs font-bold" style="background: var(--kivo-cyan); color: #FFFFFF;">
            Toggle
          </button>
        </div>
      </div>

      <!-- Panel: Voice & Audio (With Mic Chime Toggle) -->
      <div id="panel-settings-voice" class="hidden space-y-3">
        <div class="p-3.5 rounded-xl flex items-center justify-between" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
          <div>
            <span class="text-xs font-bold block" style="color: var(--text-primary);">Mic Activation Chime</span>
            <span class="text-[11px]" style="color: var(--text-secondary);">Play subtle 2-tone audio chime when clicking "Speak With Mic"</span>
          </div>
          <button onclick="toggleVoiceChime()" id="settings-btn-voice-chime" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background: var(--kivo-cyan);">
            Enabled
          </button>
        </div>

        <div class="p-3.5 rounded-xl flex items-center justify-between" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
          <div>
            <span class="text-xs font-bold block" style="color: var(--text-primary);">Auto Read-Aloud</span>
            <span class="text-[11px]" style="color: var(--text-secondary);">Automatically speak confirmation when order is placed</span>
          </div>
          <button onclick="toggleAutoReadAloud()" id="settings-btn-readaloud" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background: var(--kivo-cyan);">
            Enabled
          </button>
        </div>
      </div>

      <!-- Panel: Subscription -->
      <div id="panel-settings-subscription" class="hidden space-y-3">
        <div class="p-4 rounded-xl space-y-2" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
          <span class="font-mono text-[10px] text-teal-600 font-bold block">CURRENT SUBSCRIPTION</span>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold font-display" style="color: var(--text-primary);">Kivo Pro Caregiver</span>
            <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600">ACTIVE</span>
          </div>
          <span class="text-[11px] block" style="color: var(--text-muted);">$14.99 / month • Renews monthly via PostgreSQL record</span>
        </div>
      </div>

    </div>
  </div>

  <!-- 2. USER PROFILE MODAL -->
  <div id="modal-profile" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
    <div onclick="closeProfileModal()" class="fixed inset-0 bg-[#03080E]/70 backdrop-blur-[10px] transition-opacity"></div>
    
    <div class="relative max-w-xl w-full rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] z-10 space-y-4" style="background: var(--bg-card); border: 1px solid var(--border-main);">
      
      <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--border-subtle);">
        <div>
          <h3 id="profile-modal-title" class="text-base font-bold font-display" style="color: var(--text-primary);">Your Kivo Profile</h3>
          <p class="text-[11px]" style="color: var(--text-secondary);">Personalize your digital caretaker identity & credentials.</p>
        </div>
        <button onclick="closeProfileModal()" class="p-1 rounded-lg text-sm font-bold" style="color: var(--text-secondary);" aria-label="Close profile">✕</button>
      </div>

      <!-- Identity Header Card -->
      <div class="p-4 rounded-xl flex items-center gap-3.5" style="background: var(--bg-inner); border: 1px solid var(--border-subtle);">
        <div id="profile-modal-avatar-circle" class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 text-white" style="background: linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent));">
          AD
        </div>
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span id="profile-modal-name" class="text-sm font-bold font-display" style="color: var(--text-primary);">Administrator</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Verified</span>
          </div>
          <span id="profile-modal-email" class="text-xs block" style="color: var(--text-secondary);">admin@kivo.ai</span>
          <span class="inline-block px-2 py-0.2 rounded text-[9px] font-mono font-bold" style="background: rgba(15, 167, 160, 0.1); color: var(--kivo-cyan); border: 1px solid rgba(15, 167, 160, 0.3);">
            ROLE: SYSTEM ADMINISTRATOR
          </span>
        </div>
      </div>

      <!-- Subscription Status Panel -->
      <div class="p-4 rounded-xl flex items-center justify-between" style="background: var(--bg-inner); border: 1px solid rgba(15, 167, 160, 0.3);">
        <div>
          <span class="text-[9px] font-mono font-bold uppercase text-teal-600 block tracking-wider">SUBSCRIPTION STATUS</span>
          <span id="profile-modal-plan-name" class="text-sm font-bold font-display" style="color: var(--text-primary);">Kivo Pro Caregiver</span>
          <span id="profile-modal-trial-status" class="text-[11px] block" style="color: var(--text-secondary);">Active Subscription • $14.99 / month</span>
        </div>
        <button onclick="closeProfileModal(); openSettingsModal('subscription');" class="px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm" style="background: var(--kivo-cyan);">
          Manage Plan
        </button>
      </div>

      <!-- Preferences Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-lg space-y-0.5" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
          <span class="font-mono text-[9px] font-bold block" style="color: var(--text-tech);">SAVED HOME ADDRESS</span>
          <span class="font-semibold block" style="color: var(--text-primary);">42 Palm Grove, Indiranagar, Bengaluru</span>
        </div>

        <div class="p-3 rounded-lg space-y-0.5" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
          <span class="font-mono text-[9px] font-bold block" style="color: var(--text-tech);">PRIMARY PHARMACY</span>
          <span class="font-semibold block text-teal-600">Apollo Pharmacy 24/7 (#928)</span>
        </div>

        <div class="p-3 rounded-lg space-y-0.5" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
          <span class="font-mono text-[9px] font-bold block" style="color: var(--text-tech);">FAMILY CAREGIVER WHATSAPP</span>
          <span class="font-semibold text-purple-600 block">Rohan Sharma (+91 98450 12345)</span>
        </div>

        <div class="p-3 rounded-lg space-y-0.5" style="background: var(--bg-page); border: 1px solid var(--border-subtle);">
          <span class="font-mono text-[9px] font-bold block" style="color: var(--text-tech);">PRIMARY CLINIC</span>
          <span class="font-semibold block" style="color: var(--text-primary);">Dr. Sharma Clinic (Ground Floor)</span>
        </div>
      </div>

      <!-- Recent Orders List -->
      <div class="space-y-2 pt-1">
        <span class="text-[10px] font-mono font-bold uppercase block" style="color: var(--text-tech);">Recent Order History</span>
        <div id="profile-orders-list" class="space-y-1.5">
          <!-- Injected via JS -->
        </div>
      </div>

      <div class="flex items-center justify-between border-t pt-3" style="border-color: var(--border-subtle);">
        <button onclick="toggleSeniorMode(); closeProfileModal();" class="px-3 py-1.5 rounded-lg font-bold text-xs" style="background: var(--bg-inner); border: 1px solid var(--border-main); color: var(--kivo-cyan);">
          Toggle Senior Mode
        </button>
        <button onclick="closeProfileModal()" class="px-4 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm" style="background: var(--kivo-cyan);">
          Done
        </button>
      </div>

    </div>
  </div>

  <!-- 3. CAREGIVER NOTIFICATIONS DRAWER -->
  <div id="drawer-notifications" class="fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-labelledby="notif-modal-title">
    <div onclick="closeNotificationsDrawer()" class="fixed inset-0 bg-[#03080E]/70 backdrop-blur-[10px] transition-opacity"></div>
    <div class="fixed inset-y-0 right-0 max-w-md w-full shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto z-10 border-l" style="background: var(--bg-card); border-color: var(--border-main);">
      
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b pb-3" style="border-color: var(--border-subtle);">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>
            <h3 id="notif-modal-title" class="text-base font-bold font-display" style="color: var(--text-primary);">Caregiver Alerts</h3>
          </div>
          <button onclick="closeNotificationsDrawer()" class="p-1 rounded-lg text-sm font-bold" style="color: var(--text-secondary);" aria-label="Close alerts">✕</button>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold uppercase" style="color: var(--text-tech);">Recent Updates</span>
          <button onclick="markAllNotificationsRead()" class="text-xs font-bold hover:underline" style="color: var(--kivo-cyan);">
            Mark all read
          </button>
        </div>

        <div id="notifications-list-container" class="space-y-2">
          <!-- Injected via JavaScript -->
        </div>
      </div>

      <button onclick="closeNotificationsDrawer()" class="w-full py-2.5 rounded-lg font-bold text-xs mt-4" style="background: var(--bg-inner); border: 1px solid var(--border-main); color: var(--text-primary);">
        Close Alerts
      </button>

    </div>
  </div>

  <!-- 4. DEVELOPER STATE INSPECTOR MODAL -->
  <div id="modal-dev-state" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="dev-state-title">
    <div onclick="closeDeveloperStateModal()" class="fixed inset-0 bg-[#03080E]/70 backdrop-blur-[10px] transition-opacity"></div>
    
    <div class="relative max-w-2xl w-full rounded-2xl shadow-2xl p-5 sm:p-6 overflow-y-auto max-h-[90vh] z-10 space-y-3" style="background: var(--bg-card); border: 1px solid var(--border-main);">
      
      <div class="flex items-center justify-between border-b pb-2.5" style="border-color: var(--border-subtle);">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          <h3 id="dev-state-title" class="text-sm font-bold font-mono text-teal-600">Kivo Central State Store (Observability)</h3>
        </div>
        <button onclick="closeDeveloperStateModal()" class="p-1 rounded-lg text-sm font-bold" style="color: var(--text-secondary);" aria-label="Close inspector">✕</button>
      </div>

      <div class="flex items-center justify-between text-[11px] font-mono">
        <span style="color: var(--text-tech);">Single Source of Truth (`KivoAgentStore.state`)</span>
        <button onclick="copyDeveloperStateJson()" id="btn-copy-dev-state" class="px-2.5 py-1 rounded font-bold border" style="background: var(--bg-inner); border-color: var(--border-main); color: var(--kivo-cyan);">
          📋 Copy State JSON
        </button>
      </div>

      <pre id="dev-state-json-viewer" class="p-3 rounded-lg font-mono text-[10px] text-teal-600 overflow-x-auto max-h-[50vh] leading-relaxed" style="background: var(--bg-page); border: 1px solid var(--border-main);"></pre>

      <div class="flex justify-between items-center pt-2 border-t" style="border-color: var(--border-subtle);">
        <span class="text-[10px] font-mono" style="color: var(--text-tech);">Connected to FastAPI + PostgreSQL on localhost:8000</span>
        <button onclick="closeDeveloperStateModal()" class="px-4 py-1.5 rounded-lg text-white font-bold text-xs" style="background: var(--kivo-cyan);">
          Close Inspector
        </button>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- JAVASCRIPT ARCHITECTURE ENGINE (Pass 12 Complete)                         -->
  <!-- ========================================================================= -->
  <script>
    // 1. CENTRAL AGENT STATE STORE
    const KivoAgentStore = {
      state: {
        sessionId: "sess_" + Math.random().toString(36).substring(2, 9),
        selectedScenario: "medicine-refill",
        pipelineStage: "WAITING_FOR_APPROVAL",
        spokenUtterance: '"Kivo, order my blood pressure medication from Apollo Pharmacy"',
        transcript: "Kivo, order my blood pressure medication from Apollo Pharmacy",
        confidence: 0.98,
        themeMode: "light",
        auth: {
          isAuthenticated: false,
          user: null
        },
        intent: {
          primaryTask: "Pharmacy Refill Order",
          targetProfile: "Dr. Sharma Rx (#A-928)",
          servicePlatform: "Apollo Pharmacy 24/7",
          familyAlert: "Rohan (Caregiver WhatsApp)",
          estimatedAmount: "₹380.00",
          scenarioKey: "medicine-refill"
        },
        entities: {
          medicine: "Amlodipine Besylate 5mg",
          quantity: "30 tablets",
          prescriptionId: "#AP-9921-BLR",
          address: "42 Palm Grove, Indiranagar, Bengaluru"
        },
        userProfile: {
          name: "Guest Explorer",
          email: "",
          seniorMode: false,
          highContrast: false,
          reducedMotion: false,
          autoReadAloud: true
        },
        browserState: {
          url: "https://apollo247.com/prescriptions/reorder",
          title: "Amlodipine Besylate 5mg (Strip of 30 Tablets)",
          desc: "Apollo Pharmacy Ltd. • Prescription on file (#AP-9921-BLR)",
          price: "₹380.00",
          badge: "PRESCRIPTION VERIFIED"
        },
        approval: {
          required: true,
          status: "PENDING",
          orderDispatched: false
        },
        orders: [
          { id: 101, title: "Pantocid 40mg Refill", service: "Apollo Pharmacy", amount: "₹142.50", date: "Today • 10:30 AM", status: "Delivered" },
          { id: 102, title: "Clinic Ride Dispatch", service: "Uber Health", amount: "₹320.00", date: "Yesterday • 4:15 PM", status: "Completed" }
        ],
        notifications: [
          { id: 1, title: "Pantocid 40mg Refill Placed", message: "Apollo Pharmacy has prepared your refill. Family WhatsApp alert dispatched.", time: "10:32 AM", is_read: false },
          { id: 2, title: "Caregiver Connected", message: "Rohan (+91 98450...) is linked to emergency dispatch notifications.", time: "Yesterday", is_read: false }
        ],
        activityEvents: []
      },
      
      subscribers: [],
      subscribe(fn) { this.subscribers.push(fn); },
      notify() { this.subscribers.forEach(fn => fn(this.state)); },
      
      setState(updater) {
        if (typeof updater === 'function') {
          this.state = updater(this.state);
        } else {
          this.state = { ...this.state, ...updater };
        }
        this.notify();
      }
    };

    // 2. SCENARIOS DATABASE
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
          estimatedAmount: '₹380.00',
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
          { source: 'Nova Sonic', time: '[0.10s]', text: 'Voice request captured: "order my blood pressure medication"', status: 'done' },
          { source: 'Nova Lite', time: '[0.28s]', text: 'Parsed intent: pharmacy_order(item="Amlodipine 5mg")', status: 'done' },
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
          estimatedAmount: '₹165.00',
          scenarioKey: 'grocery-restock'
        },
        browser: {
          url: 'https://bigbasket.com/cart/instant',
          title: 'Amul Taaza 2L Milk + Whole Wheat Bread',
          desc: 'BigBasket Express Delivery • Slot: Today 4:00 PM',
          price: '₹165.00',
          badge: 'PANTRY STAGED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.09s]', text: 'Voice utterance captured: "toned milk and whole wheat bread"', status: 'done' },
          { source: 'Nova Lite', time: '[0.22s]', text: 'Parsed intent: grocery_restock(items=["Milk 2L", "Bread"])', status: 'done' },
          { source: 'Nova Act', time: '[0.85s]', text: 'BigBasket MCP session initialized; 2 items added to cart', status: 'active' },
          { source: 'Family API', time: '[1.05s]', text: 'Pantry update notification prepared', status: 'pending' }
        ]
      },
      'ride-clinic': {
        name: 'Clinic Cab',
        utterance: '"Kivo, book an Uber cab for my 4 PM checkup at Dr. Sharma clinic"',
        voice: 'Booking accessible Premier cab to Dr. Sharma Clinic for 4 PM appointment.',
        intent: {
          primaryTask: 'Clinic Cab Booking',
          targetProfile: 'Wheelchair / Easy-Access Vehicle',
          servicePlatform: 'Uber Health API',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          estimatedAmount: '₹240.00',
          scenarioKey: 'ride-clinic'
        },
        browser: {
          url: 'https://m.uber.com/health/dispatch',
          title: 'Ride to Dr. Sharma Clinic (Ground Floor OPD)',
          desc: 'Pickup: 42 Palm Grove • Drop: Indiranagar Clinic (ETA: 8 mins)',
          price: '₹240.00',
          badge: 'DRIVER MATCHED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.11s]', text: 'Voice intent captured: "book an Uber cab for clinic"', status: 'done' },
          { source: 'Nova Lite', time: '[0.31s]', text: 'Destination mapped to Indiranagar Clinic OPD #3', status: 'done' },
          { source: 'Nova Act', time: '[0.92s]', text: 'Uber Health API staged ride: Driver Sunil (Toyota Etios)', status: 'active' },
          { source: 'Family API', time: '[1.15s]', text: 'Live GPS trip tracking link dispatched to Rohan', status: 'pending' }
        ]
      },
      'utility-bill': {
        name: 'Utility Bill',
        utterance: '"Kivo, pay my electricity bill before the due date tomorrow"',
        voice: 'Staging Bescom electricity bill payment of 820 rupees via BBPS portal.',
        intent: {
          primaryTask: 'Electricity Bill Payment',
          targetProfile: 'BESCOM Bangalore (#983421)',
          servicePlatform: 'Bharat BillPay (BBPS)',
          familyAlert: 'Rohan (Caregiver WhatsApp)',
          estimatedAmount: '₹820.00',
          scenarioKey: 'utility-bill'
        },
        browser: {
          url: 'https://bescom.karnataka.gov.in/quickpay',
          title: 'BESCOM Electricity Bill — CA #983421',
          desc: 'Bill Cycle: September 2026 • Due Date: 19-Sep-2026',
          price: '₹820.00',
          badge: 'BBPS VERIFIED'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.08s]', text: 'Voice request captured: "pay my electricity bill"', status: 'done' },
          { source: 'Nova Vision', time: '[0.45s]', text: 'Retrieved BESCOM CA #983421 from utility records', status: 'done' },
          { source: 'Nova Act', time: '[0.98s]', text: 'BBPS gateway connected, ₹820.00 staged for 1-tap confirmation', status: 'active' },
          { source: 'Family API', time: '[1.20s]', text: 'Payment receipt queued for family WhatsApp backup', status: 'pending' }
        ]
      },
      'flight-status': {
        name: 'Flight Status',
        utterance: '"Kivo, check if my daughter Priya\'s flight from Delhi is on time"',
        voice: 'Checking flight Indigo 6E-2134 from Delhi to Bengaluru. Status: On Time.',
        intent: {
          primaryTask: 'Flight Delay & Status Lookup',
          targetProfile: 'Priya Khadatare (Delhi → Bengaluru)',
          servicePlatform: 'IndiGo Flight Tracker',
          familyAlert: 'Priya (+91 99100...) & Vishal',
          estimatedAmount: '₹0.00',
          scenarioKey: 'flight-status'
        },
        browser: {
          url: 'https://goindigo.in/flight-status/6E2134',
          title: 'IndiGo 6E-2134 (DEL → BLR)',
          desc: 'Status: ON TIME • Expected Arrival: 06:45 PM • Terminal 2, Belt 4',
          price: '₹0.00',
          badge: 'LIVE RADAR TRACKING'
        },
        activity: [
          { source: 'Nova Sonic', time: '[0.10s]', text: 'Voice captured: "check Priya flight from Delhi"', status: 'done' },
          { source: 'Nova Lite', time: '[0.25s]', text: 'Resolved flight: IndiGo 6E-2134 (DEL to BLR)', status: 'done' },
          { source: 'Nova Act', time: '[0.75s]', text: 'Queried live radar: On schedule, landing 06:45 PM', status: 'active' },
          { source: 'Family API', time: '[0.95s]', text: 'Terminal 2 pickup reminder scheduled for 6:15 PM', status: 'pending' }
        ]
      }
    };

    // 3. TOAST NOTIFICATION ENGINE
    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'p-3.5 rounded-xl shadow-xl text-xs font-semibold flex items-center justify-between gap-3 border pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0';
      
      if (type === 'success') {
        toast.style.background = 'var(--bg-card)';
        toast.style.borderColor = 'var(--color-success)';
        toast.style.color = 'var(--text-primary)';
        toast.innerHTML = `<div class="flex items-center gap-2"><span class="text-emerald-500 font-bold text-sm">✓</span><span>${message}</span></div><button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">✕</button>`;
      } else if (type === 'error') {
        toast.style.background = 'var(--bg-card)';
        toast.style.borderColor = 'var(--color-danger)';
        toast.style.color = 'var(--text-primary)';
        toast.innerHTML = `<div class="flex items-center gap-2"><span class="text-rose-500 font-bold text-sm">✕</span><span>${message}</span></div><button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">✕</button>`;
      } else {
        toast.style.background = 'var(--bg-card)';
        toast.style.borderColor = 'var(--kivo-cyan)';
        toast.style.color = 'var(--text-primary)';
        toast.innerHTML = `<div class="flex items-center gap-2"><span class="text-teal-600 font-bold text-sm">ℹ</span><span>${message}</span></div><button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">✕</button>`;
      }

      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // 4. THEME CONTROLLER (Pass 12 Light-First)
    let currentThemeMode = 'light';

    function setThemeMode(mode) {
      currentThemeMode = mode;
      localStorage.setItem('kivo_theme_mode', mode);
      const html = document.documentElement;

      const iconLight = document.getElementById('theme-icon-light');
      const iconDark = document.getElementById('theme-icon-dark');

      if (mode === 'dark') {
        html.classList.remove('light-theme');
        html.classList.add('dark-theme');
        if (iconLight) iconLight.classList.add('hidden');
        if (iconDark) iconDark.classList.remove('hidden');
      } else if (mode === 'light') {
        html.classList.remove('dark-theme');
        html.classList.add('light-theme');
        if (iconLight) iconLight.classList.remove('hidden');
        if (iconDark) iconDark.classList.add('hidden');
      } else {
        const isDarkSys = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkSys) {
          html.classList.remove('light-theme');
          html.classList.add('dark-theme');
          if (iconLight) iconLight.classList.add('hidden');
          if (iconDark) iconDark.classList.remove('hidden');
        } else {
          html.classList.remove('dark-theme');
          html.classList.add('light-theme');
          if (iconLight) iconLight.classList.remove('hidden');
          if (iconDark) iconDark.classList.add('hidden');
        }
      }

      announceA11y(`Theme switched to ${mode} mode`);
    }

    function cycleThemeMode() {
      if (currentThemeMode === 'light') setThemeMode('dark');
      else if (currentThemeMode === 'dark') setThemeMode('system');
      else setThemeMode('light');
    }

    // 5. WEB AUDIO API CHIME (Pass 12 Voice Mic Activation Sound)
    function playKivoListeningChime() {
      const soundEnabled = localStorage.getItem('kivo_voice_chime') !== 'false';
      if (!soundEnabled) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        
        // Soft Dual-Tone Ascending Chime: Tone 1 (659.25Hz / E5) -> Tone 2 (880Hz / A5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(659.25, now);
        osc2.frequency.setValueAtTime(880.00, now + 0.08);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
        gainNode.gain.setValueAtTime(0.12, now + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.09);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.35);
      } catch (err) {
        console.warn('Web Audio chime warning:', err);
      }
    }

    function toggleVoiceChime() {
      const current = localStorage.getItem('kivo_voice_chime') !== 'false';
      const next = !current;
      localStorage.setItem('kivo_voice_chime', next ? 'true' : 'false');
      const btn = document.getElementById('settings-btn-voice-chime');
      if (btn) {
        btn.innerText = next ? 'Enabled' : 'Disabled';
        btn.style.background = next ? 'var(--kivo-cyan)' : 'var(--bg-inner)';
        btn.style.color = next ? '#FFFFFF' : 'var(--text-secondary)';
      }
      if (next) playKivoListeningChime();
      showToast(next ? 'Mic Activation Chime Enabled' : 'Mic Activation Chime Disabled', 'info');
    }

    // 6. LIVE DEMO SCENARIO RUNNER
    function selectDemoScenario(scenarioKey) {
      const s = demoScenarios[scenarioKey];
      if (!s) return;

      Object.keys(demoScenarios).forEach(k => {
        const pill = document.getElementById(`pill-scenario-${k}`);
        if (pill) {
          if (k === scenarioKey) {
            pill.style.background = 'var(--kivo-cyan)';
            pill.style.color = '#FFFFFF';
            pill.style.borderColor = 'transparent';
          } else {
            pill.style.background = 'var(--bg-card)';
            pill.style.color = 'var(--text-secondary)';
            pill.style.borderColor = 'var(--border-main)';
          }
        }
      });

      const elUtterance = document.getElementById('demo-spoken-utterance');
      const elTask = document.getElementById('demo-intent-task');
      const elProfile = document.getElementById('demo-intent-profile');
      const elPlatform = document.getElementById('demo-intent-platform');
      const elFamily = document.getElementById('demo-intent-family');
      const elUrl = document.getElementById('demo-browser-url');
      const elBadge = document.getElementById('demo-browser-badge');
      const elTitle = document.getElementById('demo-browser-title');
      const elDesc = document.getElementById('demo-browser-desc');
      const elPrice = document.getElementById('demo-browser-price');
      const jsonViewer = document.getElementById('demo-json-viewer');

      if (elUtterance) elUtterance.innerText = s.utterance;
      if (elTask) elTask.innerText = s.intent.primaryTask;
      if (elProfile) elProfile.innerText = s.intent.targetProfile;
      if (elPlatform) elPlatform.innerText = s.intent.servicePlatform;
      if (elFamily) elFamily.innerText = s.intent.familyAlert;

      if (elUrl) elUrl.innerText = s.browser.url;
      if (elBadge) elBadge.innerText = s.browser.badge;
      if (elTitle) elTitle.innerText = s.browser.title;
      if (elDesc) elDesc.innerText = s.browser.desc;
      if (elPrice) elPrice.innerText = s.browser.price;

      if (jsonViewer) jsonViewer.innerText = JSON.stringify(s.intent, null, 2);

      const btn = document.getElementById('btn-dispatch-order');
      if (btn) {
        btn.innerText = 'Confirm & Dispatch Order';
        btn.style.background = 'linear-gradient(135deg, var(--kivo-teal), var(--kivo-accent))';
        btn.style.color = '#FFFFFF';
        btn.disabled = false;
      }

      renderActivityEvents(s.activity);

      KivoAgentStore.setState(prev => ({
        selectedScenario: scenarioKey,
        spokenUtterance: s.utterance,
        intent: s.intent,
        browserState: s.browser,
        approval: { required: true, status: 'PENDING', orderDispatched: false }
      }));

      announceA11y(`Scenario changed to ${s.name}. Intent staged.`);
    }

    function renderActivityEvents(events) {
      const container = document.getElementById('demo-activity-stream');
      if (!container) return;
      container.innerHTML = '';

      events.forEach(ev => {
        const div = document.createElement('div');
        div.className = 'p-2 rounded-lg flex items-center justify-between text-[11px]';
        div.style.background = 'var(--bg-page)';
        div.style.border = '1px solid var(--border-subtle)';

        div.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-teal-500/10 text-teal-600">${ev.source}</span>
            <span style="color: var(--text-primary);">${ev.text}</span>
          </div>
          <span class="font-mono text-[9px]" style="color: var(--text-tech);">${ev.time}</span>
        `;
        container.appendChild(div);
      });
    }

    async function confirmAndDispatchOrder() {
      const btn = document.getElementById('btn-dispatch-order');
      const state = KivoAgentStore.state;
      if (btn) {
        btn.innerText = '✓ Order Confirmed & WhatsApp Dispatched';
        btn.style.background = 'var(--color-success)';
        btn.style.color = '#FFFFFF';
        btn.disabled = true;
      }

      const amountVal = parseFloat((state.intent.estimatedAmount || '380').replace(/[^0-9.]/g, '')) || 380;
      
      const newOrder = {
        id: Date.now(),
        title: state.intent.primaryTask,
        service: state.intent.servicePlatform,
        amount: state.intent.estimatedAmount,
        date: 'Just now',
        status: 'Dispatched'
      };

      const newNotif = {
        id: Date.now(),
        title: `${state.intent.primaryTask} Dispatched`,
        message: `Your ${state.intent.primaryTask} was executed. Family alert sent to ${state.intent.familyAlert}.`,
        time: 'Just now',
        is_read: false
      };

      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_email: state.userProfile.email || 'guest@kivo.ai',
            scenario_key: state.selectedScenario,
            service_name: state.intent.servicePlatform,
            title: state.intent.primaryTask,
            amount: amountVal,
            currency: 'INR',
            family_recipient: state.intent.familyAlert
          })
        });
      } catch (e) {}

      KivoAgentStore.setState(prev => ({
        pipelineStage: 'COMPLETED',
        approval: { required: true, status: 'APPROVED', orderDispatched: true },
        orders: [newOrder, ...prev.orders],
        notifications: [newNotif, ...prev.notifications]
      }));

      showToast(`Order confirmed: ${state.intent.primaryTask}`, 'success');
      announceA11y(`Order confirmed. ${state.intent.primaryTask} placed. Family notified.`);
      if (state.userProfile.autoReadAloud && 'speechSynthesis' in window) {
        speakText(`Your ${state.intent.primaryTask} has been placed. Your family was notified on WhatsApp.`);
      }
    }

    function cancelPendingOrder() {
      const btn = document.getElementById('btn-dispatch-order');
      if (btn) {
        btn.innerText = '✕ Order Dismissed';
        btn.style.background = 'rgba(239, 106, 106, 0.2)';
        btn.style.color = '#EF6A6A';
      }

      KivoAgentStore.setState(prev => ({
        pipelineStage: 'CANCELLED',
        approval: { required: true, status: 'REJECTED', orderDispatched: false }
      }));

      showToast("Order dismissed without execution", 'info');
      announceA11y("Order cancelled. No charges or actions taken.");
    }

    function rerunActiveSimulation() {
      selectDemoScenario(KivoAgentStore.state.selectedScenario);
    }

    // 7. VOICE PIPELINE (TTS & Speech Recognition + Web Audio Chime)
    let isListening = false;
    let isSpeaking = false;
    let speechRecognitionInstance = null;

    function toggleVoiceRecognition() {
      const label = document.getElementById('label-speak-mic');
      const heroLabel = document.getElementById('hero-mic-label');

      if (isListening) {
        if (speechRecognitionInstance) {
          try { speechRecognitionInstance.stop(); } catch(e) {}
        }
        isListening = false;
        if (label) label.innerText = 'Speak With Mic';
        if (heroLabel) heroLabel.innerText = 'Speak With Mic';
        return;
      }

      // Pass 12: Play soft synthesized Web Audio API Chime on activation
      playKivoListeningChime();

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        showToast("Web Speech recognition not available on this browser. Use the scenario tabs!", 'info');
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
          if (heroLabel) heroLabel.innerText = '● Listening...';
          announceA11y("Listening to your voice. Please speak your request.");
        };

        speechRecognitionInstance.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          const utteranceEl = document.getElementById('demo-spoken-utterance');
          if (utteranceEl) utteranceEl.innerText = `"${transcript}"`;

          const lower = transcript.toLowerCase();
          if (lower.includes('milk') || lower.includes('bread') || lower.includes('grocery')) {
            selectDemoScenario('grocery-restock');
          } else if (lower.includes('cab') || lower.includes('taxi') || lower.includes('clinic') || lower.includes('doctor')) {
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
          if (heroLabel) heroLabel.innerText = 'Speak With Mic';
        };

        speechRecognitionInstance.onerror = () => {
          isListening = false;
          if (label) label.innerText = 'Speak With Mic';
          if (heroLabel) heroLabel.innerText = 'Speak With Mic';
        };

        speechRecognitionInstance.start();
      } catch (err) {
        console.warn('Speech Recognition error:', err);
      }
    }

    function toggleDemoVoicePlayback() {
      const label = document.getElementById('label-listen-voice');
      if (isSpeaking) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        isSpeaking = false;
        if (label) label.innerText = 'Listen Voice';
        return;
      }

      const s = demoScenarios[KivoAgentStore.state.selectedScenario];
      const text = s ? s.voice : "Kivo is ready to assist you.";
      speakText(text, () => {
        isSpeaking = false;
        if (label) label.innerText = 'Listen Voice';
      });
      isSpeaking = true;
      if (label) label.innerText = 'Stop Voice';
    }

    function speakText(text, onEnd) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.94;
      u.pitch = 1.0;
      if (onEnd) u.onend = onEnd;
      window.speechSynthesis.speak(u);
    }

    // 8. ROI CALCULATOR
    function updateRoiCalculation() {
      const seniors = parseInt(document.getElementById('slider-seniors').value) || 2;
      const tasks = parseInt(document.getElementById('slider-tasks').value) || 12;

      const labelSeniors = document.getElementById('label-val-seniors');
      const labelTasks = document.getElementById('label-val-tasks');
      if (labelSeniors) labelSeniors.innerText = `${seniors} Senior${seniors > 1 ? 's' : ''}`;
      if (labelTasks) labelTasks.innerText = `${tasks} Tasks`;

      const annualHours = Math.round(seniors * tasks * 0.25 * 12);
      const daysSaved = Math.max(1, Math.round(annualHours / 8));
      const stressReduction = Math.min(95, 70 + Math.round(seniors * 3 + tasks * 0.5));

      const elHours = document.getElementById('roi-hours-saved');
      const elDays = document.getElementById('roi-days-saved');
      const elStress = document.getElementById('roi-stress-reduc');

      if (elHours) elHours.innerText = `${annualHours} hrs`;
      if (elDays) elDays.innerText = `${daysSaved} Days`;
      if (elStress) elStress.innerText = `${stressReduction}%`;
    }

    // 9. ACCESSIBILITY & SENIOR MODE
    function toggleSeniorMode() {
      const isSenior = document.documentElement.classList.toggle('senior-mode');
      localStorage.setItem('kivo_senior_mode', isSenior ? 'true' : 'false');

      const label = document.getElementById('label-senior-mode-text');
      const dot = document.getElementById('pill-senior-dot');

      if (isSenior) {
        if (label) label.innerText = 'Senior Mode: ON';
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-teal-600 animate-pulse';
        announceA11y("Senior Mode enabled. Touch targets enlarged and high contrast active.");
        showToast("Senior Mode Active", 'success');
      } else {
        if (label) label.innerText = 'Senior Mode: OFF';
        if (dot) dot.className = 'w-2 h-2 rounded-full bg-slate-400';
        announceA11y("Senior Mode disabled.");
        showToast("Senior Mode Disabled", 'info');
      }

      KivoAgentStore.setState(prev => ({
        userProfile: { ...prev.userProfile, seniorMode: isSenior }
      }));
    }

    function toggleAutoReadAloud() {
      const current = KivoAgentStore.state.userProfile.autoReadAloud;
      const next = !current;
      const btn = document.getElementById('settings-btn-readaloud');
      if (btn) {
        btn.innerText = next ? 'Enabled' : 'Disabled';
        btn.style.background = next ? 'var(--kivo-cyan)' : 'var(--bg-inner)';
        btn.style.color = next ? '#FFFFFF' : 'var(--text-secondary)';
      }
      KivoAgentStore.setState(prev => ({
        userProfile: { ...prev.userProfile, autoReadAloud: next }
      }));
      announceA11y(`Auto read-aloud ${next ? 'enabled' : 'disabled'}`);
    }

    function announceA11y(message) {
      const announcer = document.getElementById('a11y-status-announcer');
      if (announcer) announcer.innerText = message;
    }

    // 10. PASS 12: DEDICATED LOGIN NAVIGATION & AUTH FLOW
    function navigateToLogin(customTarget) {
      const currentPath = window.location.pathname || '';
      const currentHash = window.location.hash || '#live-demo';
      let returnTarget = customTarget;
      if (!returnTarget) {
        if (currentPath.endsWith('.html') && !currentPath.includes('login')) {
          returnTarget = currentPath.split('/').pop() + currentHash;
        } else {
          returnTarget = 'index.html' + currentHash;
        }
      }
      window.location.href = 'login.html?returnTo=' + encodeURIComponent(returnTarget);
    }

    function handleTryNowClick() {
      const auth = KivoAgentStore.state.auth;
      if (auth && auth.isAuthenticated) {
        scrollToLiveDemo();
      } else {
        navigateToLogin('index.html#live-demo');
      }
    }

    function handleTryLiveDemoClick() {
      const auth = KivoAgentStore.state.auth;
      if (auth && auth.isAuthenticated) {
        scrollToLiveDemo();
      } else {
        navigateToLogin('index.html#live-demo');
      }
    }

    let isLoggingOut = false;

    async function handleLogoutClick(e) {
      if (e) e.stopPropagation();
      if (isLoggingOut) return;
      isLoggingOut = true;

      const signoutText = document.getElementById('dropdown-signout-text');
      if (signoutText) signoutText.innerText = 'Signing out...';

      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Logout API error:', err);
      }

      // Clear authentication storage
      localStorage.removeItem('kivo_auth_user');

      // Reset central state
      KivoAgentStore.setState(prev => ({
        auth: { isAuthenticated: false, user: null },
        userProfile: {
          ...prev.userProfile,
          name: "Guest Explorer",
          email: ""
        }
      }));

      closeProfileDropdown();
      updateNavbarProfileUI(null);

      if (signoutText) signoutText.innerText = 'Sign Out';
      isLoggingOut = false;

      announceA11y("You have signed out of Kivo.");
      showToast("Signed out successfully.", 'info');
    }

    function scrollToLiveDemo() {
      const demo = document.getElementById('live-demo');
      if (demo) demo.scrollIntoView({ behavior: 'smooth' });
    }

    // 11. NAVBAR PROFILE CONTROL CENTER
    let isProfileDropdownOpen = false;

    function toggleProfileDropdown() {
      const dropdown = document.getElementById('nav-profile-dropdown');
      const btn = document.getElementById('btn-nav-profile');
      const chevron = document.getElementById('nav-profile-chevron');
      if (!dropdown) return;

      isProfileDropdownOpen = !isProfileDropdownOpen;
      if (isProfileDropdownOpen) {
        dropdown.classList.remove('hidden');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        syncDropdownUI();
      } else {
        closeProfileDropdown();
      }
    }

    function closeProfileDropdown() {
      const dropdown = document.getElementById('nav-profile-dropdown');
      const btn = document.getElementById('btn-nav-profile');
      const chevron = document.getElementById('nav-profile-chevron');
      if (dropdown) dropdown.classList.add('hidden');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.style.transform = 'rotate(0deg)';
      isProfileDropdownOpen = false;
    }

    function syncDropdownUI() {
      const state = KivoAgentStore.state;
      const user = state.auth && state.auth.user ? state.auth.user : null;
      const isSenior = document.documentElement.classList.contains('senior-mode');

      const elSeniorStatus = document.getElementById('dropdown-senior-status');
      if (elSeniorStatus) elSeniorStatus.innerText = isSenior ? 'ON' : 'OFF';

      const elNotifCount = document.getElementById('dropdown-notif-count');
      const unreadCount = (state.notifications || []).filter(n => !n.is_read).length;
      if (elNotifCount) elNotifCount.innerText = unreadCount;

      if (user) {
        const sub = user.subscription || { plan_name: 'Kivo Pro', badge_text: 'PRO', is_pro: true };
        const name = user.full_name || user.name || user.username || 'User';
        const initials = user.initials || name.substring(0, 2).toUpperCase();

        const dAvatar = document.getElementById('dropdown-user-avatar');
        const dName = document.getElementById('dropdown-user-name');
        const dEmail = document.getElementById('dropdown-user-email');
        const dBadge = document.getElementById('dropdown-user-badge');
        const dPlan = document.getElementById('dropdown-plan-text');
        const dDays = document.getElementById('dropdown-plan-days');

        if (dAvatar) dAvatar.innerText = initials;
        if (dName) dName.innerText = name;
        if (dEmail) dEmail.innerText = user.email || 'user@eldercare.ai';
        if (dBadge) dBadge.innerText = sub.badge_text || 'PRO';
        if (dPlan) dPlan.innerText = sub.plan_name || 'Kivo Pro';
        if (dDays) dDays.innerText = sub.is_pro ? 'Active' : `${sub.days_remaining || 7}d Left`;
      }
    }

    // 12. AUTHENTICATION & POSTGRESQL SESSION RESTORATION
    async function checkSessionOnLoad() {
      const cached = localStorage.getItem('kivo_auth_user');
      if (cached) {
        try {
          const user = JSON.parse(cached);
          if (user && user.email) {
            KivoAgentStore.setState(prev => ({
              auth: { isAuthenticated: true, user: user },
              userProfile: {
                ...prev.userProfile,
                name: user.full_name || user.name || user.username,
                email: user.email
              }
            }));
            updateNavbarProfileUI(user);

            // Authoritative PostgreSQL Session Verification
            try {
              const res = await fetch(`/api/auth/me?email=${encodeURIComponent(user.email)}`);
              if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                  localStorage.setItem('kivo_auth_user', JSON.stringify(data.user));
                  KivoAgentStore.setState(prev => ({
                    auth: { isAuthenticated: true, user: data.user }
                  }));
                  updateNavbarProfileUI(data.user);
                }
              } else if (res.status === 401) {
                // Session expired
                localStorage.removeItem('kivo_auth_user');
                KivoAgentStore.setState(prev => ({
                  auth: { isAuthenticated: false, user: null }
                }));
                updateNavbarProfileUI(null);
                showToast("Your session has expired. Please sign in again.", 'info');
              }
            } catch (err) {}
            return;
          }
        } catch (e) {
          localStorage.removeItem('kivo_auth_user');
        }
      }
      updateNavbarProfileUI(null);
    }

    function updateNavbarProfileUI(user) {
      const guestArea = document.getElementById('nav-guest-area');
      const authArea = document.getElementById('nav-auth-area');
      const avatarEl = document.getElementById('nav-user-avatar');
      const nameEl = document.getElementById('nav-user-name');
      const badgeEl = document.getElementById('nav-user-badge');
      const statusDot = document.getElementById('nav-user-status-dot');
      const notifBadge = document.getElementById('nav-notif-badge');

      if (user && user.email) {
        // Show Authenticated controls, hide Guest Sign In button
        if (guestArea) guestArea.classList.add('hidden');
        if (authArea) authArea.classList.remove('hidden');

        const name = user.full_name || user.name || user.username || 'User';
        const initials = user.initials || name.substring(0, 2).toUpperCase();
        const sub = user.subscription || { badge_text: 'PRO', is_pro: true, plan_name: 'Kivo Pro' };

        if (avatarEl) avatarEl.innerText = initials;
        if (nameEl) nameEl.innerText = name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : '');
        if (badgeEl) badgeEl.innerText = sub.badge_text || (sub.is_pro ? 'PRO' : 'TRIAL');
        if (statusDot) statusDot.className = 'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500';

        const pName = document.getElementById('profile-modal-name');
        const pEmail = document.getElementById('profile-modal-email');
        const pPlan = document.getElementById('profile-modal-plan-name');
        const pStatus = document.getElementById('profile-modal-trial-status');
        const pAvatar = document.getElementById('profile-modal-avatar-circle');

        if (pName) pName.innerText = name;
        if (pEmail) pEmail.innerText = user.email;
        if (pPlan) pPlan.innerText = sub.plan_name || 'Kivo Pro';
        if (pStatus) pStatus.innerText = sub.is_pro ? 'Active Subscription • $14.99 / month' : `Free Trial • ${sub.days_remaining || 7} days remaining`;
        if (pAvatar) pAvatar.innerText = initials;

      } else {
        // Show Guest Sign In button, hide Authenticated controls
        if (guestArea) guestArea.classList.remove('hidden');
        if (authArea) authArea.classList.add('hidden');

        if (avatarEl) avatarEl.innerText = '👤';
        if (nameEl) nameEl.innerText = 'Guest';
        if (badgeEl) badgeEl.innerText = 'GUEST';
        if (statusDot) statusDot.className = 'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-slate-400';
        if (notifBadge) notifBadge.style.display = 'none';
      }
    }

    // 13. MODALS & DRAWERS
    function openProfileModal() { document.getElementById('modal-profile')?.classList.remove('hidden'); }
    function closeProfileModal() { document.getElementById('modal-profile')?.classList.add('hidden'); }

    function openSettingsModal(tab = 'appearance') {
      document.getElementById('modal-settings')?.classList.remove('hidden');
      switchSettingsPanel(tab);
    }
    function closeSettingsModal() { document.getElementById('modal-settings')?.classList.add('hidden'); }

    function switchSettingsPanel(panelKey) {
      ['appearance', 'accessibility', 'voice', 'subscription'].forEach(k => {
        const panel = document.getElementById(`panel-settings-${k}`);
        const btn = document.getElementById(`btn-tab-settings-${k}`);
        if (panel) {
          if (k === panelKey) panel.classList.remove('hidden');
          else panel.classList.add('hidden');
        }
        if (btn) {
          if (k === panelKey) {
            btn.style.background = 'rgba(15, 167, 160, 0.15)';
            btn.style.color = 'var(--kivo-cyan)';
          } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-secondary)';
          }
        }
      });
      const title = document.getElementById('settings-panel-title');
      if (title) {
        if (panelKey === 'appearance') title.innerText = 'Appearance & Theme Settings';
        else if (panelKey === 'accessibility') title.innerText = 'Senior Mode & Accessibility';
        else if (panelKey === 'voice') title.innerText = 'Voice & Audio Settings';
        else if (panelKey === 'subscription') title.innerText = 'Plan & Billing';
      }
    }

    function openNotificationsDrawer() { document.getElementById('drawer-notifications')?.classList.remove('hidden'); }
    function closeNotificationsDrawer() { document.getElementById('drawer-notifications')?.classList.add('hidden'); }

    function openDeveloperStateModal() {
      const viewer = document.getElementById('dev-state-json-viewer');
      if (viewer) viewer.innerText = JSON.stringify(KivoAgentStore.state, null, 2);
      document.getElementById('modal-dev-state')?.classList.remove('hidden');
    }
    function closeDeveloperStateModal() { document.getElementById('modal-dev-state')?.classList.add('hidden'); }

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

    function copyDeveloperStateJson() {
      const viewer = document.getElementById('dev-state-json-viewer');
      const btn = document.getElementById('btn-copy-dev-state');
      if (!viewer || !navigator.clipboard) return;
      navigator.clipboard.writeText(viewer.innerText).then(() => {
        if (btn) {
          btn.innerText = '✓ State Copied!';
          setTimeout(() => { btn.innerText = '📋 Copy State JSON'; }, 2000);
        }
      });
    }

    function renderNotificationsList(notifs) {
      const container = document.getElementById('notifications-list-container');
      const badge = document.getElementById('nav-notif-badge');
      if (!container) return;

      container.innerHTML = '';
      const unreadCount = notifs.filter(n => !n.is_read).length;
      if (badge) {
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }

      notifs.forEach(item => {
        const row = document.createElement('div');
        row.className = 'p-3 rounded-xl border transition-all';
        row.style.background = item.is_read ? 'var(--bg-inner)' : 'rgba(15, 167, 160, 0.08)';
        row.style.borderColor = item.is_read ? 'var(--border-subtle)' : 'rgba(15, 167, 160, 0.3)';

        row.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-0.5">
              <span class="font-bold text-xs block" style="color: var(--text-primary);">${item.title}</span>
              <p class="text-[11px] leading-relaxed" style="color: var(--text-secondary);">${item.message}</p>
              <span class="text-[9px] font-mono block pt-0.5" style="color: var(--text-tech);">${item.time}</span>
            </div>
            <button onclick="speakText('${item.title}. ${item.message.replace(/'/g, "\\'")}')" class="p-1 rounded text-teal-600 hover:bg-teal-500/10 flex-shrink-0 text-xs" aria-label="Read alert aloud">
              🔊
            </button>
          </div>
        `;
        container.appendChild(row);
      });
    }

    function markAllNotificationsRead() {
      KivoAgentStore.setState(prev => ({
        notifications: prev.notifications.map(n => ({ ...n, is_read: true }))
      }));
      announceA11y("All notifications marked as read");
      showToast("All notifications marked as read", 'info');
    }

    function renderProfileOrders(orders) {
      const container = document.getElementById('profile-orders-list');
      if (!container) return;
      container.innerHTML = '';

      orders.forEach(order => {
        const row = document.createElement('div');
        row.className = 'p-2.5 rounded-lg flex items-center justify-between text-xs';
        row.style.background = 'var(--bg-page)';
        row.style.border = '1px solid var(--border-subtle)';

        row.innerHTML = `
          <div>
            <span class="font-bold block text-xs" style="color: var(--text-primary);">${order.title}</span>
            <span class="text-[9px] font-mono" style="color: var(--text-tech);">${order.service} • ${order.date}</span>
          </div>
          <div class="text-right">
            <span class="font-bold text-teal-600 block font-mono text-xs">${order.amount}</span>
            <span class="text-[9px] font-semibold text-emerald-600">✓ ${order.status}</span>
          </div>
        `;
        container.appendChild(row);
      });
    }

    // Escape Key & Global Outside Click Listeners
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSettingsModal();
        closeProfileModal();
        closeNotificationsDrawer();
        closeDeveloperStateModal();
        closeProfileDropdown();
      }
    });

    document.addEventListener('click', (e) => {
      const authWrapper = document.getElementById('nav-auth-area');
      if (authWrapper && !authWrapper.contains(e.target) && isProfileDropdownOpen) {
        closeProfileDropdown();
      }
    });

    // 14. INITIALIZATION
    document.addEventListener('DOMContentLoaded', () => {
      // Restore Theme (Pass 12: Light default)
      const savedTheme = localStorage.getItem('kivo_theme_mode') || 'light';
      setThemeMode(savedTheme);

      // Restore Senior Mode
      const savedSenior = localStorage.getItem('kivo_senior_mode') === 'true';
      if (savedSenior) toggleSeniorMode();

      // Check Real Authentication Session from PostgreSQL
      checkSessionOnLoad();

      // State Subscribers
      KivoAgentStore.subscribe(state => {
        renderNotificationsList(state.notifications);
        renderProfileOrders(state.orders);
        syncDropdownUI();
      });

      // Initial scenario & ROI setup
      selectDemoScenario('medicine-refill');
      updateRoiCalculation();
      renderNotificationsList(KivoAgentStore.state.notifications);
      renderProfileOrders(KivoAgentStore.state.orders);
    });
  </script>

</body>
</html>
'''

index_path = r"d:\ElderCare\index.html"
with open(index_path, "w", encoding="utf-8") as f:
    f.write(final_html)

print(f"[SUCCESS] Wrote {len(final_html)} bytes to {index_path}")
