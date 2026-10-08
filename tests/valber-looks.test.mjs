import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const cache=new Map();
function load(name){const file=path.resolve('app',`${name}.ts`);if(cache.has(file))return cache.get(file);const module={exports:{}};const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','exports','module',output)(dep=>load(dep.replace('./','')),module.exports,module);cache.set(file,module.exports);return module.exports;}
const {products,stores,defaultLength,stockFor,totalStock,variantLabel}=load('data');
const {looks,lookProducts,lookTotalCents,relatedProducts}=load('looks');
const {checkoutQuote,restoreBag,paymentMethods}=load('checkout-model');
const {readCatalogFilters,catalogURL,filterCatalog}=load('catalog-model');
const {categoryEntries,denimEntries,categoryEntryURL,outfitAnchors,outfitFromAnchor}=load('shopping-paths');
const line=(p,size=p.sizes[0])=>({id:p.id,size,length:defaultLength(p),quantity:1});
test('Six complete outfits use real demo variants, consistent genders and correct totals',()=>{
 assert.equal(looks.length,6);assert.equal(looks.filter(l=>l.gender==='uomo').length,4);assert.equal(looks.filter(l=>l.gender==='donna').length,2);
 for(const look of looks){const items=lookProducts(look);assert.equal(items.length,look.productIds.length);assert.ok(items.length>=2);assert.ok(items.every(p=>p.gender===look.gender));assert.ok(look.productIds.includes(look.heroId));const quote=checkoutQuote(items.map(p=>line(p)),'shipping',stores[0].id);assert.equal(quote.valid,true);assert.equal(quote.subtotalCents,lookTotalCents(look));assert.equal(quote.totalCents,lookTotalCents(look)+490);}
});
test('Mixed numeric, alphabetic and waist sizing survives bag persistence',()=>{
 const ids=['jacket-woman','dress-woman','wide-denim'];const rows=ids.map(id=>line(products.find(p=>p.id===id)));assert.deepEqual(restoreBag(rows),rows);assert.equal(checkoutQuote(rows,'shipping',stores[0].id).valid,true);const jacket=products.find(p=>p.id==='jacket-woman');assert.equal(variantLabel(jacket,'36','standard'),'Taglia EU 36');assert.equal(checkoutQuote([line(jacket,'M')],'shipping',stores[0].id).valid,false);
});
test('A complete outfit pickup requires every chosen size in one store',()=>{
 const look=looks.find(l=>l.id==='city-soft');const items=lookProducts(look);let allowed=0,blocked=0;
 for(const dressSize of items[0].sizes)for(const jacketSize of items[1].sizes)for(const store of stores){const rows=[line(items[0],dressSize),line(items[1],jacketSize)];const expected=rows.every((r,i)=>stockFor(items[i],r.size,r.length,store.id)>0);const quote=checkoutQuote(rows,'pickup',store.id);assert.equal(quote.valid,expected);assert.equal(quote.shippingCents,0);expected?allowed++:blocked++;}
 assert.ok(allowed>0);assert.ok(blocked>0);
});
test('Adding overlapping looks cannot bypass the shared garment stock cap',()=>{
 const p=products.find(p=>p.id==='tee-essential');const row=line(p,'M');const cap=totalStock(p,row.size,row.length);assert.equal(checkoutQuote([{...row,quantity:cap},row],'shipping',stores[0].id).valid,false);assert.deepEqual(restoreBag([{...row,quantity:cap},row]),[{...row,quantity:cap}]);
});
test('Women assortment filters and shareable URL preserve product/size selection',()=>{
 const filters=readCatalogFilters('genere=donna&categoria=giacche&taglia=36&ordine=low');assert.deepEqual(filterCatalog(products,filters).map(p=>p.id),['jacket-woman']);assert.deepEqual(readCatalogFilters(catalogURL(filters).split('?')[1]),filters);assert.equal(filterCatalog(products,readCatalogFilters('genere=donna')).length,7);assert.equal(filterCatalog(products,readCatalogFilters('genere=uomo')).length,12);
});
test('Every product has recommendations and all displayed images exist',()=>{
 for(const p of products){assert.ok(relatedProducts(p).length>0,p.id);assert.ok(relatedProducts(p).every(q=>q.gender===p.gender&&q.id!==p.id));for(const image of [p.image,p.second,p.detailImage].filter(Boolean))assert.ok(fs.statSync(path.join('public',image)).size>0,image);}
 assert.deepEqual(paymentMethods.map(p=>p.id),['card','paypal','apple','google','bank']);
});
test('Visual category and fit entrances lead to nonempty, correctly scoped catalogs',()=>{
 for(const gender of ['uomo','donna'])for(const [entries,isFit] of [[categoryEntries[gender],false],[denimEntries[gender],true]])for(const entry of entries){
  const p=products.find(p=>p.id===entry.id);const filters=readCatalogFilters(categoryEntryURL(entry.id,isFit).split('?')[1]);const results=filterCatalog(products,filters);
  assert.ok(results.length>0,entry.id);assert.ok(results.some(q=>q.id===entry.id));assert.ok(results.every(q=>q.gender===gender&&q.category===p.category&&(!isFit||q.fit===p.fit)));
 }
});
test('Every starting garment produces a complete purchasable outfit retaining that garment',()=>{
 for(const gender of ['uomo','donna'])for(const id of outfitAnchors[gender]){
  const look=outfitFromAnchor(id);assert.equal(look.heroId,id);assert.equal(look.gender,gender);assert.ok(look.productIds.includes(id));
  const items=lookProducts(look);assert.ok(items.every(p=>p.gender===gender));const quote=checkoutQuote(items.map(p=>line(p)),'shipping',stores[0].id);assert.ok(quote.valid);assert.equal(quote.subtotalCents,lookTotalCents(look));
 }
 assert.throws(()=>outfitFromAnchor('missing'));assert.throws(()=>categoryEntryURL('missing'));
});
