# Hackathon Website Boilerplate

A minimal React starter for building a hackathon website quickly. It includes Vite, React Router, Tailwind CSS, and linting.

## Stack

- React
- Vite
- React Router
- Tailwind CSS
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
  pages/        Route-level screens
  App.jsx       Route definitions
  main.jsx      React app entry point
```

## Customizing the starter

Start in `src/pages/Home.jsx` and replace the placeholder page with your project website. Add new pages under `src/pages/` and wire routes in `src/App.jsx`.

Environment variables should use the `VITE_` prefix. Copy `.env.example` to `.env` when local configuration is needed.
