# Murstenshus i 3D

En statisk 3D web app bygget med [Three.js](https://threejs.org), inspireret af et billede af et en-etages murstenshus med sadeltag, tagvindue, altan med glasværn, græsplæne, buske og et bærtræ.

## Sådan kører du den

Åbn `index.html` i en browser (eller servér mappen med en statisk server):

```bash
npx serve .
# eller
python3 -m http.server 8000
```

Bemærk: Three.js hentes fra CDN (unpkg), så der skal være internet første gang siden indlæses.

## Styring

- Træk med venstre museknap for at dreje rundt om huset
- Scroll for at zoome ind/ud
- Højreklik + træk for at panorere

## Indhold i scenen

- Murstenshus med proceduralt genereret murstens-tekstur
- Sadeltag i mørk grå med tagvindue og rygning
- Stort vindue til højre, mindre vindue til venstre, dør ved altanen
- Hævet altan med trappe, glasværn og stolper
- Græsplæne, buske, blomster, st sti, træ med røde bær
- Blå himmel med skyer, sollys med skygger
