# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-29

### 🛡️ Production Hardening (The "Hardened & Optimized" Update)
- **Security**: Complete overhaul of Row Level Security (RLS) policies. Only Net Owners can now modify their session data.
- **Performance**: Implemented "Stale-While-Revalidate" (SWR) local caching. Dashboard and net details now load instantly.
- **Stability**: Added safety timeouts to Auth and Data fetching to prevent UI hangs.
- **Optimization**: Route-level code splitting and manual vendor chunking implemented via Vite.
- **Sync Fix**: Resolved UUID/Slug type mismatch in Postgres queries.

### 🧹 Maintenance
- Consolidated 12+ legacy SQL scripts into `MASTER_MIGRATION.sql`.
- Removed obsolete Docker and build artifacts.
- Premium documentation overhaul with Mermaid diagrams.

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
