import { ReactNode } from 'react'
// Shell = lichte content-wrapper binnen het frame. De chrome (frame, topbar,
// drawer, FAB, toasts, animaties) zit in Layout. Pages blijven <Shell> gebruiken.
export default function Shell({ children }: { children: ReactNode; fab?: boolean }) {
  return <div className="page">{children}</div>
}
