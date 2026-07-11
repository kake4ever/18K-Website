# 18K Nail Boutique — Next.js Preview

Prototype rebuild of the 18K homepage using **Next.js 15 + React 19 + Tailwind CSS + Motion.dev**.

## Purpose

A/B preview for the design system rebuild. Production site (`https://18knailboutique.com`) remains on static HTML.

## Stack

- **Next.js 15.1** (App Router, React 19)
- **Tailwind CSS 3.4** — brand tokens configured in `tailwind.config.ts`
- **Motion 11** (formerly Framer Motion) — production-grade animations
- **Cormorant Garamond + Outfit** via `next/font/google`
- **lucide-react** for icons

## Structure

```
next-preview/
├── app/
│   ├── layout.tsx    — root layout + font loading
│   ├── page.tsx      — homepage
│   └── globals.css   — Tailwind base + custom
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── Marquee.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Gallery.tsx
│   ├── VideoShowcase.tsx
│   ├── CTA.tsx
│   └── Footer.tsx
├── public/
│   ├── images/       — copied from parent
│   └── videos/       — copied from parent
├── lib/utils.ts
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Local dev

```bash
cd next-preview
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

Deploy this folder as a separate Netlify site (not the same one as production):

1. Netlify → **Add new site → Import from Git**
2. Repository: `kake4ever/18K-Website`
3. Branch: `claude/next-preview-zkCNN`
4. **Base directory**: `next-preview`
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Netlify auto-detects Next.js and installs @netlify/plugin-nextjs

## Notes

- Booking still handled by Zenoti external link
- No chat widget / AI yet (Phase 2 if this direction is approved)
- Assets copied from parent (~32MB total)
