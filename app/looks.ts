import {products,type Product} from './data';

export type Look={id:string;name:string;gender:'uomo'|'donna';occasion:string;description:string;advice:string;heroId:string;productIds:string[];tone:string};
export const looks:Look[]=[
  {id:'city-layers',name:'City layers',gender:'uomo',occasion:'IN GIRO, OGNI GIORNO',description:'Una camicia aperta. Il bianco sotto. Il denim che lega tutto.',advice:'Porta la camicia aperta sulla T-shirt: il contrasto mette in evidenza gli strati.',heroId:'shirt-caiden',productIds:['shirt-caiden','tee-essential','regular-denim'],tone:'olive'},
  {id:'after-hours',name:'After hours',gender:'uomo',occasion:'QUANDO LA GIORNATA CONTINUA',description:'Giacca racer, T-shirt bianca e denim nero. Pochi elementi, carattere deciso.',advice:'Lascia la giacca aperta e la T-shirt fuori dai jeans per una linea più rilassata.',heroId:'jacket-everyday',productIds:['jacket-everyday','tee-essential','slim-denim'],tone:'ink'},
  {id:'slow-weekend',name:'Slow weekend',gender:'uomo',occasion:'IL TUO TEMPO LIBERO',description:'Felpa navy e denim ampio. Spazio per muoverti, a modo tuo.',advice:'La T-shirt è lo strato di base; la felpa completa i volumi del jeans loose.',heroId:'loose-denim',productIds:['hoodie-ceres','tee-essential','loose-denim'],tone:'blue'},
  {id:'clean-lines',name:'Clean lines',gender:'uomo',occasion:'CASUAL, CON CURA',description:'Una polo essenziale e un denim slim. Un abbinamento da riprendere ogni giorno.',advice:'La linea della polo accompagna il denim slim senza aggiungere troppo volume.',heroId:'polo-austin',productIds:['polo-austin','glenn-slim'],tone:'stone'},
  {id:'denim-days',name:'Denim days',gender:'donna',occasion:'DA MATTINA A SERA',description:'Un top, un cardigan e il denim ampio. Tre capi da reinterpretare.',advice:'Apri il cardigan per lasciare visibile il top e dare respiro alle proporzioni.',heroId:'top-woman',productIds:['top-woman','knit-woman','wide-denim'],tone:'light'},
  {id:'city-soft',name:'City soft',gender:'donna',occasion:'CAMBIA IL TUO RITMO',description:'Un abito e una giacca leggera. Un cambio di strato per un’altra occasione.',advice:'La giacca aggiunge struttura all’abito: provali insieme e poi separatamente.',heroId:'dress-woman',productIds:['dress-woman','jacket-woman'],tone:'sand'},
];
export const lookProducts=(look:Look):Product[]=>look.productIds.map(id=>products.find(p=>p.id===id)!).filter(Boolean);
export const lookTotalCents=(look:Look)=>lookProducts(look).reduce((sum,p)=>sum+Math.round(p.price*100),0);
export function relatedProducts(product:Product) {
  const fallback:Record<string,string[]>={'alex-baggy':['hoodie-ceres','tee-essential','knit-eric'],'liam-skinny':['jacket-everyday','tee-essential','shirt-caiden'],'knit-eric':['regular-denim','tee-essential','jacket-everyday'],'straight-denim':['top-woman','knit-woman','jacket-woman'],'classic-straight':['top-woman','knit-woman','jacket-woman']};
  const ids=[...new Set(looks.filter(look=>look.productIds.includes(product.id)).flatMap(look=>look.productIds).concat(fallback[product.id]||[]))];
  return ids.filter(id=>id!==product.id).map(id=>products.find(p=>p.id===id)!).filter(Boolean).slice(0,3);
}
