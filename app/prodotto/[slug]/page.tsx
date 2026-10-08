import Shop from '../../shop';
import {storefront} from '../../storefront';
import {products} from '../../data';
import {notFound} from 'next/navigation';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=products.find(p=>p.id===slug);return {title:p?`${p.name} — ${p.brand} | ${storefront.name}`:`Capo non trovato | ${storefront.name}`,description:p?`${p.name}: esplora la scheda dimostrativa, scegli la taglia e controlla le disponibilità di esempio per sede.`:storefront.description}}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!products.some(p=>p.id===slug))notFound();return <Shop initialView="product" productId={slug}/>}
