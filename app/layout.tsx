import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI SaaS Dashboard — Powered by Gemini 2.5 Flash',
  description: 'Your intelligent AI assistant dashboard. Chat with Gemini 2.5 Flash, track your conversations, and boost your productivity.',
  keywords: ['AI dashboard', 'Gemini', 'AI chat', 'SaaS', 'productivity'],
  authors: [{ name: 'AI SaaS' }],
  openGraph: {
    title: 'AI Dashboard',
    description: 'Your intelligent AI assistant dashboard powered by Gemini',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
