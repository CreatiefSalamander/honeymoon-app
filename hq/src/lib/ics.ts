// .ics-export voor iPhone-agenda (werkt direct, geen login)
export function makeICS(ev: { title: string; date: string; timeSlot?: string; location?: string; note?: string; durationH?: number }) {
  const slotHour: Record<string, number> = { Ochtend: 9, Morning: 9, Middag: 13, Afternoon: 13, Avond: 19, Evening: 19, Nacht: 22, Night: 22 }
  const startH = slotHour[ev.timeSlot || ''] ?? 12
  const d = ev.date.replace(/-/g, '')
  const pad = (n: number) => String(n).padStart(2, '0')
  const dtStart = `${d}T${pad(startH)}0000`
  const dtEnd = `${d}T${pad(startH + (ev.durationH || 2))}0000`
  const uid = `${Date.now()}@honeymoon-hq`
  const esc = (s = '') => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Honeymoon HQ//NL', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtStart}`, `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
    `SUMMARY:${esc(ev.title)}`,
    ev.location ? `LOCATION:${esc(ev.location)}` : '',
    ev.note ? `DESCRIPTION:${esc(ev.note)}` : '',
    'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', `DESCRIPTION:${esc(ev.title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')

  return ics
}

export function downloadICS(ev: Parameters<typeof makeICS>[0]) {
  const blob = new Blob([makeICS(ev)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${ev.title.replace(/[^a-z0-9]/gi, '_')}.ics`
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
