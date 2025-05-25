import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: '吵架包赢MAX - 全网最牛吵架神器',
  description: '让你的每一次吵架都有回响，一键回怼 + 表情包制胜',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;700&family=JetBrains+Mono:wght@400;600&family=Rubik:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#1A1A1A] font-chakra text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}