import './globals.css'

export const metadata = {
  title: 'Abdul & Lilia 💍',
  description: 'Onze huwelijksreis app — persoonlijk, romantisch, intiem',
  manifest: '/manifest.json',
  themeColor: '#E8A4B8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Abdul & Lilia',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <div className="app-container">
          {children}
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Dark mode detectie
            if (localStorage.getItem('theme') === 'dark' ||
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark')
            }
            // Service Worker registreren
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {})
              })
            }
          `
        }} />
      </body>
    </html>
  )
}
