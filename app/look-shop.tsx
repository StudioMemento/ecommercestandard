'use client';

import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,ArrowRight,Check,MapPin,Plus,X} from 'lucide-react';
import {Sheet,SheetContent,SheetTitle,SheetDescription,SheetClose} from '@/components/ui/sheet';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
import {Checkbox} from '@/components/ui/checkbox';
import {products,stores,euros,defaultLength,stockFor,totalStock,sizeLabel,type BagLine} from './data';
import {lookProducts,lookTotalCents,type Look} from './looks';

export function LookCard({look,index=0,onOpen}:{look:Look;index?:number;onOpen:(look:Look)=>void}) {
  const items=lookProducts(look),hero=products.find(p=>p.id===look.heroId)||items[0];
  if (!hero) return null;
  return <article className={`look-card look-tone-${look.tone}`} data-reveal="fade">
    <button className="look-board" onClick={()=>onOpen(look)} aria-label={`Componi ${look.name}`}>
      <div className="look-portrait"><img src={hero.image} alt={`${hero.name}, capo principale dell’abbinamento ${look.name}`} width="700" height="933" loading="lazy"/></div>
      <span className="look-number">0{index+1} / IL TUO LOOK</span>
      <span className="look-miniatures">{items.filter(p=>p.id!==hero.id).slice(0,2).map(p=><span key={p.id}><img src={p.image} alt={p.name} width="90" height="120" loading="lazy"/></span>)}</span>
      <span className="look-open"><Plus size={18}/><span>Componi il look</span></span>
    </button>
    <div className="look-card-caption"><div><p>{look.occasion}</p><button onClick={()=>onOpen(look)}>{look.name}<ArrowUpRight size={20}/></button></div><span>{items.length} capi<small>{euros(lookTotalCents(look)/100)}</small></span></div>
  </article>;
}

export function LookShelf({items,title,eyebrow,onOpen,compact=false}:{items:Look[];title:string;eyebrow:string;onOpen:(look:Look)=>void;compact?:boolean}) {
  return <section className={`look-shelf ${compact?'look-shelf-compact':''}`} id={compact?'collection-looks':'shop-looks'} aria-label={title}>
    <div className="look-shelf-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>Scegli un abbinamento.<br/>Fallo tuo, un capo alla volta.</p></div>
    <div className="look-grid">{items.map((look,index)=><LookCard key={look.id} look={look} index={index} onOpen={onOpen}/>)}</div>
    <p className="look-disclaimer">Proposte di abbinamento dimostrative · prezzi di esempio · gli articoli selezionabili sono elencati in ogni look.</p>
  </section>;
}

