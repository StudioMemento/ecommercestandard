'use client';
import {useEffect,useState} from 'react';

const key='valber-catalog-return';
export function useCatalogMemory(view:string,query:string,gender:string) {
  const fallback=`/catalogo?genere=${gender==='donna'?'donna':'uomo'}`;
  const [returnURL,setReturnURL]=useState(fallback);
  useEffect(()=>{
    try {const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved&&typeof saved.url==='string'&&/^\/catalogo(?:\?|$)/.test(saved.url))setReturnURL(saved.url);else setReturnURL(fallback);}catch{setReturnURL(fallback)}
  },[view,fallback]);
  useEffect(()=>{
    if(view!=='catalog')return;
    const current=`/catalogo${query?'?'+query:''}`;
    let frame=0;
    try {const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved?.restore&&saved.url===current&&Number.isFinite(saved.y)){frame=requestAnimationFrame(()=>{window.scrollTo({top:saved.y,behavior:'instant'});sessionStorage.setItem(key,JSON.stringify({...saved,restore:false}));});}}catch{}
    const remember=(event:MouseEvent)=>{const link=(event.target as Element)?.closest('a');if(!link?.getAttribute('href')?.startsWith('/prodotto/'))return;try{sessionStorage.setItem(key,JSON.stringify({url:current,y:window.scrollY,restore:true}));}catch{}};
    document.addEventListener('click',remember,true);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('click',remember,true)};
  },[view,query]);
  return returnURL;
}
