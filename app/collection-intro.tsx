import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

export function CollectionIntro({gender}:{gender:string}){return <div className="catalog-compact-intro"><div><p className="eyebrow">CATALOGO / SHOP</p><h1>{gender==='donna'?'Il guardaroba donna.':gender==='uomo'?'Il guardaroba uomo.':'Tutti i tuoi capi.'}</h1></div><Link className="text-link" href={gender==='donna'?'/donna':'/uomo'}>Ispirazioni e abbinamenti <ArrowUpRight size={17}/></Link></div>}
