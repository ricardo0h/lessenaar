# Zelf gehoste bibliotheken (ADR-3)

De app laadt niets van een CDN. Wat hier staat, kopieert `lessenaar.py --build` mee naar de site en zet de
service worker in de precache. `tests/test_lessenaar.py` controleert de sha256 hieronder; een ander bestand laat
pytest falen. Bijwerken is handwerk: nieuwe map met het versienummer, `PDFJS` in `lessenaar.html` en de lijst in
`sw.js` aanpassen, en deze tabel. Kwartaalcontrole: is er een beveiligingsupdate voor deze versie?

## pdf.js 3.11.174

- Bron: npm-pakket `pdfjs-dist@3.11.174` (https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-3.11.174.tgz), map `build/`
  en `LICENSE`. Dezelfde build die de app tot R3 van cdnjs haalde (niet de `legacy/`-build).
- Licentie: Apache-2.0 (`LICENSE`).
- Gemeten grootte: 1.407.216 bytes aan JavaScript (±1,4 MB, ongecomprimeerd).

| Bestand | Bytes | sha256 |
| --- | --- | --- |
| `pdfjs-3.11.174/pdf.min.js` | 320004 | `5b5799e6f8c680663207ac5b42ee14eed2a406fa7af48f50c154f0c0b1566946` |
| `pdfjs-3.11.174/pdf.worker.min.js` | 1087212 | `feabdf309770ed24bba31a5467836cdc8cf639c705af27d52b585b041bb8527b` |
| `pdfjs-3.11.174/LICENSE` | 10174 | `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594` |
