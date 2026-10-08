# Memento Fashion — pacchetto Vercel

Esportazione della proposta Memento/Valber V9, aggiornata per Next.js e Vercel l'8 ottobre 2026.

## Caricamento dello ZIP

1. Apri https://vercel.com/drop ed entra nel tuo account.
2. Trascina `Valber_Shop_Memento_Vercel.zip` nella pagina.
3. Seleziona il team e il nome del progetto, ad esempio `memento-fashion`.
4. Premi **Deploy**. Vercel installa le dipendenze e compila il progetto.

La configurazione è già in `vercel.json`: framework Next.js, installazione `npm ci`, build `npm run build`. I file del progetto sono alla radice dell'archivio. Non impostare `public` come cartella di output: contiene soltanto i media. Lascia l'output predefinito di Next.js. Non sono necessarie variabili d'ambiente per questa demo.

Il primo caricamento con Vercel Drop crea un nuovo progetto e lo pubblica in produzione. Per aggiornare un progetto esistente puoi estrarre lo ZIP e caricare la cartella dalla sua dashboard, oppure collegare i sorgenti a un repository Git.

Documentazione ufficiale: https://vercel.com/docs/drop

## Contenuto

- Homepage con logo Memento, video e accessi diretti alle categorie.
- Percorsi Uomo, Donna e Denim; catalogo con filtri nell'indirizzo.
- 19 capi dimostrativi, 6 look componibili e disponibilità per sede.
- Bag e checkout con carta, PayPal, Apple Pay, Google Pay e bonifico simulati.
- Immagini, logo SVG e due video MP4 inclusi localmente in `public/`.

Prezzi, scorte, sedi e pagamenti sono dimostrativi. Il checkout non invia ordini, prenotazioni o addebiti. La bag usa la sessione locale del browser. Il sito conserva `noindex`.

## Avvio locale

Da questa cartella, con Node.js 22.13 o successivo:

```sh
npm ci
npm run dev
```

Per controllare la versione compilata:

```sh
npm test
npm run build
npm start
```

Apri http://localhost:3000. Non aprire i file TSX direttamente nel browser.

## Personalizzazione

- Identità e proporzioni del logo: `app/storefront.ts`.
- Logo: `public/brand/memento-wordmark.svg`.
- Catalogo e sedi: `app/data.ts`.
- Abbinamenti: `app/looks.ts` e `app/shopping-paths.ts`.
- Provenienza dei media: `ASSET_SOURCES.json`.

## Compatibilità verificata

Il pacchetto usa `next build` e `next start`, senza richiedere il runtime Sites. Il layout viene renderizzato alla richiesta per supportare i filtri URL anche all'apertura diretta delle pagine. La build di produzione e il controllo TypeScript sono stati completati con Next.js 16.2.6 e Node.js 24.19.0. Gli otto test esistenti su catalogo, varianti, look, scorte e totali sono passati.

La versione compilata ha risposto correttamente su 25 URL, comprese tutte le schede prodotto e un catalogo filtrato. Verificati anche tutti i 52 asset locali e il ritorno 404 per un prodotto inesistente.

Non sono inclusi dipendenze installate, cache, credenziali o file di collegamento a un account Vercel. La pubblicazione su Vercel verrà effettuata dal tuo account quando caricherai questo pacchetto.
