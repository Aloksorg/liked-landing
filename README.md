# liked.app — landningssidan

Den publika landningssidan för **Liked**. Statisk HTML och CSS, ingen byggkedja, inga
beroenden: filerna i det här repot *är* sajten, serverade av GitHub Pages.

Sidan är portad ur appen (`Aloksorg/liked`, `src/components/landing-page.tsx`,
`src/components/brand-illustrations.tsx` och landningssidans nycklar i `src/lib/i18n.ts`)
och använder samma designsystem — cream `#FFF8F4`, djup teal `#0F766E`, League Spartan
som display-font, systemsans i brödtext.

## Varför den bor för sig

`liked.app` och `app.liked.app` är två skilda saker:

| Adress | Vad som ligger där | Var det driftas |
| --- | --- | --- |
| `liked.app` | Den här landningssidan | GitHub Pages, det här repot |
| `app.liked.app` | Själva appen — konto, inloggning, villkor, integritet | Lovable |

Lovable kan bara ha **en** primär domän per projekt, och alla andra domäner omdirigeras
dit. Det var precis det som slog ut cron-jobben och Stripe-webhooken 21–22 augusti 2026
(se `Aloksorg/liked#45`). Att låta landningssidan bo någon annanstans gör att appen kan
äga sin domän ostört.

**Följden för länkar:** allt app-relaterat härifrån pekar på `https://app.liked.app/…`.
Ingen länk i det här repot får peka på `liked.app/nånting` utom sidorna nedan, eftersom
det bara är de som finns här.

## Filerna

```
index.html      svenska landningssidan   → https://liked.app/
en/index.html   engelska landningssidan  → https://liked.app/en/
404.html        serveras för alla adresser som inte finns
styles.css      hela designsystemet, en fil
og-image.png    delningsbilden, 1200×630 (kopierad från appens public/)
favicon.svg, favicon-48.png, apple-touch-icon.png
robots.txt      öppen för alla crawlers
sitemap.xml     bara de två sidorna ovan
CNAME           liked.app — Pages läser den vid varje publicering
.nojekyll       hoppa över Jekyll; filerna serveras precis som de ligger
```

### Att redigera

- **Två språk, två filer.** `index.html` och `en/index.html` är samma markup med olika
  text. De har ingen gemensam källa — det hade krävt just den byggkedja sajten finns
  till för att slippa. **Ändrar du den ena måste du ändra den andra i samma commit.**
- **Relativa sökvägar.** Sidorna länkar till `styles.css` respektive `../styles.css`, och
  språkväxlaren till `en/` respektive `../`. Det är därför sajten fungerar både på
  `https://liked.app/` och på förhandsgranskningen
  `https://aloksorg.github.io/liked-landing/`, där allt ligger under en undersökväg.
  Skriv aldrig om dem till `/styles.css`.
- **Paletten finns på två ställen** — här i `styles.css` och i appens `src/styles.css`.
  Ändras designsystemet måste båda ändras.
- **`google-site-verification`-taggen i `index.html` ska ligga kvar.** Egendomen
  `https://liked.app/` är verifierad i Google Search Console med exakt den taggen. Tas
  den bort tappas verifieringen vid nästa kontroll.
- **Ingen build, ingen preview-server.** Öppna filen i en webbläsare, eller kör
  `python -m http.server` i repotroten.

## DNS hos GoDaddy

> **Ändra inte de här posterna med automatik.** De sätts för hand av ägaren (eller av
> Claude i ägarens webbläsare) *efter* att sajten har verifierats på
> `https://aloksorg.github.io/liked-landing/`. Fram tills dess pekar `liked.app`
> fortfarande på Lovable och allt fungerar som förut.

### Förhandsgranskningen fungerar bara innan domänen är satt

Så snart `CNAME` finns i repot och Pages har `liked.app` som custom domain omdirigerar
GitHub `https://aloksorg.github.io/liked-landing/` → `https://liked.app/`. Tills DNS
pekar hit hamnar man då på appen i Lovable i stället för på den här sidan. Det är väntat
och inte ett fel — sajten är verifierad på förhandsgranskningsadressen *innan* domänen
sattes.

Behöver du förhandsgranska igen innan DNS är omlagt, koppla loss domänen tillfälligt:

```bash
gh api -X PUT /repos/Aloksorg/liked-landing/pages -f cname=""   # frigör github.io-adressen
gh api -X PUT /repos/Aloksorg/liked-landing/pages -f cname=liked.app   # koppla på igen
```

`CNAME`-filen i repot sätter tillbaka domänen vid nästa publicering, så ta bort filen
också om frånkopplingen ska överleva en push.

I dag pekar `liked.app` på Lovables edge (`A @ → 185.158.133.1`). Det ska bytas mot
GitHub Pages fyra A-poster. `app.liked.app` rörs **inte** — den ska fortsätta peka på
Lovable, annars försvinner appen.

### Poster som ska finnas

| Typ | Namn | Värde | TTL |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| CNAME | `www` | `aloksorg.github.io` | 600 |

### Poster som ska tas bort

- `A @ → 185.158.133.1` (Lovables edge — ersätts av de fyra ovan)
- Eventuell `A www` eller `CNAME www` som pekar på Lovable (ersätts av CNAME:t ovan)

### Poster som ska lämnas i fred

- Allt som rör `app.liked.app` — det är appen.
- `TXT _lovable` — Lovables ägarverifiering för `app.liked.app`.
- MX och SPF/DKIM/DMARC — e-posten till `hej@liked.app`.

### Efter att posterna är satta

1. Kontrollera att de har spridit sig: `dig +short liked.app` ska svara med de fyra
   `185.199.*`-adresserna.
2. Slå på HTTPS i Pages när GitHub har hunnit utfärda certifikatet (det tar från några
   minuter upp till en timme efter att DNS pekar rätt):

   ```bash
   gh api -X PUT /repos/Aloksorg/liked-landing/pages -f https_enforced=true
   ```

3. Öppna `https://liked.app/` och kontrollera att landningssidan syns — inte appen.
4. Kontrollera i Google Search Console att egendomen `https://liked.app/` fortfarande är
   verifierad, och skicka in `https://liked.app/sitemap.xml` på nytt.

## Publicering

Push till `main` publicerar. GitHub Pages bygger om sajten inom ungefär en minut; det
finns inget publiceringssteg att klicka på (till skillnad från appen i Lovable).

```bash
git add -A && git commit -m "…" && git push
```
