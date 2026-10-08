'use client';
import {useEffect,useRef} from 'react';
import {Plus,ArrowUpRight} from 'lucide-react';
import {products,euros} from './data';
import {looks,type Look} from './looks';

export function LookJourney({onOpen}:{onOpen:(look:Look)=>void}) {
  const section=useRef<HTMLElement>(null);
  const look=looks[0],shirt=products.find(p=>p.id==='shirt-caiden')!,tee=products.find(p=>p.id==='tee-essential')!,denim=products.find(p=>p.id==='regular-denim')!;
  useEffect(()=>{
    const node=section.current;if(!node)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
    const render=()=>{frame=0;const box=node.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.9-box.top)/(Math.max(1,innerHeight*.65))));node.style.setProperty('--look-reveal',String(progress));};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(render)};
    const observer=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){addEventListener('scroll',schedule,{passive:true});schedule()}else removeEventListener('scroll',schedule)},{rootMargin:'100px'});observer.observe(node);addEventListener('resize',schedule);reduced.addEventListener('change',schedule);render();
    return()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule)};
  },[]);
  return <section className="look-journey" ref={section} aria-labelledby="journey-title">
    <div className="journey-copy"><p className="eyebrow">DENTRO L’ABBINAMENTO / 01</p><h2 id="journey-title">Tre capi.<br/>Il tuo modo<br/>di portarli.</h2><p>Camicia verde, T-shirt bianca, denim scuro. Insieme, o da abbinare a quello che hai già.</p><button className="button dark" onClick={()=>onOpen(look)}>Componi City layers <ArrowUpRight size={18}/></button><small>Proposta di abbinamento · prezzi e disponibilità demo</small></div>
    <div className="journey-board"><div className="journey-main"><img src={shirt.image} alt="Camicia CAIDEN verde indossata" width="700" height="933" loading="lazy"/><span>01 / CAIDEN</span></div>{[tee,denim].map((p,i)=><button className={`journey-piece journey-piece-${i}`} key={p.id} onClick={()=>onOpen(look)} aria-label={`Aggiungi ${p.name} all’abbinamento`}><img src={p.image} alt={p.name} width="240" height="320" loading="lazy"/><span><small>0{i+2} / {p.name}</small><strong>{euros(p.price)}</strong><Plus size={18}/></span></button>)}</div>
  </section>;
}
