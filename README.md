# 📻 Amateur Radio Net Control Station Dashboard

A professional-grade web dashboard for amateur radio net control operators. Manage weekly nets, emergency exercises, and log check-ins with beautiful charts and real-time updates.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
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
- 🌙 **Dark Theme** - Beautiful glassmorphism UI

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
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase URL and anon key.

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
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard
│   ├── nets/               # Net management
│   ├── login/              # Authentication
│   └── register/
├── components/             # React components
│   ├── widgets/            # Dashboard widgets
│   └── ...
├── lib/                    # Utilities
│   ├── supabase/           # Supabase clients
│   └── types.ts            # TypeScript types
└── middleware.ts           # Auth middleware
```

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org) |
| Language | [TypeScript](https://typescriptlang.org) |
| Styling | [TailwindCSS 4](https://tailwindcss.com) |
| Backend | [Supabase](https://supabase.com) |
| Charts | [Recharts](https://recharts.org) |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |
| Icons | [Lucide](https://lucide.dev) |

## 🌐 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/9M2PJU/9M2PJU-Amateur-Radio-Net-Control-Station-Dashboard)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**9M2PJU** - Amateur Radio Enthusiast

73 de 9M2PJU 📻
