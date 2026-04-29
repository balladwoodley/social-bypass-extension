// Social Wall Bypass v1.3 - Content Script
// Instagram, Twitter/X, Facebook, TikTok, Reddit, LinkedIn, Pinterest, Snapchat, YouTube

(function () {
  'use strict';

  const host = location.hostname;

  // ─── Login Detection ─────────────────────────────────────────────────────────
  // If already logged in, bail out entirely — don't mess with the page.

  function isLoggedIn() {
    // Generic DOM signal: logout link anywhere
    if (document.querySelector('[href*="logout"], [href*="signout"]')) return true;

    if (host.includes('instagram.com')) {
      return document.cookie.includes('ds_user_id') || document.cookie.includes('sessionid')
          || !!document.querySelector('a[href*="/direct/inbox/"]');
    }
    if (host.includes('twitter.com') || host.includes('x.com')) {
      return document.cookie.includes('auth_token')
          || !!document.querySelector('[data-testid="AppTabBar_Home_Link"]');
    }
    if (host.includes('facebook.com')) {
      return document.cookie.includes('c_user');
    }
    if (host.includes('tiktok.com')) {
      return document.cookie.includes('sessionid')
          || !!document.querySelector('[data-e2e="profile-icon"]');
    }
    if (host.includes('reddit.com')) {
      return document.cookie.includes('reddit_session') || document.cookie.includes('token_v2')
          || !!document.querySelector('[data-testid="user-drawer-button"]');
    }
    if (host.includes('linkedin.com')) {
      return document.cookie.includes('li_at');
    }
    if (host.includes('pinterest.com')) {
      return document.cookie.includes('_auth');
    }
    if (host.includes('youtube.com')) {
      return document.cookie.includes('SID') || document.cookie.includes('SAPISID');
    }
    return false;
  }

  // ─── Utility ─────────────────────────────────────────────────────────────────

  function removeElements(selectors) {
    selectors.forEach(sel => {
      try { document.querySelectorAll(sel).forEach(el => el.remove()); } catch(e) {}
    });
  }

  function unlockScroll() {
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.height = 'auto';
  }

  // Removes fixed/absolute/sticky elements matching loginPattern,
  // unless they also match safePattern (e.g. like/comment prompts — expected behaviour)
  function nukeByText(loginPattern, safePattern) {
    document.querySelectorAll('div, section, aside, dialog').forEach(el => {
      const style = getComputedStyle(el);
      const pos = style.position;
      if (pos !== 'fixed' && pos !== 'absolute' && pos !== 'sticky') return;
      const z = parseInt(style.zIndex, 10);
      if (isNaN(z) || z < 5) return;
      const text = el.innerText || '';
      if (!loginPattern.test(text)) return;
      if (safePattern && safePattern.test(text)) return;
      el.remove();
    });
  }

  // MutationObserver helper — calls fn whenever nodes are added to DOM
  function watchAndRun(fn) {
    const obs = new MutationObserver(mutations => {
      if (mutations.some(m => m.addedNodes.length)) fn();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
    return obs;
  }

  // ─── Instagram ───────────────────────────────────────────────────────────────

  function bypassInstagram() {
    const SELECTORS = [
      '[data-testid="login-explore-tooltip"]',
      '#loginForm',
    ];

    const clean = () => {
      // Hard wall: contains password input — remove outermost overlay ancestor
      document.querySelectorAll('input[name="password"], input[type="password"]').forEach(input => {
        let el = input;
        while (el && el !== document.body) {
          const pos = getComputedStyle(el).position;
          const rect = el.getBoundingClientRect();
          if (pos === 'fixed' || pos === 'absolute' || pos === 'sticky') { el.remove(); return; }
          if (rect.width > window.innerWidth * 0.35 && rect.height > window.innerHeight * 0.25) { el.remove(); return; }
          el = el.parentElement;
        }
      });

      // Soft/dismissable prompt: fixed/sticky banner with login text but NO password field
      document.querySelectorAll('div, section').forEach(el => {
        const style = getComputedStyle(el);
        const pos = style.position;
        if (pos !== 'fixed' && pos !== 'sticky' && pos !== 'absolute') return;
        const z = parseInt(style.zIndex, 10);
        if (isNaN(z) || z < 5) return;
        const text = el.innerText || '';
        if (!/log.?in|sign.?up|join instagram|create.*account|see.*more|you.ll need/i.test(text)) return;
        if (el.querySelectorAll('input[type="password"]').length > 0) return; // handled above
        el.remove();
      });

      // Backdrop dimmer overlay
      document.querySelectorAll('div').forEach(el => {
        const style = getComputedStyle(el);
        if (style.position !== 'fixed') return;
        const z = parseInt(style.zIndex, 10);
        const bg = style.backgroundColor;
        const isTranslucentDark = bg.includes('rgba') && parseFloat(bg.split(',')[3]) > 0.3;
        if (z >= 5 && isTranslucentDark && !(el.innerText || '').trim()) el.remove();
      });

      removeElements(SELECTORS);
      unlockScroll();
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 800);
  }

  // ─── Twitter / X ─────────────────────────────────────────────────────────────

  function bypassTwitter() {
    const SELECTORS = [
      '[data-testid="BottomBar"]',
      '[data-testid="LoginForm"]',
      '[data-testid="SignupForm"]',
      '[data-testid="mask"]',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();

      const layers = document.getElementById('layers');
      if (layers) {
        Array.from(layers.children).forEach(child => {
          const text = child.innerText || '';
          if (/log.?in|sign.?up|see what everyone|join x now|create account/i.test(text)) child.remove();
        });
        layers.querySelectorAll('[data-testid="mask"]').forEach(el => el.remove());
        if (/log.?in|sign.?up|see what everyone/i.test(layers.innerText || '')) layers.innerHTML = '';
      }

      // Click-triggered "See what everyone is saying" modal
      document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        const text = dialog.innerText || '';
        if (/log.?in|sign.?up|see what everyone|join x now/i.test(text)) {
          const closeBtn = dialog.querySelector('[aria-label="Close"], [data-testid="app-bar-close"]');
          if (closeBtn) closeBtn.click(); else dialog.remove();
        }
      });
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 600);
  }

  // ─── Facebook ────────────────────────────────────────────────────────────────

  function bypassFacebook() {
    const SELECTORS = [
      '[data-pagelet="GrowthEduInterstitial"]',
      '[data-testid="royal_registration_dialog"]',
      '[data-testid="login-signup-form"]',
      '[data-cookiebanner]',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
      document.body.classList.remove('_2iem', '_53j6', 'async_saving');
      nukeByText(/log.?in|sign.?up|join facebook/i, /like|comment|share/i);
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1000);
  }

  // ─── TikTok ──────────────────────────────────────────────────────────────────

  function bypassTikTok() {
    const SELECTORS = [
      '[data-e2e="login-modal"]',
      '[class*="LoginModal"]',
      '[class*="login-modal"]',
      '[class*="DivLoginContainer"]',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();

      // Full-screen modal only (not inline "log in to like" buttons — those are fine)
      document.querySelectorAll('div[class*="Modal"], div[class*="modal"], div[class*="Overlay"]').forEach(el => {
        const text = el.innerText || '';
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const isFullModal = (style.position === 'fixed' || style.position === 'absolute')
          && rect.width > window.innerWidth * 0.3
          && rect.height > window.innerHeight * 0.3;
        if (isFullModal && /log.?in|sign.?up|join tiktok/i.test(text)) el.remove();
      });

      // Backdrop masks
      document.querySelectorAll('div[class*="Mask"], div[class*="mask"]').forEach(el => {
        const style = getComputedStyle(el);
        if (style.position === 'fixed' && !(el.innerText || '').trim()) el.remove();
      });
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 800);
  }

  // ─── Reddit ──────────────────────────────────────────────────────────────────

  function bypassReddit() {
    const SELECTORS = [
      '[data-testid="login-modal"]',
      'shreddit-signup-drawer',
      'shreddit-login-drawer',
      'shreddit-age-gate-modal',
      '.login-required-modal',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
      nukeByText(/log in to reddit|join reddit|sign up to|create.*account/i, /like|comment|award/i);
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1000);
  }

  // ─── LinkedIn ────────────────────────────────────────────────────────────────

  function bypassLinkedIn() {
    const SELECTORS = [
      '.authwall-join-form',
      '.join-form',
      '#join-form',
      '.modal__overlay',
      '.signup-modal',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
      nukeByText(/join linkedin|sign in|create.*account|see.*full.*profile/i, /message|connect/i);
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1000);
  }

  // ─── Pinterest ───────────────────────────────────────────────────────────────

  function bypassPinterest() {
    const SELECTORS = [
      '[data-test-id="signup-wall"]',
      '[data-test-id="login-signup-wall"]',
      '.unauthHomepage',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
      nukeByText(/log in|sign up|join pinterest|create.*account/i, /save|pin/i);
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1000);
  }

  // ─── Snapchat ────────────────────────────────────────────────────────────────

  function bypassSnapchat() {
    const SELECTORS = [
      '[data-testid="login-modal"]',
      '.login-modal',
      '.signup-wall',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
      nukeByText(/log in|sign up|join snapchat|create.*account/i, null);
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1000);
  }

  // ─── YouTube ─────────────────────────────────────────────────────────────────

  function bypassYouTube() {
    const SELECTORS = [
      'ytd-enforcement-message-view-model',
      'ytd-signin-promo-renderer',
      'ytd-mealbar-promo-renderer',
    ];

    const clean = () => {
      removeElements(SELECTORS);
      unlockScroll();
    };

    clean();
    watchAndRun(clean);
    setInterval(clean, 1500);
  }

  // ─── Router ──────────────────────────────────────────────────────────────────

  function init() {
    // Fast cookie check first (no DOM needed)
    if (isLoggedIn()) return;

    const run = () => {
      if (isLoggedIn()) return; // DOM-based re-check after load

      if      (host.includes('instagram.com'))                      bypassInstagram();
      else if (host.includes('twitter.com') || host.includes('x.com')) bypassTwitter();
      else if (host.includes('facebook.com'))                       bypassFacebook();
      else if (host.includes('tiktok.com'))                         bypassTikTok();
      else if (host.includes('reddit.com'))                         bypassReddit();
      else if (host.includes('linkedin.com'))                       bypassLinkedIn();
      else if (host.includes('pinterest.com'))                      bypassPinterest();
      else if (host.includes('snapchat.com'))                       bypassSnapchat();
      else if (host.includes('youtube.com'))                        bypassYouTube();
    };

    run();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    }
  }

  init();

})();
