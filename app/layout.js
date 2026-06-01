import './globals.css'

export const metadata = {
  title: 'Abdul & Lilia 💍',
  description: 'Onze persoonlijke huwelijksreis-app',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Abdul & Lilia' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#E3A6B5',
}

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var t = localStorage.getItem('theme')
            if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches))
              document.documentElement.classList.add('dark')
            if('serviceWorker' in navigator)
              window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(()=>{})})
          })()
        `}} />
      </body>
    </html>
  )
}
