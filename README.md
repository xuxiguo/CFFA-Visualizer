# CFFA Visualizer

A Context-Free Grammar and Finite Automata (CFFA) interactive visualizer that helps students and developers understand formal language theory concepts through visual representations and step-by-step simulations.

## Live Demo

[View Live Demo](https://xuxiguo.github.io/CFFA-Visualizer/)  
_Note: Demo hosted on GitHub Pages_

## Tech Stack

Built with React + TypeScript + Vite for fast development and modern tooling.

## Features

- Interactive visualization of Context-Free Grammars
- Finite Automata simulation and step-through
- Educational tool for formal language theory
- Fast local development with HMR via Vite
- Type-safe React components with TypeScript
- Tailwind CSS utility styling preconfigured

## Quick Start

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

## Project Structure

- `src/App.tsx` — main app component and visualization root
- `src/main.tsx` — React entry, mounts the app
- `index.html` — Vite HTML entry
- `vite.config.ts` — Vite configuration
- `tailwind.config.js` — Tailwind CSS configuration

## Development

This project uses:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) for Fast Refresh
- ESLint for code quality
- TypeScript for type safety
- Tailwind CSS for styling
