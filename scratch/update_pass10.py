import os
import re

# Read existing build script
build_script_path = r"d:\ElderCare\scratch\build_kivo_production.py"
with open(build_script_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the Header / Navbar section
navbar_old = r'''  <!-- ========================================================================= -->
  <!-- TOP NAVIGATION BAR (Compact Technical Console Style)                      -->
  <!-- ========================================================================= -->
  <header class="sticky top-0 z-40 bg-[#070C13]/95 backdrop-blur-md border-b border-kivo-border shadow-kivo-sm transition-all h-16">
    <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
      
      <!-- Brand Logo & Status Tag -->
      <div class="flex items-center gap-3">
        <a href="#" class="flex items-center gap-2.5 group focus:outline-none" aria-label="Kivo Home">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-kivo-cyan to-kivo-teal flex items-center justify-center text-slate-950 shadow-kivo-glow-sm group-hover:scale-105 transition-transform">
            <span class="text-base font-black">🛡️</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-lg font-bold font-display tracking-tight text-white group-hover:text-kivo-cyan transition-colors">
              Kivo<span class="text-kivo-cyan">.</span>
            </span>
          </div>
        </a>
        <span class="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-kivo-surfaceInput border border-kivo-border text-[10px] font-mono text-kivo-textTech uppercase font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          v2.4 AGENT CONSOLE
        </span>
      </div>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center gap-5 font-medium text-xs text-kivo-textSecondary senior-hide" aria-label="Main Navigation">
        <a href="#live-demo" class="hover:text-kivo-cyan text-kivo-cyan font-semibold transition-colors flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-kivo-cyan animate-pulse"></span>
          Live Demo
        </a>
        <a href="#how-it-works" class="hover:text-white transition-colors">How It Works</a>
        <a href="#pillars" class="hover:text-white transition-colors">Pillars</a>
        <a href="#nova-architecture" class="hover:text-white transition-colors">Nova AI</a>
        <a href="#before-after" class="hover:text-white transition-colors">Comparison</a>
        <a href="#calculator" class="hover:text-white transition-colors">ROI Calculator</a>
        <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
      </nav>

      <!-- Right Action Controls -->
      <div class="flex items-center gap-2">
        
        <!-- Senior Mode Toggle Pill -->
        <button onclick="toggleSeniorMode()" id="btn-senior-mode-toggle" class="h-9 px-3 rounded-xl text-xs font-semibold border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center gap-2 transition-all cta-press" aria-pressed="false" aria-label="Toggle Senior Mode">
          <span class="text-sm">👓</span>
          <span id="label-senior-mode-text" class="hidden sm:inline text-kivo-textSecondary">Senior Mode: OFF</span>
          <span id="pill-senior-dot" class="w-2 h-2 rounded-full bg-slate-600"></span>
        </button>

        <!-- Accessibility Settings Button -->
        <button onclick="openAccessibilityDrawer()" class="h-9 w-9 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center justify-center transition-all cta-press" aria-label="Accessibility & Display Settings">
          <span class="text-sm">♿</span>
        </button>

        <!-- Notification Bell Icon -->
        <button onclick="openNotificationsDrawer()" class="relative h-9 w-9 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center justify-center transition-all cta-press" aria-label="Open Caretaker Notifications">
          <span class="text-sm">🔔</span>
          <span id="nav-notif-badge" class="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px] ring-1 ring-kivo-surface">
            2
          </span>
        </button>

        <!-- Profile / Auth Trigger Button -->
        <button onclick="openProfileModal()" id="btn-nav-profile" class="h-9 pl-1.5 pr-3 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center gap-2 transition-all cta-press shadow-kivo-sm" aria-label="User Account & Caregiver Settings">
          <div class="relative">
            <img id="nav-user-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" class="w-6 h-6 rounded-full object-cover ring-1 ring-kivo-cyan/60" />
            <span class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <span id="nav-user-name" class="font-bold text-xs max-w-[90px] sm:max-w-[120px] truncate">Vishal K.</span>
          <span id="nav-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-kivo-cyan/15 text-kivo-cyan border border-kivo-cyan/40">PRO</span>
        </button>

      </div>
    </div>
  </header>'''

navbar_new = r'''  <!-- ========================================================================= -->
  <!-- TOP NAVIGATION BAR (Pass 10 Technical Console & Profile Control Center)   -->
  <!-- ========================================================================= -->
  <header class="sticky top-0 z-40 bg-[#070C13]/95 backdrop-blur-md border-b border-kivo-border shadow-kivo-sm transition-all h-16">
    <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-3">
      
      <!-- Brand Logo & Status Tag -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <a href="#" class="flex items-center gap-2.5 group focus:outline-none" aria-label="Kivo Home">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-kivo-cyan to-kivo-teal flex items-center justify-center text-slate-950 shadow-kivo-glow-sm group-hover:scale-105 transition-transform">
            <span class="text-base font-black">🛡️</span>
          </div>
          <div class="flex items-baseline gap-1.5">
            <span class="text-lg font-bold font-display tracking-tight text-white group-hover:text-kivo-cyan transition-colors">
              Kivo<span class="text-kivo-cyan">.</span>
            </span>
          </div>
        </a>
        <span class="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-kivo-surfaceInput border border-kivo-border text-[10px] font-mono text-kivo-textTech uppercase font-semibold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          v2.4 AGENT CONSOLE
        </span>
      </div>

      <!-- Desktop Navigation Links -->
      <nav class="hidden lg:flex items-center gap-4 xl:gap-5 font-medium text-xs text-kivo-textSecondary senior-hide" aria-label="Main Navigation">
        <a href="#live-demo" class="hover:text-kivo-cyan text-kivo-cyan font-semibold transition-colors flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-kivo-cyan animate-pulse"></span>
          Live Demo
        </a>
        <a href="#how-it-works" class="hover:text-white transition-colors">How It Works</a>
        <a href="#pillars" class="hover:text-white transition-colors">Pillars</a>
        <a href="#nova-architecture" class="hover:text-white transition-colors">Nova AI</a>
        <a href="#before-after" class="hover:text-white transition-colors">Comparison</a>
        <a href="#calculator" class="hover:text-white transition-colors">ROI Calculator</a>
        <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
      </nav>

      <!-- Center-Right Action & Profile Controls -->
      <div class="flex items-center gap-2 sm:gap-2.5">
        
        <!-- Prominent TRY NOW Action Button -->
        <button onclick="handleTryNowClick()" id="btn-nav-try-now" class="h-9 px-3.5 rounded-xl bg-gradient-to-r from-kivo-cyan to-kivo-teal text-slate-950 font-bold text-xs shadow-kivo-glow-sm hover:opacity-95 transition-all flex items-center gap-1.5 cta-press whitespace-nowrap" aria-label="Try Kivo Autonomous Caretaker">
          <span>TRY NOW</span>
          <span class="text-sm font-black">&rarr;</span>
        </button>

        <!-- Senior Mode Toggle Pill -->
        <button onclick="toggleSeniorMode()" id="btn-senior-mode-toggle" class="h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center gap-1.5 sm:gap-2 transition-all cta-press" aria-pressed="false" aria-label="Toggle Senior Mode">
          <span class="text-sm">👓</span>
          <span id="label-senior-mode-text" class="hidden sm:inline text-kivo-textSecondary">Senior Mode: OFF</span>
          <span id="pill-senior-dot" class="w-2 h-2 rounded-full bg-slate-600"></span>
        </button>

        <!-- Accessibility Settings Button -->
        <button onclick="openAccessibilityDrawer()" class="h-9 w-9 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center justify-center transition-all cta-press flex-shrink-0" aria-label="Accessibility & Display Settings">
          <span class="text-sm">♿</span>
        </button>

        <!-- Notification Bell Icon -->
        <button onclick="openNotificationsDrawer()" class="relative h-9 w-9 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center justify-center transition-all cta-press flex-shrink-0" aria-label="Open Caretaker Notifications">
          <span class="text-sm">🔔</span>
          <span id="nav-notif-badge" class="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px] ring-1 ring-kivo-surface">
            2
          </span>
        </button>

        <!-- Profile Control Center Trigger & Dropdown Wrapper -->
        <div class="relative" id="profile-control-center-wrapper">
          
          <button onclick="toggleProfileDropdown()" id="btn-nav-profile" class="h-9 pl-1.5 pr-2.5 rounded-xl border border-kivo-border bg-kivo-surface hover:bg-kivo-surfaceElevated text-kivo-text flex items-center gap-2 transition-all cta-press shadow-kivo-sm focus:outline-none" aria-expanded="false" aria-haspopup="true" aria-label="User Account Menu">
            <div class="relative flex-shrink-0">
              <div id="nav-user-avatar" class="w-6 h-6 rounded-full bg-gradient-to-tr from-kivo-cyan to-kivo-teal text-slate-950 font-bold text-[10px] flex items-center justify-center ring-1 ring-kivo-cyan/60">
                VK
              </div>
              <span id="nav-user-status-dot" class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <span id="nav-user-name" class="font-bold text-xs max-w-[70px] sm:max-w-[100px] truncate">Vishal K.</span>
            <span id="nav-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-kivo-cyan/15 text-kivo-cyan border border-kivo-cyan/40">PRO</span>
            <svg id="nav-profile-chevron" class="w-3 h-3 text-kivo-textSecondary transition-transform duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <!-- Profile Dropdown Menu Panel -->
          <div id="nav-profile-dropdown" class="hidden absolute right-0 top-full mt-2 w-80 rounded-2xl bg-kivo-surface border border-kivo-border shadow-2xl z-50 overflow-hidden text-left p-1.5 transition-all">
            
            <!-- Dropdown User Header -->
            <div class="p-3 rounded-xl bg-kivo-surfaceInput border border-kivo-border/70 mb-1 space-y-2">
              <div class="flex items-center gap-3">
                <div id="dropdown-user-avatar" class="w-10 h-10 rounded-xl bg-gradient-to-tr from-kivo-cyan to-kivo-teal text-slate-950 font-bold text-sm flex items-center justify-center shadow-kivo-glow-sm flex-shrink-0">
                  VK
                </div>
                <div class="space-y-0.5 min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <span id="dropdown-user-name" class="font-bold text-white text-xs font-display truncate">Vishal Khadatare</span>
                    <span id="dropdown-user-badge" class="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-kivo-cyan/15 text-kivo-cyan border border-kivo-cyan/40 flex-shrink-0">PRO</span>
                  </div>
                  <span id="dropdown-user-email" class="text-[11px] text-kivo-textSecondary truncate block">vishal.k@gmail.com</span>
                </div>
              </div>
              
              <!-- Plan & Billing Summary Badge -->
              <div class="px-2.5 py-1.5 rounded-lg bg-kivo-page border border-kivo-border flex items-center justify-between text-[10px] font-mono">
                <span class="text-kivo-textTech uppercase font-semibold">PLAN: <span id="dropdown-plan-text" class="text-white font-bold">Kivo Pro</span></span>
                <span id="dropdown-plan-days" class="text-emerald-400 font-bold">Active</span>
              </div>
            </div>

            <!-- Dropdown Menu Links -->
            <div class="space-y-0.5 text-xs text-kivo-text font-medium">
              
              <button onclick="closeProfileDropdown(); openProfileModal();" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center gap-2.5 text-left">
                <span class="text-sm">👤</span>
                <span>My Profile & Account</span>
              </button>

              <button onclick="closeProfileDropdown(); openAccessibilityDrawer();" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center gap-2.5 text-left">
                <span class="text-sm">♿</span>
                <span>Accessibility & Display</span>
              </button>

              <button onclick="toggleSeniorMode();" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center justify-between text-left">
                <div class="flex items-center gap-2.5">
                  <span class="text-sm">👓</span>
                  <span>Senior Mode</span>
                </div>
                <span id="dropdown-senior-status" class="text-[10px] font-mono font-bold text-kivo-textTech">OFF</span>
              </button>

              <button onclick="closeProfileDropdown(); openNotificationsDrawer();" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center justify-between text-left">
                <div class="flex items-center gap-2.5">
                  <span class="text-sm">🔔</span>
                  <span>Caretaker Alerts</span>
                </div>
                <span id="dropdown-notif-count" class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px]">2</span>
              </button>

              <button onclick="closeProfileDropdown(); openDeveloperStateModal();" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center gap-2.5 text-left">
                <span class="text-sm">🔍</span>
                <span>Agent State Inspector</span>
              </button>

              <button onclick="closeProfileDropdown(); openProfileModal();" id="dropdown-btn-upgrade" class="w-full px-3 py-2 rounded-lg hover:bg-kivo-surfaceElevated hover:text-kivo-cyan transition-colors flex items-center gap-2.5 text-left text-kivo-cyan font-semibold">
                <span class="text-sm">⚡</span>
                <span id="dropdown-upgrade-label">Manage Subscription</span>
              </button>
            </div>

            <!-- Sign Out / Switch User Action -->
            <div class="mt-1 pt-1 border-t border-kivo-border">
              <button onclick="closeProfileDropdown(); handleLogout();" id="dropdown-btn-auth-action" class="w-full px-3 py-2 rounded-lg hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-2.5 text-xs font-semibold text-left">
                <span class="text-sm">🚪</span>
                <span id="dropdown-auth-action-label">Sign Out</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </header>'''

content = content.replace(navbar_old, navbar_new)

# 2. Add Authentication Modal (#modal-auth) before #modal-profile
auth_modal_html = r'''  <!-- ========================================================================= -->
  <!-- 0. REAL POSTGRESQL AUTHENTICATION MODAL (Pass 10 Centered Backdrop Blur) -->
  <!-- ========================================================================= -->
  <div id="modal-auth" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 transition-all" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
    <!-- Darkened, Blurred Backdrop Overlay -->
    <div onclick="closeAuthModal()" class="fixed inset-0 bg-[#03080E]/80 backdrop-blur-[12px] transition-opacity"></div>
    
    <!-- Centered Dark Modal Card -->
    <div class="relative max-w-md w-full bg-kivo-surface text-slate-100 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] p-6 sm:p-7 z-10 border border-kivo-border space-y-4">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-kivo-cyan to-kivo-teal flex items-center justify-center text-slate-950 shadow-kivo-glow-sm flex-shrink-0">
            <span class="text-base font-black">🛡️</span>
          </div>
          <div>
            <h3 id="auth-modal-title" class="text-base font-bold font-display text-white">Kivo Account Access</h3>
            <p class="text-[11px] text-kivo-textSecondary">Autonomous Digital Caretaker Console</p>
          </div>
        </div>
        <button onclick="closeAuthModal()" class="p-1 rounded-lg text-kivo-textSecondary hover:text-white hover:bg-slate-800 text-sm font-bold transition-colors" aria-label="Close authentication modal">✕</button>
      </div>

      <!-- Tab Switcher: Sign In vs Sign Up -->
      <div class="p-1 rounded-xl bg-kivo-surfaceInput border border-kivo-border grid grid-cols-2 gap-1 text-xs font-semibold">
        <button onclick="switchAuthTab('signin')" id="tab-btn-signin" class="py-1.5 rounded-lg bg-kivo-surface text-white shadow-kivo-sm transition-all text-center">
          Sign In
        </button>
        <button onclick="switchAuthTab('signup')" id="tab-btn-signup" class="py-1.5 rounded-lg text-kivo-textSecondary hover:text-white transition-all text-center">
          Create Account
        </button>
      </div>

      <!-- Error / Feedback Alert Banner -->
      <div id="auth-error-banner" class="hidden p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
        <span class="font-bold flex-shrink-0">⚠️</span>
        <span id="auth-error-text" class="leading-relaxed">Error message</span>
      </div>

      <!-- Success Alert Banner -->
      <div id="auth-success-banner" class="hidden p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
        <span class="font-bold flex-shrink-0">✓</span>
        <span id="auth-success-text" class="leading-relaxed">Success message</span>
      </div>

      <!-- 1. SIGN IN FORM -->
      <form id="form-auth-signin" onsubmit="handleSigninSubmit(event)" class="space-y-3.5">
        <div class="space-y-1">
          <label for="signin-email" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Email or Username</label>
          <input type="text" id="signin-email" required autocomplete="email" placeholder="e.g. admin@kivo.ai or vishal@email.com" class="w-full h-10 px-3 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs placeholder:text-slate-600 focus:border-kivo-cyan focus:ring-1 focus:ring-kivo-cyan outline-none transition-all" />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="signin-password" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Password</label>
            <button type="button" onclick="togglePasswordVisibility('signin-password', this)" class="text-[10px] text-kivo-cyan hover:underline font-mono">Show</button>
          </div>
          <div class="relative">
            <input type="password" id="signin-password" required autocomplete="current-password" placeholder="Enter your password" class="w-full h-10 px-3 pr-9 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs placeholder:text-slate-600 focus:border-kivo-cyan focus:ring-1 focus:ring-kivo-cyan outline-none transition-all" />
          </div>
        </div>

        <button type="submit" id="btn-submit-signin" class="w-full h-10 rounded-xl bg-gradient-to-r from-kivo-cyan to-kivo-teal text-slate-950 font-bold text-xs shadow-kivo-glow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cta-press">
          <span id="signin-spinner" class="hidden w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span id="signin-btn-text">Sign In to Kivo &rarr;</span>
        </button>

        <div class="pt-2 border-t border-kivo-border flex items-center justify-between text-[11px] text-kivo-textSecondary">
          <span>Need an account?</span>
          <button type="button" onclick="switchAuthTab('signup')" class="text-kivo-cyan hover:underline font-semibold">Start 7-Day Free Trial</button>
        </div>

        <!-- Demo Credentials Helper Box -->
        <div class="p-2.5 rounded-lg bg-kivo-page border border-kivo-border/60 text-[10px] font-mono space-y-1">
          <span class="text-kivo-textTech block font-semibold">⚡ Verified Database Accounts:</span>
          <div class="flex items-center justify-between text-slate-400">
            <span>Admin: <span class="text-kivo-cyan">admin@kivo.ai</span> (pw: admin123)</span>
            <button type="button" onclick="fillDemoCredentials('admin@kivo.ai', 'admin123')" class="text-[9px] text-kivo-cyan hover:underline">Autofill</button>
          </div>
          <div class="flex items-center justify-between text-slate-400">
            <span>User: <span class="text-kivo-cyan">abc@kivo.ai</span> (pw: Vishal123)</span>
            <button type="button" onclick="fillDemoCredentials('abc@kivo.ai', 'Vishal123')" class="text-[9px] text-kivo-cyan hover:underline">Autofill</button>
          </div>
        </div>
      </form>

      <!-- 2. SIGN UP FORM -->
      <form id="form-auth-signup" onsubmit="handleSignupSubmit(event)" class="hidden space-y-3.5">
        <div class="space-y-1">
          <label for="signup-name" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Full Name</label>
          <input type="text" id="signup-name" required autocomplete="name" placeholder="e.g. Vishal Khadatare" class="w-full h-10 px-3 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs placeholder:text-slate-600 focus:border-kivo-cyan focus:ring-1 focus:ring-kivo-cyan outline-none transition-all" />
        </div>

        <div class="space-y-1">
          <label for="signup-email" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Email Address</label>
          <input type="email" id="signup-email" required autocomplete="email" placeholder="e.g. vishal@email.com" class="w-full h-10 px-3 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs placeholder:text-slate-600 focus:border-kivo-cyan focus:ring-1 focus:ring-kivo-cyan outline-none transition-all" />
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="signup-password" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Create Password</label>
            <button type="button" onclick="togglePasswordVisibility('signup-password', this)" class="text-[10px] text-kivo-cyan hover:underline font-mono">Show</button>
          </div>
          <input type="password" id="signup-password" minlength="6" required autocomplete="new-password" placeholder="At least 6 characters" class="w-full h-10 px-3 pr-9 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs placeholder:text-slate-600 focus:border-kivo-cyan focus:ring-1 focus:ring-kivo-cyan outline-none transition-all" />
        </div>

        <div class="space-y-1">
          <label for="signup-role" class="text-[10px] font-mono uppercase font-bold text-kivo-textTech block">Primary Role</label>
          <select id="signup-role" class="w-full h-10 px-3 rounded-xl bg-kivo-surfaceInput border border-kivo-border text-white text-xs focus:border-kivo-cyan outline-none">
            <option value="user">Primary Caregiver (Managing elderly parent)</option>
            <option value="senior">Senior User (Large text & voice-first)</option>
            <option value="family">Family Member (Emergency observer)</option>
          </select>
        </div>

        <button type="submit" id="btn-submit-signup" class="w-full h-10 rounded-xl bg-gradient-to-r from-kivo-cyan to-kivo-teal text-slate-950 font-bold text-xs shadow-kivo-glow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 cta-press">
          <span id="signup-spinner" class="hidden w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span id="signup-btn-text">Create Account & Start 7-Day Trial &rarr;</span>
        </button>

        <div class="pt-2 border-t border-kivo-border flex items-center justify-between text-[11px] text-kivo-textSecondary">
          <span>Already have an account?</span>
          <button type="button" onclick="switchAuthTab('signin')" class="text-kivo-cyan hover:underline font-semibold">Sign In</button>
        </div>
      </form>

    </div>
  </div>
'''

target_profile_modal = r'  <!-- 3. USER PROFILE MODAL (Matching media_1789748625861.png style) -->'
if target_profile_modal in content:
    content = content.replace(target_profile_modal, auth_modal_html + "\n" + target_profile_modal)

# 3. Update the JavaScript Engine with Auth, Dropdown, and Profile handlers
# Let's inspect the KivoAgentStore and add auth state
store_old = r'''    const KivoAgentStore = {
      state: {
        sessionId: "sess_" + Math.random().toString(36).substring(2, 9),
        selectedScenario: "medicine-refill",
        pipelineStage: "WAITING_FOR_APPROVAL",
        spokenUtterance: '"Kivo, order my blood pressure medication from Apollo Pharmacy"',
        transcript: "Kivo, order my blood pressure medication from Apollo Pharmacy",
        confidence: 0.98,
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
          name: "Vishal Khadatare",
          email: "vishal@email.com",
          seniorMode: false,
          highContrast: false,
          reducedMotion: false,
          autoReadAloud: true,
          textSize: "normal"
        },'''

store_new = r'''    const KivoAgentStore = {
      state: {
        sessionId: "sess_" + Math.random().toString(36).substring(2, 9),
        selectedScenario: "medicine-refill",
        pipelineStage: "WAITING_FOR_APPROVAL",
        spokenUtterance: '"Kivo, order my blood pressure medication from Apollo Pharmacy"',
        transcript: "Kivo, order my blood pressure medication from Apollo Pharmacy",
        confidence: 0.98,
        auth: {
          isAuthenticated: true,
          user: {
            name: "Vishal Khadatare",
            email: "vishal@email.com",
            role: "user",
            initials: "VK",
            subscription: {
              status: "active_pro",
              plan_name: "Kivo Pro",
              badge_text: "PRO",
              is_pro: true,
              days_remaining: 30
            }
          }
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
          name: "Vishal Khadatare",
          email: "vishal@email.com",
          seniorMode: false,
          highContrast: false,
          reducedMotion: false,
          autoReadAloud: true,
          textSize: "normal"
        },'''

content = content.replace(store_old, store_new)

# 4. Add the Authentication & Profile Control Center JS Functions
js_functions_code = r'''
    // =========================================================================
    // PASS 10: AUTHENTICATION & NAVBAR PROFILE CONTROL CENTER
    // =========================================================================
    let isProfileDropdownOpen = false;

    function handleTryNowClick() {
      const auth = KivoAgentStore.state.auth;
      if (auth && auth.isAuthenticated) {
        scrollToLiveDemo();
      } else {
        openAuthModal('signin');
      }
    }

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
        const sub = user.subscription || { plan_name: 'Kivo Pro', badge_text: 'PRO', status: 'active_pro' };
        const name = user.full_name || user.name || user.username || 'User';
        const initials = user.initials || name.substring(0, 2).toUpperCase();

        const dAvatar = document.getElementById('dropdown-user-avatar');
        const dName = document.getElementById('dropdown-user-name');
        const dEmail = document.getElementById('dropdown-user-email');
        const dBadge = document.getElementById('dropdown-user-badge');
        const dPlan = document.getElementById('dropdown-plan-text');
        const dDays = document.getElementById('dropdown-plan-days');
        const dAuthAction = document.getElementById('dropdown-auth-action-label');

        if (dAvatar) dAvatar.innerText = initials;
        if (dName) dName.innerText = name;
        if (dEmail) dEmail.innerText = user.email || 'user@eldercare.ai';
        if (dBadge) dBadge.innerText = sub.badge_text || 'PRO';
        if (dPlan) dPlan.innerText = sub.plan_name || 'Kivo Pro';
        if (dDays) dDays.innerText = sub.is_pro ? 'Active' : (sub.days_remaining ? `${sub.days_remaining}d Left` : 'Free Trial');
        if (dAuthAction) dAuthAction.innerText = 'Sign Out';
      } else {
        const dName = document.getElementById('dropdown-user-name');
        const dEmail = document.getElementById('dropdown-user-email');
        const dBadge = document.getElementById('dropdown-user-badge');
        const dPlan = document.getElementById('dropdown-plan-text');
        const dDays = document.getElementById('dropdown-plan-days');
        const dAuthAction = document.getElementById('dropdown-auth-action-label');

        if (dName) dName.innerText = 'Guest Explorer';
        if (dEmail) dEmail.innerText = 'Not signed in';
        if (dBadge) dBadge.innerText = 'GUEST';
        if (dPlan) dPlan.innerText = 'Demo Access';
        if (dDays) dDays.innerText = 'Guest Mode';
        if (dAuthAction) dAuthAction.innerText = 'Sign In to Kivo';
      }
    }

    // =========================================================================
    // AUTHENTICATION MODAL LOGIC (Sign In, Sign Up, Switcher, Show/Hide Password)
    // =========================================================================
    let activeAuthTab = 'signin';

    function openAuthModal(tab = 'signin') {
      const modal = document.getElementById('modal-auth');
      if (modal) modal.classList.remove('hidden');
      switchAuthTab(tab);
      hideAuthAlerts();
    }

    function closeAuthModal() {
      const modal = document.getElementById('modal-auth');
      if (modal) modal.classList.add('hidden');
      hideAuthAlerts();
    }

    function switchAuthTab(tab) {
      activeAuthTab = tab;
      const btnSignin = document.getElementById('tab-btn-signin');
      const btnSignup = document.getElementById('tab-btn-signup');
      const formSignin = document.getElementById('form-auth-signin');
      const formSignup = document.getElementById('form-auth-signup');
      const title = document.getElementById('auth-modal-title');
      hideAuthAlerts();

      if (tab === 'signin') {
        if (btnSignin) {
          btnSignin.className = 'py-1.5 rounded-lg bg-kivo-surface text-white shadow-kivo-sm transition-all text-center font-bold text-kivo-cyan';
        }
        if (btnSignup) {
          btnSignup.className = 'py-1.5 rounded-lg text-kivo-textSecondary hover:text-white transition-all text-center';
        }
        if (formSignin) formSignin.classList.remove('hidden');
        if (formSignup) formSignup.classList.add('hidden');
        if (title) title.innerText = 'Sign In to Kivo';
        setTimeout(() => document.getElementById('signin-email')?.focus(), 100);
      } else {
        if (btnSignup) {
          btnSignup.className = 'py-1.5 rounded-lg bg-kivo-surface text-white shadow-kivo-sm transition-all text-center font-bold text-kivo-cyan';
        }
        if (btnSignin) {
          btnSignin.className = 'py-1.5 rounded-lg text-kivo-textSecondary hover:text-white transition-all text-center';
        }
        if (formSignup) formSignup.classList.remove('hidden');
        if (formSignin) formSignin.classList.add('hidden');
        if (title) title.innerText = 'Create Account (7-Day Trial)';
        setTimeout(() => document.getElementById('signup-name')?.focus(), 100);
      }
    }

    function togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerText = 'Hide';
      } else {
        input.type = 'password';
        btn.innerText = 'Show';
      }
    }

    function fillDemoCredentials(email, password) {
      const emailInput = document.getElementById('signin-email');
      const pwInput = document.getElementById('signin-password');
      if (emailInput) emailInput.value = email;
      if (pwInput) pwInput.value = password;
      hideAuthAlerts();
    }

    function showAuthError(message) {
      const banner = document.getElementById('auth-error-banner');
      const text = document.getElementById('auth-error-text');
      if (banner && text) {
        text.innerText = message;
        banner.classList.remove('hidden');
      }
      const sBanner = document.getElementById('auth-success-banner');
      if (sBanner) sBanner.classList.add('hidden');
    }

    function showAuthSuccess(message) {
      const banner = document.getElementById('auth-success-banner');
      const text = document.getElementById('auth-success-text');
      if (banner && text) {
        text.innerText = message;
        banner.classList.remove('hidden');
      }
      const eBanner = document.getElementById('auth-error-banner');
      if (eBanner) eBanner.classList.add('hidden');
    }

    function hideAuthAlerts() {
      const eBanner = document.getElementById('auth-error-banner');
      const sBanner = document.getElementById('auth-success-banner');
      if (eBanner) eBanner.classList.add('hidden');
      if (sBanner) sBanner.classList.add('hidden');
    }

    // =========================================================================
    // POSTGRESQL AUTH HANDLERS (Real backend call with password hash check)
    // =========================================================================
    async function handleSigninSubmit(e) {
      e.preventDefault();
      const email = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value;
      const btnText = document.getElementById('signin-btn-text');
      const spinner = document.getElementById('signin-spinner');

      if (!email || !password) {
        showAuthError("Please enter both email and password.");
        return;
      }

      if (btnText) btnText.innerText = 'Verifying Credentials...';
      if (spinner) spinner.classList.remove('hidden');
      hideAuthAlerts();

      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          showAuthError(data.detail || "Authentication failed. Please verify your credentials.");
          if (btnText) btnText.innerText = 'Sign In to Kivo →';
          if (spinner) spinner.classList.add('hidden');
          return;
        }

        // Successfully Authenticated with PostgreSQL
        const user = data.user;
        localStorage.setItem('kivo_auth_user', JSON.stringify(user));
        
        KivoAgentStore.setState(prev => ({
          auth: { isAuthenticated: true, user: user },
          userProfile: {
            ...prev.userProfile,
            name: user.full_name || user.name || user.username,
            email: user.email
          }
        }));

        updateNavbarProfileUI(user);
        showAuthSuccess(`Welcome back, ${user.full_name || user.username}!`);
        announceA11y(`Signed in successfully as ${user.full_name || user.username}`);

        setTimeout(() => {
          closeAuthModal();
          if (btnText) btnText.innerText = 'Sign In to Kivo →';
          if (spinner) spinner.classList.add('hidden');
        }, 800);

      } catch (err) {
        console.warn("Backend signin network error:", err);
        showAuthError("Unable to connect to backend server. Please ensure FastAPI is running on port 8000.");
        if (btnText) btnText.innerText = 'Sign In to Kivo →';
        if (spinner) spinner.classList.add('hidden');
      }
    }

    async function handleSignupSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const role = document.getElementById('signup-role').value;
      const btnText = document.getElementById('signup-btn-text');
      const spinner = document.getElementById('signup-spinner');

      if (!name || !email || !password) {
        showAuthError("Please fill out all required fields.");
        return;
      }
      if (password.length < 6) {
        showAuthError("Password must be at least 6 characters long.");
        return;
      }

      if (btnText) btnText.innerText = 'Creating Account...';
      if (spinner) spinner.classList.remove('hidden');
      hideAuthAlerts();

      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        if (!response.ok) {
          showAuthError(data.detail || "Account creation failed. Please check your email.");
          if (btnText) btnText.innerText = 'Create Account & Start 7-Day Trial →';
          if (spinner) spinner.classList.add('hidden');
          return;
        }

        // Successfully Created in PostgreSQL
        const user = data.user;
        localStorage.setItem('kivo_auth_user', JSON.stringify(user));

        KivoAgentStore.setState(prev => ({
          auth: { isAuthenticated: true, user: user },
          userProfile: {
            ...prev.userProfile,
            name: user.full_name || user.name || user.username,
            email: user.email
          }
        }));

        updateNavbarProfileUI(user);
        showAuthSuccess("Account created successfully! 7-Day Free Trial activated.");
        announceA11y(`Account created for ${user.full_name || user.email}`);

        setTimeout(() => {
          closeAuthModal();
          if (btnText) btnText.innerText = 'Create Account & Start 7-Day Trial →';
          if (spinner) spinner.classList.add('hidden');
        }, 1000);

      } catch (err) {
        console.warn("Backend signup network error:", err);
        showAuthError("Unable to connect to database server. Please ensure FastAPI is running on port 8000.");
        if (btnText) btnText.innerText = 'Create Account & Start 7-Day Trial →';
        if (spinner) spinner.classList.add('hidden');
      }
    }

    async function handleLogout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // Continue local logout
      }

      localStorage.removeItem('kivo_auth_user');
      KivoAgentStore.setState(prev => ({
        auth: { isAuthenticated: false, user: null }
      }));

      updateNavbarProfileUI(null);
      announceA11y("You have signed out of Kivo.");
    }

    function updateNavbarProfileUI(user) {
      const avatarEl = document.getElementById('nav-user-avatar');
      const nameEl = document.getElementById('nav-user-name');
      const badgeEl = document.getElementById('nav-user-badge');
      const statusDot = document.getElementById('nav-user-status-dot');

      if (user) {
        const name = user.full_name || user.name || user.username || 'User';
        const initials = user.initials || name.substring(0, 2).toUpperCase();
        const sub = user.subscription || { badge_text: 'PRO', is_pro: true };

        if (avatarEl) avatarEl.innerText = initials;
        if (nameEl) nameEl.innerText = name.split(' ')[0] + (name.split(' ')[1] ? ` ${name.split(' ')[1][0]}.` : '');
        if (badgeEl) {
          badgeEl.innerText = sub.badge_text || (sub.is_pro ? 'PRO' : 'TRIAL');
          badgeEl.className = 'px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-kivo-cyan/15 text-kivo-cyan border border-kivo-cyan/40';
        }
        if (statusDot) statusDot.className = 'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400';

        // Update modal profile labels
        const pName = document.getElementById('profile-modal-name');
        const pEmail = document.getElementById('profile-modal-email');
        const pPlan = document.getElementById('profile-modal-plan-name');
        const pStatus = document.getElementById('profile-modal-trial-status');

        if (pName) pName.innerText = name;
        if (pEmail) pEmail.innerText = user.email || 'user@eldercare.ai';
        if (pPlan) pPlan.innerText = sub.plan_name || 'Kivo Pro';
        if (pStatus) pStatus.innerText = sub.is_pro ? 'Active Subscription • $14.99 / month' : `Free Trial • ${sub.days_remaining || 7} days remaining`;

      } else {
        if (avatarEl) avatarEl.innerText = '👤';
        if (nameEl) nameEl.innerText = 'Guest';
        if (badgeEl) {
          badgeEl.innerText = 'GUEST';
          badgeEl.className = 'px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700';
        }
        if (statusDot) statusDot.className = 'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-slate-500';
      }
    }

    async function checkSessionOnLoad() {
      const cached = localStorage.getItem('kivo_auth_user');
      if (cached) {
        try {
          const user = JSON.parse(cached);
          KivoAgentStore.setState(prev => ({
            auth: { isAuthenticated: true, user: user },
            userProfile: {
              ...prev.userProfile,
              name: user.full_name || user.name || user.username,
              email: user.email
            }
          }));
          updateNavbarProfileUI(user);

          // Verify with backend
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
          }
        } catch (e) {
          console.warn("Session check error:", e);
        }
      } else {
        // Default seed demo user
        const defaultUser = {
          name: "Vishal Khadatare",
          full_name: "Vishal Khadatare",
          email: "vishal@email.com",
          role: "user",
          initials: "VK",
          subscription: {
            status: "active_pro",
            plan_name: "Kivo Pro",
            badge_text: "PRO",
            is_pro: true,
            days_remaining: 30
          }
        };
        updateNavbarProfileUI(defaultUser);
      }
    }

    // Global click listener for dropdown dismiss
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('profile-control-center-wrapper');
      if (wrapper && !wrapper.contains(e.target) && isProfileDropdownOpen) {
        closeProfileDropdown();
      }
    });
'''

# Find insertion point before DOMContentLoaded
target_init = r"    document.addEventListener('DOMContentLoaded', () => {"
if target_init in content:
    content = content.replace(target_init, js_functions_code + "\n" + target_init)

# Add checkSessionOnLoad to DOMContentLoaded
content = content.replace(
    r"      selectDemoScenario('medicine-refill');",
    r"      checkSessionOnLoad();" + "\n" + r"      selectDemoScenario('medicine-refill');"
)

# Also add modal-auth to Escape listener
content = content.replace(
    r"        closeProfileModal();",
    r"        closeProfileModal();" + "\n" + r"        closeAuthModal();" + "\n" + r"        closeProfileDropdown();"
)

# Write updated build script
with open(build_script_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"[PASS 10 SCRIPT UPDATE] Updated {build_script_path} successfully.")

