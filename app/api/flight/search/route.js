// Server-side: vlucht zoeken — genereert deep links naar boekingssites
// Optioneel: Amadeus API als AMADEUS_CLIENT_ID + AMADEUS_CLIENT_SECRET zijn ingesteld

const AMADEUS_TOKEN_CACHE = { token: null, expiresAt: 0 }

async function getAmadeusToken() {
  if (AMADEUS_TOKEN_CACHE.token && Date.now() < AMADEUS_TOKEN_CACHE.expiresAt) {
    return AMADEUS_TOKEN_CACHE.token
  }
  const id = process.env.AMADEUS_CLIENT_ID
  const secret = process.env.AMADEUS_CLIENT_SECRET
  if (!id || !secret) return null

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${id}&client_secret=${secret}`,
  })
  const data = await res.json()
  if (data.access_token) {
    AMADEUS_TOKEN_CACHE.token = data.access_token
    AMADEUS_TOKEN_CACHE.expiresAt = Date.now() + (data.expires_in - 60) * 1000
    return data.access_token
  }
  return null
}

// IATA-codes voor bekende Nederlandse/Belgische vliegvelden + omgeving
const NEARBY_AIRPORTS = {
  AMS: [{ code: 'AMS', name: 'Amsterdam Schiphol', km: 0 }, { code: 'RTM', name: 'Rotterdam The Hague', km: 65 }, { code: 'EIN', name: 'Eindhoven', km: 110 }, { code: 'BRU', name: 'Brussel', km: 175 }, { code: 'DUS', name: 'Düsseldorf', km: 225 }],
  RTM: [{ code: 'RTM', name: 'Rotterdam', km: 0 }, { code: 'AMS', name: 'Amsterdam', km: 65 }, { code: 'EIN', name: 'Eindhoven', km: 80 }, { code: 'BRU', name: 'Brussel', km: 135 }],
  EIN: [{ code: 'EIN', name: 'Eindhoven', km: 0 }, { code: 'AMS', name: 'Amsterdam', km: 110 }, { code: 'BRU', name: 'Brussel', km: 120 }],
  BRU: [{ code: 'BRU', name: 'Brussel', km: 0 }, { code: 'AMS', name: 'Amsterdam', km: 175 }, { code: 'LGG', name: 'Luik', km: 85 }, { code: 'CRL', name: 'Charleroi', km: 55 }],
}

function buildBookingLinks(from, to, departDate, returnDate, adults) {
  const dep = departDate?.replace(/-/g, '') || ''
  const ret = returnDate?.replace(/-/g, '') || ''
  const tripType = returnDate ? 'return' : 'oneway'

  return [
    {
      site: 'Google Flights',
      icon: '🔍',
      url: `https://www.google.com/travel/flights/search?tfs=CBwQAhoeagcIARIDQU1TEgoyMDI2LTA3LTAxcgcIARIDSVNU`,
      urlSimple: `https://www.google.com/travel/flights?hl=nl`,
      tip: 'Beste voor prijsoverzicht en kalenderweergave',
      color: '#4285F4',
    },
    {
      site: 'Skyscanner',
      icon: '🌐',
      url: `https://www.skyscanner.nl/transport/vluchten/${from}/${to}/${dep}/${ret || ''}/?adults=${adults}&cabinclass=economy`,
      tip: 'Vergelijkt honderden luchtvaartmaatschappijen',
      color: '#00B0FF',
    },
    {
      site: 'Kayak',
      icon: '🚣',
      url: `https://www.kayak.nl/flights/${from}-${to}/${departDate}${returnDate ? '/' + returnDate : ''}/${adults}adults`,
      tip: 'Prijs-alert instellen voor schommelingen',
      color: '#FF690F',
    },
    {
      site: 'Momondo',
      icon: '💡',
      url: `https://www.momondo.nl/flightssearch/${from}-${to}/${departDate}${returnDate ? '/' + returnDate : ''}/${adults}-adults`,
      tip: 'Vindt vaak de laagste tarieven',
      color: '#8B5CF6',
    },
    {
      site: 'Booking.com Vluchten',
      icon: '🏨',
      url: `https://www.booking.com/flights/index.nl.html`,
      tip: 'Combineer met hotel voor extra korting',
      color: '#003580',
    },
    {
      site: 'KLM (direct)',
      icon: '✈️',
      url: `https://www.klm.nl/search/flights?origin=${from}&destination=${to}&outboundDate=${departDate}${returnDate ? '&returnDate=' + returnDate : ''}&adults=${adults}`,
      tip: 'Goede keuze voor directe KLM-vluchten',
      color: '#00A1DE',
    },
    {
      site: 'Transavia',
      icon: '🟢',
      url: `https://www.transavia.com/nl-NL/fly-with-us/search/#/outbound/origin:${from}/destination:${to}/date:${departDate}/passengers:${adults}`,
      tip: 'Budget carrier vanuit NL/BE',
      color: '#009F6B',
    },
  ]
}

