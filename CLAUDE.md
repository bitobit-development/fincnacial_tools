# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.4 application built with React 19, TypeScript, and Tailwind CSS v4. The project uses Turbopack for faster build times and follows the Next.js App Router architecture.

## Development Commands

**Start development server:**
```bash
npm run dev
```
The server runs on port 3000 by default. If port 3000 is already in use, use `npx kill-port 3000` before starting.

**Build for production:**
```bash
npm run build
```

**Start production server:**
```bash
npm start
```

**Run linter:**
```bash
npm run lint
```

## Architecture

**Framework:** Next.js 15.5.4 with App Router
- Uses React Server Components by default
- All components in `src/app/` are server components unless marked with `"use client"`

**Styling:** Tailwind CSS v4
- Configuration uses PostCSS with `@tailwindcss/postcss`
- Global styles in `src/app/globals.css` with CSS custom properties for theming
- Dark mode support via `prefers-color-scheme`

**TypeScript Configuration:**
- Path alias `@/*` maps to `./src/*`
- Strict mode enabled
- Target: ES2017

**Fonts:**
- Uses Next.js font optimization with Geist and Geist Mono fonts
- Configured in `src/app/layout.tsx`

**Project Structure:**
- `src/app/` - App Router pages and layouts (Next.js 13+ structure)
- `src/app/layout.tsx` - Root layout with metadata and font configuration
- `src/app/page.tsx` - Home page component
- `src/app/globals.css` - Global styles and Tailwind imports

## Key Configuration Files

- `next.config.ts` - Next.js configuration (TypeScript)
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint configuration using flat config format
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS v4
- `package.json` - Scripts use `--turbopack` flag for faster builds

## Important Notes

- Development and build commands use Turbopack (`--turbopack` flag)
- ESLint uses Next.js recommended configs: `next/core-web-vitals` and `next/typescript`
- The project uses React 19 which may have breaking changes from React 18
