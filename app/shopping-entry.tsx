'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowRight,ArrowUpRight,Plus} from 'lucide-react';
import {RadioGroup as RadioGroupPrimitive} from 'radix-ui';
import {products,euros,categoryLabels} from './data';
import {lookProducts,lookTotalCents,type Look} from './looks';
import {categoryEntries,denimEntries,categoryEntryURL,outfitAnchors,outfitFromAnchor,type ShoppingGender} from './shopping-paths';

function GenderChoice({value,onChange}:{value:ShoppingGender;onChange:(g:ShoppingGender)=>void}) {
 return <RadioGroupPrimitive.Root className="shopping-gender" orientation="horizontal" value={value} onValueChange={v=>onChange(v==='donna'?'donna':'uomo')} aria-label="Seleziona uomo o donna"><RadioGroupPrimitive.Item value="uomo">Uomo</RadioGroupPrimitive.Item><RadioGroupPrimitive.Item value="donna">Donna</RadioGroupPrimitive.Item></RadioGroupPrimitive.Root>;
}

export function HeroCategories({gender='uomo',denim=false}:{gender?:ShoppingGender;denim?:boolean}) {
 const entries=denim?denimEntries[gender]:categoryEntries[gender];
 return <nav className="hero-category-links" aria-label={denim?'Scegli la vestibilità':'Vai a una categoria'}>{entries.slice(0,4).map(e=><Link key={e.id} href={categoryEntryURL(e.id,denim)}>{e.label}</Link>)}</nav>;
}

export function QuickShop({world='home'}:{world?:'home'|'uomo'|'donna'|'denim'}) {
 const [selected,setSelected]=useState<ShoppingGender>('uomo');
 const gender=world==='donna'?'donna':world==='uomo'?'uomo':selected;
 const denim=world==='denim';
 const entries=denim?denimEntries[gender]:categoryEntries[gender];
 const allURL=`/catalogo?genere=${gender}${denim?'&categoria=jeans':''}`;
 return <section className={`quick-shop page-inset ${denim?'quick-shop-denim':''}`} id="shop-categories" aria-labelledby="quick-shop-title">
  <div className="quick-shop-heading"><div><p className="eyebrow">VAI DRITTO AL TUO PROSSIMO CAPO</p><h2 id="quick-shop-title">{denim?'Che jeans cerchi?':'Cosa cerchi?'}</h2></div>{(world==='home'||denim)&&<GenderChoice value={gender} onChange={setSelected}/>}<Link className="text-link" href={allURL}>{denim?'Tutti i jeans':'Tutti i capi'} {gender}<ArrowUpRight size={18}/></Link></div>
  <nav className="quick-shop-grid" aria-label={`Categorie ${gender}`} data-count={entries.length}>
   {entries.map(e=>{const p=products.find(p=>p.id===e.id)!;const count=products.filter(q=>q.gender===gender&&q.category===p.category&&(!denim||q.fit===p.fit)).length;return <Link key={p.id} href={categoryEntryURL(p.id,denim)} className="quick-category"><div><img src={p.image} alt={`${e.label} ${gender}: ${p.name}`} width="700" height="933" loading="lazy"/><img src={p.second} alt="" width="700" height="933" loading="lazy" className="quick-category-back"/></div><span><strong>{e.label}</strong><ArrowUpRight size={17}/><small>{'detail' in e?`${e.detail} · `:''}{count} {count===1?'capo':'capi'}</small></span></Link>})}
  </nav>
 </section>;
}

export function OutfitBuilder({onOpen}:{onOpen:(look:Look)=>void}) {
 const [gender,setGender]=useState<ShoppingGender>('uomo');
 const [anchor,setAnchor]=useState(outfitAnchors.uomo[0]);
 const look=outfitFromAnchor(anchor),items=lookProducts(look),hero=products.find(p=>p.id===anchor)!;
 function changeGender(g:ShoppingGender){setGender(g);setAnchor(outfitAnchors[g][0]);}
 return <section className="outfit-builder page-inset" id="outfit-builder" aria-labelledby="outfit-builder-title">
  <div className="outfit-heading"><div><p className="eyebrow">IL LOOK PRENDE FORMA</p><h2 id="outfit-builder-title">Parti da un capo.</h2><p>Scegli il punto di partenza. Scopri come abbinarlo.</p></div><GenderChoice value={gender} onChange={changeGender}/></div>
  <div className="outfit-workspace">
   <div className="outfit-choice-panel"><p className="outfit-step-label">1. Scegli il capo</p><RadioGroupPrimitive.Root className="outfit-anchor-options" value={anchor} onValueChange={setAnchor} aria-label="Capo da cui iniziare il look">{outfitAnchors[gender].map(id=>{const p=products.find(p=>p.id===id)!;return <RadioGroupPrimitive.Item key={id} value={id} aria-label={`Parti da ${p.name}`}><img src={p.image} alt="" width="100" height="133" loading="lazy"/><span><strong>{categoryLabels[p.category]}</strong><small>{p.name}</small></span><ArrowRight size={18}/></RadioGroupPrimitive.Item>})}</RadioGroupPrimitive.Root><div className="outfit-live-copy" aria-live="polite"><p>{look.name}</p><span>{look.description}</span></div></div>
   <div className="outfit-stage" key={anchor}><p className="outfit-step-label">2. Il tuo abbinamento</p><Link className="outfit-base" href={`/prodotto/${hero.id}`}><img src={hero.image} alt={hero.name} width="700" height="933" loading="lazy"/><span><small>IL TUO PUNTO DI PARTENZA</small><strong>{hero.name}</strong><span>{euros(hero.price)}<Plus size={18}/></span></span></Link><div className="outfit-companions">{items.filter(p=>p.id!==anchor).map((p,i)=><Link key={p.id} href={`/prodotto/${p.id}`} style={{animationDelay:`${i*90+100}ms`}}><img src={p.image} alt={p.name} width="240" height="320" loading="lazy"/><span><strong>{p.name}</strong><small>{euros(p.price)}</small><Plus size={17}/></span></Link>)}</div></div>
  </div><div className="outfit-purchase"><span><small>{items.length} capi nell’abbinamento</small><strong>{euros(lookTotalCents(look)/100)}</strong></span><p>Puoi scegliere anche un solo capo.</p><button className="button dark" onClick={()=>onOpen(look)}>3. Scegli capi e taglie <ArrowRight size={18}/></button></div><p className="editorial-caption">Abbinamenti proposti · prezzi dimostrativi</p>
 </section>;
}
