import {products, stores, stockFor, totalStock, type BagLine, type Product} from './data';

export type PaymentMethod = 'card' | 'paypal' | 'apple' | 'google' | 'bank';
export const paymentMethods: {id: PaymentMethod; label: string; detail: string}[] = [
  {id: 'card', label: 'Carta di credito o debito', detail: 'Visa · Mastercard'},
  {id: 'paypal', label: 'PayPal', detail: 'Account dimostrativo'},
  {id: 'apple', label: 'Apple Pay', detail: 'Wallet dimostrativo'},
  {id: 'google', label: 'Google Pay', detail: 'Wallet dimostrativo'},
  {id: 'bank', label: 'Bonifico bancario', detail: 'Conferma con pagamento in attesa'},
];
export type CheckoutItem = BagLine & {product: Product; totalCents: number};

/** Restore only known variants; merge duplicates and cap stale session quantities. */
export function restoreBag(raw:unknown):BagLine[] {
  if (!Array.isArray(raw)) return [];
  const variants = new Map<string,BagLine>();
  for (const value of raw) {
    if (!value || typeof value!=='object') continue;
    const line=value as BagLine;
    const product=products.find(p=>p.id===line.id);
    if (!product || !product.sizes.includes(line.size) || !product.lengths.includes(line.length) || !Number.isSafeInteger(line.quantity) || line.quantity<1) continue;
    const cap=totalStock(product,line.size,line.length);
    if (!cap) continue;
    const key=`${line.id}:${line.size}:${line.length}`;
    variants.set(key,{id:line.id,size:line.size,length:line.length,quantity:Math.min(cap,(variants.get(key)?.quantity||0)+line.quantity)});
  }
  return [...variants.values()];
}

/** Quote in integer cents; duplicate variant lines share the same stock cap. */
export function checkoutQuote(bag: BagLine[], delivery: string, pickup: string) {
  const variants = new Map<string, CheckoutItem>();
  let validLines = true;
  for (const line of bag) {
    const product = products.find(p => p.id === line.id);
    if (!product || !product.sizes.includes(line.size) || !product.lengths.includes(line.length) || !Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      validLines = false;
      continue;
    }
    const key = `${line.id}:${line.size}:${line.length}`;
    const quantity = (variants.get(key)?.quantity || 0) + line.quantity;
    variants.set(key, {...line, quantity, product, totalCents: Math.round(product.price * 100) * quantity});
  }
  const items = [...variants.values()];
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = items.reduce((sum, line) => sum + line.totalCents, 0);
  const shippingCents = delivery === 'shipping' && count ? 490 : 0;
  const stockOK = items.every(line => line.quantity <= totalStock(line.product, line.size, line.length));
  const pickupOK = stores.some(store => store.id === pickup) && items.every(line => line.quantity <= stockFor(line.product, line.size, line.length, pickup));
  const error = !count ? 'La bag è vuota.' : !validLines || !stockOK ? 'Controlla taglie e quantità nella bag prima di continuare.' : !['shipping', 'pickup'].includes(delivery) ? 'Scegli una modalità di consegna.' : delivery === 'pickup' && !pickupOK ? 'Questa sede non dispone di tutti i capi nelle quantità scelte. Cambia negozio o scegli la spedizione.' : '';
  return {items, count, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents, pickupOK, error, valid: !error};
}

export type CheckoutQuote = ReturnType<typeof checkoutQuote>;
