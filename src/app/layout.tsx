import './globals.css'
import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'BlastRadius',
  description: 'Know what your change can break before you ship it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#050505] text-white">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