function getCheapFlightTips(from, to, departDate) {
  const month = departDate ? new Date(departDate).getMonth() + 1 : null
  const tips = [
    '📅 Boek 6-8 weken van tevoren voor de beste prijs',
    '🗓️ Dinsdag en woensdag zijn de goedkoopste vertrekdagen',
    '⏰ Vroege ochtend- en late avondvluchten zijn vaak goedkoper',
    '🔄 Vergelijk ook vluchten met 1 tussenstop — soms 40% goedkoper',
    '📊 Gebruik Google Flights "Datum Raster" om de goedkoopste week te zien',
    '🔔 Stel een prijs-alert in op Kayak of Google Flights',
    '🧳 Let op bagagekosten bij low-cost carriers (Ryanair, Wizz Air)',
    '💳 Betaal met creditcard voor extra reisbescherming',
  ]
  if (month && [7, 8, 12, 1].includes(month)) {
    tips.unshift('⚠️ Je reist in het hoogseizoen — prijzen zijn hoger, vroeg boeken essentieel!')
  }
  return tips.slice(0, 5)
}

export async function POST(request) {
  try {
    const { from, to, departDate, returnDate, adults = 2 } = await request.json()

    if (!from || !to) return Response.json({ error: 'Van en naar zijn verplicht' }, { status: 400 })

    const fromUp = from.toUpperCase().trim()
    const toUp = to.toUpperCase().trim()

    // Probeer Amadeus voor echte prijzen
    let amadeusOffers = []
    const token = await getAmadeusToken()
    if (token && departDate) {
      try {
        const params = new URLSearchParams({
          originLocationCode: fromUp,
          destinationLocationCode: toUp,
          departureDate: departDate,
          adults: adults.toString(),
          currencyCode: 'EUR',
          max: '8',
        })
        if (returnDate) params.set('returnDate', returnDate)

        const res = await fetch(`https://test.api.amadeus.com/v2/shopping/flight-offers?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.data) {
          amadeusOffers = data.data.slice(0, 6).map(offer => ({
            id: offer.id,
            price: offer.price?.grandTotal,
            currency: offer.price?.currency,
            airline: offer.validatingAirlineCodes?.[0],
            stops: offer.itineraries?.[0]?.segments?.length - 1,
            duration: offer.itineraries?.[0]?.duration?.replace('PT', '').replace('H', 'u ').replace('M', 'min'),
            departure: offer.itineraries?.[0]?.segments?.[0]?.departure?.at,
            arrival: offer.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival?.at,
          }))
        }
      } catch { /* Amadeus niet beschikbaar, ga door met links */ }
    }

    const bookingLinks = buildBookingLinks(fromUp, toUp, departDate, returnDate, adults)
    const nearbyFrom = NEARBY_AIRPORTS[fromUp] || []
    const tips = getCheapFlightTips(fromUp, toUp, departDate)

    return Response.json({
      from: fromUp,
      to: toUp,
      departDate,
      returnDate,
      adults,
      bookingLinks,
      nearbyAirports: nearbyFrom,
      tips,
      amadeusOffers,
      hasRealPrices: amadeusOffers.length > 0,
      amadeusNote: !process.env.AMADEUS_CLIENT_ID
        ? 'Voeg AMADEUS_CLIENT_ID en AMADEUS_CLIENT_SECRET toe voor echte live prijzen (gratis op amadeus.com)'
        : null,
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
