import {categoryLabels, colorLabels, matchesStock, type Product} from './data';

export type CatalogFilters = {gender:string;category:string;fit:string;brand:string;color:string;filterSize:string;storeFilter:string;sort:string;under45:boolean;catalogSearch:string};
export const defaultFilters:CatalogFilters = {gender:'uomo',category:'all',fit:'all',brand:'all',color:'all',filterSize:'all',storeFilter:'all',sort:'featured',under45:false,catalogSearch:''};
const keys:Record<keyof CatalogFilters,string> = {gender:'genere',category:'categoria',fit:'fit',brand:'brand',color:'colore',filterSize:'taglia',storeFilter:'sede',sort:'ordine',under45:'prezzo',catalogSearch:'q'};
export function readCatalogFilters(query:string):CatalogFilters {
  const params = new URLSearchParams(query);
  const values = {...defaultFilters};
  for (const key of Object.keys(keys) as (keyof CatalogFilters)[]) {
    if (key === 'under45') values.under45 = params.get(keys[key]) === '45';
    else values[key] = params.get(keys[key]) || defaultFilters[key];
  }
  if (!['all','uomo','donna'].includes(values.gender)) values.gender = 'uomo';
  if (values.category !== 'all' && !(values.category in categoryLabels)) values.category = 'all';
  if (values.color !== 'all' && !(values.color in colorLabels)) values.color = 'all';
  return values;
}
export function catalogURL(filters:CatalogFilters) {
  const params = new URLSearchParams();
  for (const key of Object.keys(keys) as (keyof CatalogFilters)[]) {
    if (filters[key] === defaultFilters[key]) continue;
    if (key === 'under45') { if (filters.under45) params.set(keys[key], '45'); }
    else if (filters[key]) params.set(keys[key], filters[key]);
  }
  const query = params.toString();
  return `/catalogo${query ? `?${query}` : ''}`;
}
const normalize = (text:string) => text.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export function matchesSearch(product:Product, search:string) {
  const text = normalize(`${product.name} ${product.brand} ${product.gender} ${product.fit} ${product.color} ${colorLabels[product.colorFamily]} ${product.category} ${categoryLabels[product.category]}`);
  return normalize(search).trim().split(/\s+/).every(word => text.includes(word));
}
export function filterCatalog(products:Product[], filters:CatalogFilters) {
  const f=filters;
  return products.filter(p => (f.gender==='all'||p.gender===f.gender) && (f.category==='all'||p.category===f.category) && (f.fit==='all'||p.fit===f.fit) && (f.brand==='all'||p.brand===f.brand) && (f.color==='all'||p.colorFamily===f.color) && (!f.under45||p.price<45) && matchesStock(p,f.filterSize,f.storeFilter) && matchesSearch(p,f.catalogSearch))
    .sort((a,b) => f.sort==='low'?a.price-b.price:f.sort==='high'?b.price-a.price:0);
}
