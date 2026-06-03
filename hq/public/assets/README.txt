Plaats hier de eigen media van Abdul & Lilia:

  couple-a.jpg   → selfie met blauwe helmen (Bucketlist/Profiel achtergrond)
  couple-b.jpg   → Abdul kust Lilia, gouden uur (Home hero)
  lilia.mp4      → korte ambient clip (klein, gecomprimeerd)

Tot ze geplaatst zijn valt de app netjes terug op een Unsplash-sfeerfoto
(zie src/data/trip.ts → IMAGES). Comprimeer de video stevig:
  ffmpeg -i input.mov -vf scale=720:-2 -an -crf 30 -movflags +faststart lilia.mp4
