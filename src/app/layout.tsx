import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
