import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'PingMap — Monitor de uptime en tiempo real',
  description: 'Monitorea tus servicios y visualízalos en un mapa mundial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geistMono.variable} font-mono bg-zinc-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}