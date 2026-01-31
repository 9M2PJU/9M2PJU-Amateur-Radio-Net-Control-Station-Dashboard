# 🎙️ 9M2PJU NCS Dashboard
### Amateur Radio Net Control Station • High-Performance Digital Logging

![Release](https://img.shields.io/badge/Release-v1.2.0-emerald?style=for-the-badge&logo=rocket)
![Status](https://img.shields.io/badge/Status-Hardened-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Vercel%20%2B%20Supabase-informational?style=for-the-badge)

A premium, state-of-the-art dashboard designed for Amateur Radio Net Control Stations (NCS). Built for speed, security, and visual excellence, this dashboard streamlines on-air logging with real-time synchronization and "Stale-While-Revalidate" caching.

---

## 🏗️ System Architecture

The dashboard utilizes a modern serverless stack with a focus on **Real-time Synchronization** and **Edge Performance**.

```mermaid
graph TD
    User((NCS Operator)) --> Frontend[React + Vite Dashboard]
    Frontend --> Auth[Supabase Auth]
    Frontend --> Cache[(Local SWR Cache)]
    Frontend --> DB[(Supabase PostgreSQL)]
    
    subgraph "Edge Infrastructure"
        Frontend
        Cache
    end
    
    subgraph "Backend Services"
        Auth
        DB
        Realtime[Realtime WebSocket]
    end
    
    DB <--> Realtime
    Realtime <--> Frontend
```

---

## ⚡ Performance Engineered

The application is optimized to run on free-tier infrastructure while maintaining premium performance.

### 🏹 Stale-While-Revalidate (SWR)
Our custom caching layer ensures that the UI is never "waiting" for the database.
1. **Instant Memory**: Dashboard loads from local cache in **< 10ms**.
2. **Silent Sync**: Background requests verify data with Supabase.
3. **Smooth Update**: UI updates reactively only when new data is found.

### 📦 Dynamic Code Splitting
We use advanced tree-shaking and lazy loading to keep the initial payload light.
- **Heavy Modules**: Maps, Charts, and PDF generators are loaded **on-demand**.
- **Edge Routing**: Fast navigation between operations.

---

## 🛡️ Security Hardening

The 9M2PJU Dashboard follows the **Principle of Least Privilege (PoLP)**.

```mermaid
sequenceDiagram
    participant U as NCS Operator
    participant API as Supabase API
    participant RLS as RLS Policies
    participant DB as Database
    
    U->>API: Insert Check-in
    API->>RLS: Validate Ownership
    alt Is Net Owner
        RLS->>DB: Authorize Write
        DB-->>U: Success (201)
    else Is Not Owner
        RLS-->>U: Denied (403)
    end
```

### 🔒 Key Security Features:
- **Hardened RLS**: Strict Row Level Security ensures users can only modify their own nets.
- **JWT Validation**: Automatic session health checks prevent token-related hangs.
- **Schema Isolation**: Refined database grants minimize the attack surface.

---

## 💎 Design Aesthetics

- **Glassmorphism**: Sleek, transparent UI elements with backdrop filters.
- **Vibrant HUD**: High-contrast, accessibility-aware color palette.
- **Real-time Feedback**: Optimistic UI updates for a "zero-latency" feel.

---

## 📊 Operation Insights

Analyze your Net's performance with integrated analytics:
- **Signal Strength Distribution**
- **Geospatial Mapping**
- **Participation Retention**
- **Automated PDF/ADIF Exports**

---

---

## ☕ Support the Project

If you find this dashboard useful for your station, consider supporting the development!

<p align="center">
  <a href="https://buymeacoffee.com/9m2pju" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
  </a>
  <br />
  <img src="public/donation-qr.png" alt="Donation QR Code" width="150" />
</p>

---

<p align="center">
  <i>Developed for the Amateur Radio Community with ❤️ by 9M2PJU</i>
</p>
