import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "9M2PJU Net Control Station Dashboard",
  description: "Professional net management for amateur radio operators. Log check-ins, track participation, and analyze your nets.",
  keywords: ["amateur radio", "ham radio", "net control", "NCS", "emergency exercise"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased text-slate-50 selection:bg-emerald-500/30 selection:text-emerald-300`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-card border-slate-800 text-slate-100',
            style: {
              background: 'rgba(15, 23, 42, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f1f5f9',
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
