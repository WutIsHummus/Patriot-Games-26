# Hackathon Website Boilerplate

A React starter for building a hackathon website quickly. It includes Vite, React Router, Tailwind CSS, lucide icons, linting, and a reusable component structure.

## Stack

- React
- Vite
- React Router
- Tailwind CSS
- Lucide React
- Oxlint

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` starts the local dev server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs Oxlint.

## Project structure

```text
src/
  components/   Reusable UI pieces
  data/         App copy, nav, features, and stack lists
  lib/          Shared helpers
  pages/        Route-level screens
```

## Customizing the starter

Start in `src/data/site.js` to replace the sample hackathon copy with the real project name, value proposition, features, roadmap, and stack. Add new reusable UI in `src/components/`, then compose full screens in `src/pages/`.

Environment variables should use the `VITE_` prefix. Copy `.env.example` to `.env` when local configuration is needed.
