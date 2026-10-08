import Link from 'next/link';
import {BrandLogo} from './brand-logo';
export default function NotFound(){return <main className="not-found"><Link className="not-found-brand" href="/"><BrandLogo/></Link><p>404 — PAGINA NON TROVATA</p><h1>Ripartiamo<br/>dal tuo stile.</h1><Link className="button dark" href="/catalogo">Esplora tutti i capi</Link></main>}
