'use client';

import {useEffect, useRef, useState, type TouchEvent, type CSSProperties} from 'react';
import Link from 'next/link';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {products, euros} from './data';
import {RevealHeading} from './site-motion';
import {CampaignVideo} from './campaign-video';
import {storefront} from './storefront';
import {HeroCategories} from './shopping-entry';

export function ImmersiveHero() {
  return <div className="hero-track">
    <section className="hero immersive-hero" aria-label={`${storefront.name}, la selezione uomo`}>
      <div className="hero-frame" data-scene>
        <CampaignVideo />
        <div className="hero-shade" />
        <div className="hero-top"><span>{storefront.label} / FASHION CONCEPT</span><span>THE EVERYDAY EDIT — 01</span></div>
        <div className="hero-content">
          <h1 className="hero-brand"><span className="hero-brand-space" aria-hidden="true" /><span className="sr-only">{storefront.name}</span></h1>
          <div className="hero-message">
            <p className="hero-tagline">Good looks.{' '}<br />Great days.</p>
            <p className="hero-description">I capi giusti.{' '}<br />Tutto il resto viene da sé.</p>
            <div className="hero-actions">
              <Link className="button light" data-magnet href="/catalogo?genere=uomo">Acquista uomo <ArrowUpRight size={18} /></Link>
              <Link className="hero-secondary" href="/catalogo?genere=donna">Acquista donna <ArrowUpRight size={18} /></Link>
            </div>
            <HeroCategories/>
          </div>
        </div>
        <a href="#shop-categories" className="hero-foot"><span className="hero-place">Il tuo stile, ogni giorno.</span><span>SCEGLI PER CATEGORIA <span className="scroll-disc"><ArrowDown size={18} /></span></span></a>
        <span className="hero-scroll-line" aria-hidden="true" />
      </div>
    </section>
  </div>;
}

const fitChoices = [
  {name: 'Slim', id: 'slim-denim', title: 'Linee pulite.\nCarattere deciso.', description: 'Vicino alla gamba, con una silhouette asciutta. Il punto di partenza per un look essenziale.', leg: 'Asciutta', volume: 'Contenuto', pairing: 'T-shirt e giacca leggera'},
  {name: 'Regular', id: 'regular-denim', title: 'Il tuo ritmo.\nOgni giorno.', description: 'Una linea regolare, facile da portare e da abbinare. Il denim che trova spazio in ogni giornata.', leg: 'Regolare', volume: 'Equilibrato', pairing: 'Camicia e sneakers'},
  {name: 'Loose', id: 'loose-denim', title: 'Più spazio.\nPiù attitudine.', description: 'Volumi ampi e un modo rilassato di vivere il denim. Lascia che siano le proporzioni a parlare.', leg: 'Ampia', volume: 'Rilassato', pairing: 'T-shirt ampia e sneakers'},
];

export function FitExplorer() {
  const [selected, setSelected] = useState('Regular');
  const sectionRef = useRef<HTMLElement>(null);
  const focusDirection = useRef<number | null>(null);
  const touch = useRef<{x: number; y: number} | null>(null);
  const index = fitChoices.findIndex(f => f.name === selected);

  useEffect(() => {
    if (focusDirection.current === null) return;
    sectionRef.current?.querySelector<HTMLButtonElement>(`[data-state="active"] [data-fit-direction="${focusDirection.current}"]`)?.focus({preventScroll: true});
    focusDirection.current = null;
  }, [selected]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // Warm only these three local photos as the guide approaches the viewport.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      for (const choice of fitChoices) {
        const photo = new Image();
        photo.src = products.find(product => product.id === choice.id)!.image;
      }
      observer.disconnect();
    }, {rootMargin: '600px'});
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function change(step: number, keepFocus = false) {
    if (keepFocus) focusDirection.current = step;
    setSelected(fitChoices[(index + step + fitChoices.length) % fitChoices.length].name);
  }
  function finishSwipe(event: TouchEvent<HTMLDivElement>) {
    if (!touch.current || event.changedTouches.length !== 1) {touch.current = null; return;}
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) change(dx < 0 ? 1 : -1);
  }

  return <section className="fit-explorer" ref={sectionRef} id="find-your-fit" aria-labelledby="fit-title">
    <div className="fit-intro">
      <div><p className="eyebrow">GUIDA AL DENIM / UOMO</p><RevealHeading id="fit-title" lines={["Il tuo denim.", "Le tue regole."]} /></div>
      <p>Stesso mondo, proporzioni diverse.<br />Scegli il fit che ti somiglia.</p>
    </div>
    <Tabs value={selected} onValueChange={setSelected} className="fit-experience" style={{"--fit-index": index} as CSSProperties}>
      <TabsList className="fit-switch" variant="line" aria-label="Scegli la vestibilità del denim uomo">
        {fitChoices.map((fit, i) => <TabsTrigger key={fit.name} value={fit.name} className="fit-switch-button"><span className="fit-switch-number">0{i + 1}</span>{fit.name}<ArrowUpRight size={20} /></TabsTrigger>)}
      </TabsList>
      <div className="fit-panels">{fitChoices.map((fit, i) => {
        const product = products.find(p => p.id === fit.id)!;
        const count = products.filter(p => p.gender === 'uomo' && p.category === 'jeans' && p.fit === fit.name).length;
        return <TabsContent forceMount value={fit.name} key={fit.name} className="fit-panel" aria-hidden={selected !== fit.name} inert={selected !== fit.name}>
          <div className="fit-visual" data-parallax="26" onTouchStart={event => {touch.current = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;}} onTouchEnd={finishSwipe} onTouchCancel={() => {touch.current = null;}}>
            <span className="fit-visual-label">THE {fit.name.toUpperCase()} FIT</span>
            <img className="fit-model" src={product.image} alt={`${product.name}: vestibilità ${fit.name.toLowerCase()} indossata, vista frontale`} width="600" height="800" loading="lazy" />
            <div className="fit-visual-bottom"><span>0{i + 1} / 03</span><span className="swipe-hint">Scorri per cambiare fit</span><div><button type="button" className="icon-button" data-fit-direction="-1" aria-label="Vestibilità precedente" onClick={() => change(-1, true)}><ArrowLeft size={20} /></button><button type="button" className="icon-button" data-fit-direction="1" aria-label="Vestibilità successiva" onClick={() => change(1, true)}><ArrowRight size={20} /></button></div></div>
          </div>
          <div className="fit-detail">
            <p className="eyebrow">IL MONDO {fit.name.toUpperCase()}</p>
            <h3>{fit.title.split('\n').map((line, n) => <span key={line}>{n > 0 && <br />}{line}</span>)}</h3>
            <p className="fit-description">{fit.description}</p>
            <dl className="fit-proportions"><div><dt>Gamba</dt><dd>{fit.leg}</dd></div><div><dt>Volume</dt><dd>{fit.volume}</dd></div><div><dt>Provalo con</dt><dd>{fit.pairing}</dd></div></dl>
            <Link className="button dark fit-cta" data-magnet href={`/catalogo?genere=uomo&categoria=jeans&fit=${fit.name}`}>Esplora i {fit.name.toLowerCase()} <span>{count} capi <ArrowUpRight size={18} /></span></Link>
            <Link className="fit-featured" href={`/prodotto/${product.id}`}><span><small>IL CAPO IN FOTO · {product.brand}</small><strong>{product.name}</strong></span><span>{euros(product.price)}<ArrowUpRight size={17} /></span></Link>
            <p className="fit-demo">Selezione e prezzi dimostrativi.</p>
          </div>
        </TabsContent>;
      })}</div>
    </Tabs>

  </section>;
}
