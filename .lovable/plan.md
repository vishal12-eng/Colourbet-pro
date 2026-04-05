

# PWA Setup Plan for ColorBet Pro

## Overview

Add Progressive Web App capabilities to the existing app without modifying any game logic, UI components, or backend integrations. The approach uses a simple `manifest.json` + `vite-plugin-pwa` with careful configuration to avoid caching sensitive data.

## Important Caveat

PWA features (install prompt, offline support, service worker) will **only work in the published/deployed version**, not in the Lovable editor preview. The service worker will be disabled in development mode and guarded against iframe/preview contexts.

---

## Step-by-step Plan

### 1. Install `vite-plugin-pwa`

Add `vite-plugin-pwa` as a dev dependency.

### 2. Create PWA icons

Generate two placeholder icons (`icon-192x192.png` and `icon-512x512.png`) in the `public/` folder. These will be simple branded icons with the app's dark blue background and "CB" text.

### 3. Create `public/manifest.json`

```json
{
  "name": "ColorBet Pro",
  "short_name": "ColorBet",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0f172a",
  "background_color": "#0f172a",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 4. Update `vite.config.ts`

Add `VitePWA` plugin with:
- `registerType: "autoUpdate"` 
- `devOptions: { enabled: false }` (disabled in dev/preview)
- `navigateFallbackDenylist: [/^\/~oauth/]`
- Workbox runtime caching rules:
  - **API calls** (Supabase URLs): NetworkOnly (never cache wallet, bets, game data)
  - **Static assets**: CacheFirst with 30-day expiration
  - **Google Fonts**: CacheFirst

### 5. Update `src/main.tsx`

Add iframe/preview guard that unregisters service workers when running inside Lovable preview or iframes, preventing stale cache issues during development.

### 6. Update `index.html`

Add `<link rel="manifest" href="/manifest.json">` to the head.

### 7. Create Install Prompt Hook (`src/hooks/usePwaInstall.ts`)

A React hook that:
- Captures the `beforeinstallprompt` event
- Exposes `isInstallable` and `promptInstall()` 
- Tracks if already installed via `appinstalled` event

### 8. Add Install Button to AppHeader

Add a small download/install icon button in the header (only visible when `isInstallable` is true). Uses the existing icon button styling. No layout changes — just one extra icon next to the existing buttons.

### 9. Create Offline Fallback Component

A simple offline banner component that shows "You're offline" when `navigator.onLine` is false, displayed at the top of the app. Non-intrusive, auto-dismisses when back online.

---

## What will NOT be cached (security)

- All Supabase API calls (wallet, bets, rounds, profiles)
- POST/PUT/DELETE requests
- Authentication tokens

## What WILL be cached

- Static JS/CSS bundles
- Font files
- App shell (index.html via navigateFallback)

## Files to create/modify

| File | Action |
|------|--------|
| `public/manifest.json` | Create |
| `public/icon-192x192.png` | Create |
| `public/icon-512x512.png` | Create |
| `public/offline.html` | Create (simple fallback page) |
| `src/hooks/usePwaInstall.ts` | Create |
| `src/components/OfflineBanner.tsx` | Create |
| `vite.config.ts` | Add VitePWA plugin |
| `src/main.tsx` | Add SW guard for preview/iframe |
| `index.html` | Add manifest link |
| `src/components/layout/AppHeader.tsx` | Add install button |
| `src/App.tsx` | Add OfflineBanner |

