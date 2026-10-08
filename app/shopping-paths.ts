import {products} from './data';
import {looks,type Look} from './looks';
export type ShoppingGender='uomo'|'donna';
export const categoryEntries={
  uomo:[{id:'tee-essential',label:'T-shirt'},{id:'shirt-caiden',label:'Camicie'},{id:'hoodie-ceres',label:'Felpe'},{id:'jacket-everyday',label:'Giacche'},{id:'regular-denim',label:'Jeans'}],
  donna:[{id:'top-woman',label:'T-shirt'},{id:'knit-woman',label:'Maglieria'},{id:'jacket-woman',label:'Giacche'},{id:'dress-woman',label:'Abiti'},{id:'wide-denim',label:'Jeans'}],
};
export const denimEntries={
  uomo:[{id:'slim-denim',label:'Slim',detail:'Linea asciutta'},{id:'regular-denim',label:'Regular',detail:'Linea regolare'},{id:'loose-denim',label:'Loose',detail:'Volumi ampi'}],
  donna:[{id:'straight-denim',label:'Straight',detail:'Gamba dritta'},{id:'wide-denim',label:'Wide',detail:'Gamba ampia'}],
};
export const outfitAnchors={uomo:['shirt-caiden','jacket-everyday','hoodie-ceres','polo-austin'],donna:['top-woman','dress-woman']};
export function categoryEntryURL(id:string,fit=false) {
  const p=products.find(p=>p.id===id);if(!p)throw new Error(`Unknown category anchor ${id}`);
  const query=new URLSearchParams({genere:p.gender,categoria:p.category});
  if(fit)query.set('fit',p.fit);
  return `/catalogo?${query}`;
}
export function outfitFromAnchor(id:string):Look {
  const look=looks.find(l=>l.productIds.includes(id));
  if(!look)throw new Error(`No outfit for ${id}`);
  return {...look,heroId:id};
}
