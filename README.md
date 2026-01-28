# 📻 9M2PJU NCS Center

A professional-grade amateur radio net control station center. Manage weekly nets, emergency exercises, and log check-ins with beautiful charts and real-time updates.

![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- 🔐 **User Authentication** - Register with callsign, secure login
- 📋 **Net Management** - Create weekly, emergency exercise, or special event nets
- 📝 **Check-in Logging** - Quick logging with callsign, signal reports, remarks
- 📊 **Rich Analytics** - Charts showing activity trends and top participants
- ⚡ **Real-time Updates** - Live check-in feed with Supabase Realtime
- 📱 **Mobile Responsive** - Full-featured mobile experience
- 🌙 **Dark Theme** - Beautiful glassmorphism UI with Cyber/Space aesthetic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- [Supabase](https://supabase.com) account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Net-Control-Station-Dashboard.git
   cd 9M2PJU-Amateur-Radio-Net-Control-Station-Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Create a Supabase project and copy your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase URL and anon key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Set up database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```
   supabase/schema.sql
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── pages/                  # Application pages
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Nets.tsx           # Net operations list
│   ├── NetDetail.tsx      # Net detail with real-time
│   ├── NewNet.tsx         # Create new net
│   ├── Profile.tsx        # User profile
│   ├── Settings.tsx       # Settings
│   ├── Login.tsx          # Authentication
│   ├── Register.tsx       # Registration
│   └── Home.tsx           # Landing page
├── components/            # React components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Navbar.tsx         # Navigation
│   ├── CheckinForm.tsx    # Check-in form
│   ├── CheckinList.tsx    # Check-in list
│   └── widgets/           # Dashboard widgets
├── lib/                   # Utilities
│   ├── supabase.ts        # Supabase client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
└── App.tsx                # React Router setup
```

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Build Tool | [Vite 5](https://vitejs.dev) |
| Framework | [React 19](https://react.dev) |
| Routing | [React Router 7](https://reactrouter.com) |
| Language | [TypeScript](https://typescriptlang.org) |
| Styling | [TailwindCSS 4](https://tailwindcss.com) |
| Backend | [Supabase](https://supabase.com) |
| Charts | [Recharts](https://recharts.org) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Icons | [Lucide](https://lucide.dev) |

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Net-Control-Station-Dashboard)

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Deploy!** - Vercel will automatically detect Vite and build correctly

The `vercel.json` configuration is already included for proper SPA routing.

### Other Platforms

Build the static files:
```bash
npm run build
```

Deploy the `dist/` folder to any static hosting service (Netlify, GitHub Pages, Cloudflare Pages, etc.).

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**9M2PJU** - Amateur Radio Enthusiast

73 de 9M2PJU 📻
