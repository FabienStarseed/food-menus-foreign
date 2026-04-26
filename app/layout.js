import './globals.css'

export const metadata = {
  title: 'LinguMenu | Premium AI Menu Translator',
  description: 'Translate foreign menus instantly with AI precision.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#0a0c10',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <main className="premium-gradient min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
