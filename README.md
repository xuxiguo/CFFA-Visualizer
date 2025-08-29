# CFFA Visualizer

A Context-Free Grammar and Finite Automata (CFFA) interactive visualizer that helps students and developers understand formal language theory concepts through visual representations and step-by-step simulations.

## Live Demo

[Replace with your demo URL](https://xuxiguo.github.io/CFFA-Visualizer/)  
_Note: update the link above with your deployed demo (GitHub Pages, Vercel, Netlify, etc.)._

## Tech Stack

Built with React + TypeScript + Vite for fast development and modern tooling.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    # CFFA Visualizer

    Interactive visualizer built with React, TypeScript and Vite.

    Live demo: [Replace with your demo URL](https://example.com)  
    _Note: update the link above with your deployed demo (GitHub Pages, Vercel, Netlify, etc.)._

    This repository uses the standard Vite + React + TypeScript template and includes Tailwind/PostCSS tooling and a minimal ESLint setup.

    ## Quick summary

    - Framework: React
    - Language: TypeScript
    - Bundler/dev server: Vite (HMR)
    - Styling: Tailwind CSS + PostCSS (see `tailwind.config.js`, `postcss.config.js`)
    - Entry points: `src/main.tsx`, `src/App.tsx`
    - Config: `vite.config.ts`, `tsconfig.json`/`tsconfig.app.json`

    ## Features

    - Fast local development with HMR via Vite
    - Type-safe React components with TypeScript
    - Tailwind CSS utility styling preconfigured
    - Small asset pipeline (see `src/assets/`)

    ## Quick start

    Install dependencies and run the dev server:

    ```bash
    npm install
    npm run dev
    ```

    Build for production and preview the build locally:

    ```bash
    npm run build
    npm run preview
    ```

    ## Where to look in the code

    - `src/App.tsx` — main app component and visualization root
    - `src/main.tsx` — React entry, mounts the app
    - `index.html` — Vite HTML entry
    - `vite.config.ts` — Vite configuration

    ## Linting / Type checking

    The template includes ESLint and TypeScript configurations. If you plan to enable type-aware lint rules for CI, see `tsconfig.app.json` and consider enabling the type-checked ESLint presets.

    ---

    If you'd like, I can update the live-demo URL to the actual deployment once you provide it, or I can attempt to infer a likely GitHub Pages/Vercel URL and add it as a default (I'll note that as an assumption before making the change).
