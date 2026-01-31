# Changelog

All notable changes to this project will be documented in this file.

## [v1.2.0] - 2026-01-31

### 🚀 New Features
- **Donation Popup**: Integrated a session-aware donation popup with QR code and "Buy Me A Coffee" link.
- **Super Admin Dashboard**:
  - Added "User Management" view for Super Admins.
  - **Donation Toggle**: Admins can now toggle the donation popup ON/OFF for specific users.
  - **Real Email Visibility**: Super Admins can now view real user email addresses via secure RPC.

### 🐛 Bug Fixes
- **Authentication**: Resolved race conditions causing "stuck" login/logout states.
- **Session Handling**: Improved `AuthContext` to reliably clear local storage on sign-out.

### 💅 UI/UX Improvements
- **Enhanced Admin UI**: Added clear "Popup ON/OFF" labels and status indicators.
- **Visual Polish**: Improved glassmorphism effects and button styling.

---

## [v1.1.0] - 2026-01-29

### 🚀 New Features
- **Desert Theme**: Refined light mode with high-contrast palette.
- **Export Tools**: Enhanced PDF and ADIF export capabilities.

### 🔧 Maintenance
- **Performance**: Optimized rendering with Stale-While-Revalidate pattern.
