# Viresh — Motion Portfolio

A cinematic, animation-heavy developer portfolio built with React, Vite, Three.js, GSAP, ScrollTrigger, and Lenis.

## Visual direction

- Pale lavender-grey surfaces
- Near-black typography and dark project panels
- Electric-lime interactive accents
- Chrome-like procedural 3D sculpture with lavender and lime lighting

## Motion features

- Interactive procedural 3D hero rendered with Three.js
- GSAP and ScrollTrigger entrance choreography, scroll-linked effects, and a pinned horizontal project runway on desktop
- Lenis smooth scrolling
- Animated preloader and full-screen shutter navigation
- Cursor response, magnetic controls, parallax, and moving type ticker
- Responsive layout and reduced-motion support

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To create a production build:

```bash
npm run build
npm run preview
```

## Customize

- `src/App.jsx`: page content, projects, links, navigation, and GSAP choreography
- `src/components/ThreeHero.jsx`: procedural Three.js scene and pointer response
- `src/styles.css`: layout, responsive behavior, palette, and motion styling
- `public/favicon.svg`: favicon

Replace placeholder links and the sample contact email before publishing.
