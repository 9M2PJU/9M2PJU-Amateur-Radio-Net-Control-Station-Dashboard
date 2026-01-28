# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-28

### 🚀 Major Release: Next.js 14 Migration
Successfully migrated the entire application from Vite/React Router to Next.js 14 App Router.

### ✨ New Features
- **Architecture**: Full adoption of Next.js 14 App Router (`src/app`).
- **Performance**:
    - "Perfect Fit" Dashboard Layout: Optimized for desktop to eliminate vertical scrolling.
    - Image Optimization with `next/image`.
    - Dynamic imports for heavy widgets (Maps).
- **Authentication**: Integrated Supabase Auth with server-side compatible patterns.

### 🛠 Improvements
- **Security**: Updated dependencies to resolve high/critical vulnerabilities.
- **Cleanup**: Removed all legacy Vite configuration and backup files.
- **Type Safety**: Enhanced TypeScript coverage across the codebase.

### 🐛 Fixes
- Fixed build errors related to `react-router-dom` residuals.
- Resolved "Dashboard synchronization timed out" issues.
- Fixed layout overflow issues on the dashboard.