type Selection={included:boolean;size:string;length:string};
export function LookShop({look,onClose,onAdd}:{look:Look;onClose:()=>void;onAdd:(lines:BagLine[],storeId:string)=>string|null}) {
  const items=lookProducts(look);
  const [selection,setSelection]=useState<Record<string,Selection>>(()=>Object.fromEntries(items.map(p=>[p.id,{included:true,size:'',length:defaultLength(p)}])));
  const [storeId,setStoreId]=useState('all');
  const [error,setError]=useState('');
  const chosen=items.filter(p=>selection[p.id]?.included);
  const total=chosen.reduce((sum,p)=>sum+Math.round(p.price*100),0);
  const complete=chosen.length>0&&chosen.every(p=>!!selection[p.id].size);
  const eligibleStores=useMemo(()=>complete?stores.filter(store=>chosen.every(p=>stockFor(p,selection[p.id].size,selection[p.id].length,store.id)>0)):[],[complete,chosen,selection]);
  function update(id:string,patch:Partial<Selection>) {setSelection(old=>({...old,[id]:{...old[id],...patch}}));setError('');}
  function add() {
    if (!chosen.length) {setError('Seleziona almeno un capo.');return;}
    if (!complete) {setError('Scegli la taglia per ogni capo selezionato.');return;}
    if (storeId!=='all'&&!eligibleStores.some(s=>s.id===storeId)) {setError('I capi selezionati non sono tutti disponibili in questa sede. Cambia negozio o scegli la spedizione.');return;}
    const issue=onAdd(chosen.map(p=>({id:p.id,size:selection[p.id].size,length:selection[p.id].length,quantity:1})),storeId);
    if(issue)setError(issue);
  }
  return <Sheet open onOpenChange={open=>{if(!open)onClose()}}><SheetContent className="look-shop-sheet" showCloseButton={false}>
    <div className="look-shop-header"><div><p className="eyebrow">IL TUO LOOK / {look.gender.toUpperCase()}</p><SheetTitle>{look.name}</SheetTitle></div><SheetClose className="icon-button" aria-label="Chiudi il look"><X/></SheetClose></div>
    <SheetDescription className="look-shop-description">{look.description}</SheetDescription>
    <div className="look-shop-scroll"><p className="look-styling-note">{look.advice}</p>
      <div className="look-shop-items">{items.map(p=>{const s=selection[p.id];return <article key={p.id} className={s.included?'included':'excluded'}>
        <img src={p.image} alt={p.name} width="110" height="147"/>
        <div className="look-item-choice"><label className="look-item-title"><Checkbox checked={s.included} onCheckedChange={checked=>update(p.id,{included:checked===true})}/><span><small>{p.brand}</small>{p.name}</span><strong>{euros(p.price)}</strong></label>
          {s.included&&<div className="look-variant-fields"><Select value={s.size} onValueChange={size=>update(p.id,{size})}><SelectTrigger aria-label={`Taglia ${p.name}`}><SelectValue placeholder={p.sizeSystem==='waist'?'Taglia vita (W)':'Scegli la taglia'}/></SelectTrigger><SelectContent>{p.sizes.map(size=><SelectItem key={size} value={size} disabled={totalStock(p,size,s.length)===0}>{sizeLabel(p,size)}</SelectItem>)}</SelectContent></Select>
          {p.sizeSystem==='waist'&&<Select value={s.length} onValueChange={length=>update(p.id,{length})}><SelectTrigger aria-label={`Lunghezza ${p.name}`}><SelectValue/></SelectTrigger><SelectContent>{p.lengths.map(length=><SelectItem key={length} value={length}>L{length}</SelectItem>)}</SelectContent></Select>}</div>}
          <Link className="look-product-link" href={`/prodotto/${p.id}`} onClick={onClose}>Dettagli del capo <ArrowUpRight size={13}/></Link>
        </div>
      </article>})}</div>
      <div className="look-store-check"><label><MapPin size={16}/>Dove vuoi riceverlo?</label><Select value={storeId} onValueChange={v=>{setStoreId(v);setError('')}}><SelectTrigger aria-label="Consegna del look"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">Spedizione a casa</SelectItem>{stores.map(s=><SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
      <p aria-live="polite">{!complete?'Scegli le taglie per controllare il ritiro in negozio.':storeId==='all'?eligibleStores.length?`Ritiro disponibile anche in ${eligibleStores.length} sedi.`:'Questo abbinamento è disponibile con spedizione.':eligibleStores.some(s=>s.id===storeId)?<><Check size={15}/>Tutti i capi selezionati sono disponibili qui.</>:'Uno o più capi non sono disponibili in questa sede.'}</p></div>
    </div>
    <div className="look-shop-footer">{error&&<p className="error-text" role="alert">{error}</p>}<div><span>{chosen.length} {chosen.length===1?'capo selezionato':'capi selezionati'}</span><strong>{euros(total/100)}</strong></div><button className="button dark" onClick={add}>Aggiungi alla bag <ArrowRight size={18}/></button><p>Prezzi e stock demo · spedizione calcolata nella bag</p></div>
  </SheetContent></Sheet>;
}
