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
analytics.js    cookieless PostHog: sidvisningar och klick till appen, inga formulärdata
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
  språkväxlaren till `en/` respektive `../`. Det gör att sajten fungerar oavsett om den
  ligger på roten av en domän eller under en undersökväg — vilket den gjorde på
  förhandsgranskningen `aloksorg.github.io/liked-landing/`, och kommer att göra igen om
  domänen någonsin kopplas loss. Skriv aldrig om dem till `/styles.css`.
- **Paletten finns på två ställen** — här i `styles.css` och i appens `src/styles.css`.
  Ändras designsystemet måste båda ändras.
- **`google-site-verification`-taggen i `index.html` ska ligga kvar.** Egendomen
  `https://liked.app/` är verifierad i Google Search Console med exakt den taggen. Tas
  den bort tappas verifieringen vid nästa kontroll.
- **Analysen är avsiktligt smal.** `analytics.js` använder PostHogs EU-endpoint i
  cookieless-läge. Automatisk klickspårning, sessionsinspelning, värmekartor och
  felinsamling är avstängda; bara sidvisningar och länkklick till `app.liked.app` skickas.
- **Ingen build, ingen preview-server.** Öppna filen i en webbläsare, eller kör
  `python -m http.server` i repotroten.

## DNS hos GoDaddy

Omlagt 2026-08-23. `liked.app` pekar på GitHub Pages och serverar den här sajten;
`app.liked.app` ligger kvar hos Lovable och serverar appen. Avsnittet står kvar som
dokumentation av vad som gäller — och som facit om något behöver återställas.

### Posterna som gäller

| Typ | Namn | Värde | TTL | Vad det är |
| --- | --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | 600 | GitHub Pages |
| A | `@` | `185.199.109.153` | 600 | GitHub Pages |
| A | `@` | `185.199.110.153` | 600 | GitHub Pages |
| A | `@` | `185.199.111.153` | 600 | GitHub Pages |
| CNAME | `www` | `aloksorg.github.io` | 600 | GitHub Pages, omdirigerar till roten |
| A | `app` | `185.158.133.1` | 600 | **Lovable — appen. Rör inte.** |

Borttagna i samma veva: `A @ → 185.158.133.1` och `A www → 185.158.133.1`, båda
Lovables edge. Att `www` var en A-post och inte en CNAME var det som gjorde flytten
tvåstegs: GoDaddy vägrar lägga en CNAME på ett namn som redan har en A-post, och
avvisar hela batchen med *"Record name www conflicts with another record"*. A-posten
måste bort först.

Orörda: allt som rör `app.liked.app`, `TXT _lovable*` (Lovables ägarverifieringar),
`NS notify` mot `lovable.cloud`, och `TXT _dmarc` för e-posten till `hej@liked.app`.

### Certifikatet

GitHub utfärdar Let's Encrypt-certifikatet automatiskt när DNS-kontrollen går igenom.
Fram till dess svarar API:et `The certificate does not exist yet` och kryssrutan i
Pages-inställningarna är utgråad. Här tog det några minuter efter att A-posterna spred
sig. Kommandot som slår på tvingande HTTPS:

```bash
gh api -X PUT repos/Aloksorg/liked-landing/pages -F https_enforced=true
```

`-F` och inte `-f` — med `-f` skickas värdet som strängen `"true"` och API:et svarar
422. Och ingen inledande snedstreck i sökvägen: Git Bash på Windows tolkar annars
`/repos/...` som en filsökväg.

Certifikatet täcker både `liked.app` och `www.liked.app` och förnyas av GitHub.

### Förhandsgranskningen är borta

`https://aloksorg.github.io/liked-landing/` 301:ar numera till `https://liked.app/` —
så fungerar Pages när en custom domain är satt och verifierad. Behöver du en
förhandsgranskning som inte är produktionssajten, koppla loss domänen tillfälligt:

```bash
gh api -X PUT repos/Aloksorg/liked-landing/pages -f cname=""          # frigör github.io
gh api -X PUT repos/Aloksorg/liked-landing/pages -f cname=liked.app   # koppla på igen
```

Då ligger `liked.app` nere så länge frånkopplingen varar — gör det bara om du måste.
`CNAME`-filen i repot sätter tillbaka domänen vid nästa publicering, så ta bort filen
också om frånkopplingen ska överleva en push.

### Kvar att göra i appens repo

Appen (`Aloksorg/liked`) anger fortfarande `SITE_ORIGIN = "https://liked.app"` i
`src/lib/site.ts`. Nu när adressen tillhör den här sajten pekar appens canonical-taggar
och sitemap på `https://liked.app/login`, `/villkor` och `/integritet` — adresser som
ger 404 här. Det ska bytas till `https://app.liked.app`.

## Publicering

Push till `main` publicerar. GitHub Pages bygger om sajten inom ungefär en minut; det
finns inget publiceringssteg att klicka på (till skillnad från appen i Lovable).

```bash
git add -A && git commit -m "…" && git push
```
