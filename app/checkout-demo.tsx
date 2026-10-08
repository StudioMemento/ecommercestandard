'use client';

import {useEffect, useRef, useState, type FormEvent} from 'react';
import {ArrowLeft, ArrowRight, Check, ChevronDown, CreditCard, Landmark, LoaderCircle, MapPin, ShieldCheck, Smartphone, Truck, Wallet, X, Clock3, CircleAlert} from 'lucide-react';
import {Dialog, DialogContent, DialogTitle, DialogDescription} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {storefront} from './storefront';
import {stores, euros, variantLabel, type BagLine} from './data';
import {checkoutQuote, paymentMethods, type CheckoutQuote, type PaymentMethod} from './checkout-model';

type Profile = {first: string; last: string; email: string; street: string; city: string; postal: string};
type Receipt = {id: string; method: PaymentMethod; quote: CheckoutQuote; delivery: string; pickup: string; profile: Profile};
const demoProfile: Profile = {first: 'Cliente', last: 'Demo', email: 'cliente@example.com', street: 'Via Esempio, 10', city: 'Pordenone', postal: '33170'};
const money = (cents: number) => euros(cents / 100);

function PaymentIcon({method}: {method: PaymentMethod}) {
  return method === 'card' ? <CreditCard size={22} /> : method === 'bank' ? <Landmark size={22} /> : method === 'paypal' ? <Wallet size={22} /> : <Smartphone size={22} />;
}

function OrderSummary({quote, canEdit, onEdit}: {quote: CheckoutQuote; canEdit: boolean; onEdit: () => void}) {
  return <div className="checkout-summary-content">
    <div className="checkout-summary-heading"><h3>La tua selezione <span>({quote.count})</span></h3>{canEdit && <button type="button" onClick={onEdit}>Modifica</button>}</div>
    <div className="checkout-order-items">{quote.items.map(line => <article key={`${line.id}-${line.size}-${line.length}`}><img src={line.product.image} alt={line.product.name} width="64" height="85" /><div><small>{line.product.brand}</small><p>{line.product.name}</p><span>{variantLabel(line.product,line.size,line.length)} · Qtà {line.quantity}</span><strong>{money(line.totalCents)}</strong></div></article>)}</div>
    <dl className="checkout-totals"><div><dt>Subtotale</dt><dd>{money(quote.subtotalCents)}</dd></div><div><dt>{quote.shippingCents ? 'Spedizione demo' : 'Consegna'}</dt><dd>{quote.shippingCents ? money(quote.shippingCents) : 'Gratuita'}</dd></div><div className="checkout-grand-total"><dt>Totale demo</dt><dd>{money(quote.totalCents)}</dd></div></dl>
    <p className="checkout-summary-note">Prezzi e disponibilità dimostrativi. Nessun importo viene addebitato.</p>
  </div>;
}

export function CheckoutDemo({bag, delivery, pickup, onDeliveryChange, onPickupChange, onClose, onReturnToBag}: {
  bag: BagLine[]; delivery: string; pickup: string;
  onDeliveryChange: (value: string) => void; onPickupChange: (value: string) => void;
  onClose: () => void; onReturnToBag: () => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(demoProfile);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const quote = checkoutQuote(bag, delivery, pickup);
  const summary = receipt?.quote || quote;
  const location = stores.find(store => store.id === pickup);
  const chosen = paymentMethods.find(option => option.id === method)!;

  useEffect(() => () => {if (timer.current) clearTimeout(timer.current);}, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    headingRef.current?.focus({preventScroll: true});
  }, [step]);
  useEffect(() => {if (error) alertRef.current?.focus({preventScroll: true});}, [error]);

  function field(name: keyof Profile, label: string, options: {type?: string; pattern?: string; maxLength?: number; numeric?: boolean} = {}) {
    return <label className={`checkout-field field-${name}`}><span>{label}</span><Input name={`demo-${name}`} value={profile[name]} onChange={event => setProfile(old => ({...old, [name]: event.target.value}))} type={options.type || 'text'} required autoComplete="off" pattern={options.pattern} maxLength={options.maxLength || 120} inputMode={options.numeric ? 'numeric' : undefined} /></label>;
  }
  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote.valid) {setError(quote.error); return;}
    if (!profile.first.trim() || !profile.last.trim() || !profile.email.trim() || (delivery === 'shipping' && (!profile.street.trim() || !profile.city.trim()))) {setError('Completa i campi con i dati di fantasia della simulazione.'); return;}
    setError('');
    setStep(1);
  }
  function editDelivery() {if (!processing) {setError(''); setStep(0);}}
  function changeMethod(value: string) {
    if (!paymentMethods.some(option => option.id === value) || processing) return;
    setMethod(value as PaymentMethod);
    setError('');
  }
  function simulate(declined = false) {
    if (processing || timer.current) return;
    if (!quote.valid) {setError(quote.error); return;}
    const snapshot: Receipt = {id: `DEMO-VB-${Date.now().toString().slice(-7)}`, method, quote, delivery, pickup, profile: {...profile}};
    setError('');
    setProcessing(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setProcessing(false);
      if (declined && snapshot.method === 'card') {
        setError('Pagamento demo rifiutato. Nessun addebito effettuato. Riprova oppure scegli un altro metodo.');
        return;
      }
      setReceipt(snapshot);
      setStep(2);
    }, 1300);
  }
  function retry() {setReceipt(null); setError(''); setStep(1);}
  const alert = error || (!quote.valid && step !== 2 ? quote.error : '');

  return <Dialog open onOpenChange={open => {if (!open) onClose();}}>
    <DialogContent className="checkout-dialog" showCloseButton={false} onOpenAutoFocus={event => {event.preventDefault(); headingRef.current?.focus();}}>
      <header className="checkout-header"><div><p className="checkout-brand">{storefront.name}</p><DialogTitle>Checkout</DialogTitle></div><div className="checkout-header-right"><span className="checkout-demo-badge">SIMULAZIONE</span><button type="button" className="icon-button" onClick={onClose} aria-label="Chiudi checkout"><X size={23} /></button></div></header>
      <DialogDescription className="checkout-description">Prova l’acquisto con dati di fantasia. Nessun ordine o pagamento reale.</DialogDescription>
      <nav className="checkout-steps" aria-label="Passaggi del checkout"><ol>{['Consegna', 'Pagamento', 'Conferma'].map((label, index) => <li key={label} data-current={step === index} data-completed={step > index}><button type="button" disabled={index >= step || processing || step === 2} onClick={() => {setError(''); setStep(index);}} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={15} /> : index + 1}</span>{label}</button></li>)}</ol></nav>
      <div className="checkout-scroll" ref={scrollRef}>
        <details className="checkout-mobile-summary"><summary>Riepilogo · {quote.count} {quote.count === 1 ? 'capo' : 'capi'}<span>{money(summary.totalCents)}<ChevronDown size={17} /></span></summary><OrderSummary quote={summary} canEdit={step !== 2 && !processing} onEdit={onReturnToBag} /></details>
        <div className="checkout-layout"><div className="checkout-content">
          {step === 0 && <form onSubmit={continueToPayment} autoComplete="off" className="checkout-stage">
            <h2 tabIndex={-1} ref={headingRef}>Dove arriva il tuo look?</h2>
            <p className="checkout-lead">I dati sono già compilati per provare il percorso.</p>
            <div className="checkout-fields">{field('first', 'Nome')}{field('last', 'Cognome')}{field('email', 'Email', {type: 'email'})}</div>
            <h3 className="checkout-group-title">Come vuoi riceverlo?</h3>
            <RadioGroup className="checkout-delivery" value={delivery} onValueChange={value => {onDeliveryChange(value); setError('');}} aria-label="Modalità di consegna">
              <label className={delivery === 'shipping' ? 'selected' : ''}><RadioGroupItem value="shipping" /><Truck size={21} /><span>A domicilio<small>4,90 € · tariffa demo</small></span></label>
              <label className={delivery === 'pickup' ? 'selected' : ''}><RadioGroupItem value="pickup" /><MapPin size={21} /><span>Ritiro in negozio<small>Gratuito</small></span></label>
            </RadioGroup>
            {delivery === 'shipping' ? <div className="checkout-fields address-fields">{field('street', 'Indirizzo')}{field('city', 'Città')}{field('postal', 'CAP', {pattern: '[0-9]{5}', maxLength: 5, numeric: true})}<p className="checkout-country">Italia · consegna stimata demo: 3–5 giorni lavorativi</p></div> : <div className="checkout-pickup"><label htmlFor="checkout-store">Scegli la sede</label><Select value={pickup} onValueChange={value => {onPickupChange(value); setError('');}}><SelectTrigger id="checkout-store" className="checkout-select"><SelectValue /></SelectTrigger><SelectContent>{stores.map(store => <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>)}</SelectContent></Select>{location && <p><MapPin size={16} />{location.address}, {location.city}</p>}{quote.pickupOK && quote.valid && <p className="checkout-stock-ok"><Check size={16} />Tutti i capi disponibili qui nella simulazione.</p>}</div>}
            {alert && <div className="checkout-alert" ref={alertRef} role="alert" tabIndex={-1}><CircleAlert size={20} /><p>{alert}</p></div>}
            <div className="checkout-actionbar"><button type="submit" className="button dark checkout-primary" disabled={!quote.valid}>Continua al pagamento <ArrowRight size={19} /></button><button type="button" className="checkout-back" onClick={onReturnToBag}><ArrowLeft size={16} />Torna alla bag</button></div>
          </form>}

          {step === 1 && <div className="checkout-stage">
            <h2 tabIndex={-1} ref={headingRef}>Scegli come pagare.</h2>
            <div className="checkout-delivery-recap"><div><small>{delivery === 'shipping' ? 'SPEDIZIONE A DOMICILIO' : 'RITIRO IN NEGOZIO'}</small><p>{profile.first} {profile.last}</p><span>{delivery === 'shipping' ? `${profile.street}, ${profile.postal} ${profile.city}` : `${location?.name} · ${location?.address}`}</span></div><button type="button" disabled={processing} onClick={editDelivery}>Modifica</button></div>
            <RadioGroup value={method} onValueChange={changeMethod} disabled={processing} className="checkout-payment-methods" aria-label="Metodo di pagamento dimostrativo">{paymentMethods.map(option => <label key={option.id} className={method === option.id ? 'selected' : ''}><RadioGroupItem value={option.id} /><PaymentIcon method={option.id} /><span>{option.label}<small>{option.detail}</small></span>{option.id === 'card' && <span className="card-networks" aria-hidden="true">VISA<br />Mastercard</span>}</label>)}</RadioGroup>
            <div className="checkout-method-panel" key={method}>
              {method === 'card' ? <><div className="demo-card-top"><CreditCard size={20} /><span>Carta demo pronta all’uso</span><ShieldCheck size={18} /></div><div className="demo-card-number">•••• &nbsp; •••• &nbsp; •••• &nbsp; 4242</div><div className="demo-card-bottom"><span>CLIENTE DEMO</span><span>12/30</span></div><p>Non occorrono numeri di carta o codici di sicurezza.</p></> : method === 'paypal' ? <><p className="payment-provider paypal-provider">PayPal</p><div className="wallet-row"><span>Account demo</span><strong>cliente@example.com</strong></div><p>L’autorizzazione viene simulata qui, senza accesso a un account.</p></> : method === 'bank' ? <><div className="bank-panel-title"><Landmark size={22} /><strong>Bonifico bancario</strong></div><p>La conferma mostrerà un ordine demo in attesa di pagamento.</p><span className="bank-demo-note">Simulazione senza coordinate bancarie e senza trasferimenti.</span></> : <><p className="payment-provider">{chosen.label}</p><div className="wallet-row"><span><CreditCard size={18} />Carta demo</span><strong>•••• 4242</strong></div><div className="wallet-row"><span>Totale da simulare</span><strong>{money(quote.totalCents)}</strong></div><p>Conferma dimostrativa del wallet. Nessuna app o carta reale viene utilizzata.</p></>}
            </div>
            {alert && <div className="checkout-alert" ref={alertRef} role="alert" tabIndex={-1}><CircleAlert size={20} /><p>{alert}</p></div>}
            <div className="checkout-actionbar"><button type="button" className="button dark checkout-primary" disabled={processing || !quote.valid} aria-busy={processing} onClick={() => simulate()}>{processing ? <><span role="status">{method === 'bank' ? 'Creazione ordine demo…' : 'Autorizzazione demo…'}</span><LoaderCircle className="checkout-spinner" size={20} /></> : <><span>{method === 'bank' ? 'Simula ordine con bonifico' : method === 'card' ? 'Simula pagamento' : `Simula con ${chosen.label}`}</span><span>{money(quote.totalCents)} <ArrowRight size={18} /></span></>}</button><p className="checkout-payment-note"><ShieldCheck size={15} />Nessun addebito reale · nessun dato inviato</p>{method === 'card' && <button type="button" className="checkout-decline" disabled={processing || !quote.valid} onClick={() => simulate(true)}>Prova un pagamento rifiutato</button>}</div>
          </div>}

          {step === 2 && receipt && <div className="checkout-stage checkout-complete">
            <div className={`checkout-result-icon ${receipt.method === 'bank' ? 'pending' : ''}`}>{receipt.method === 'bank' ? <Clock3 size={33} /> : <Check size={36} />}</div>
            <p className="checkout-receipt-id">{receipt.id}</p>
            <h2 tabIndex={-1} ref={headingRef}>{receipt.method === 'bank' ? 'Ordine demo in attesa.' : 'Pagamento simulato riuscito.'}</h2>
            <p className="checkout-lead">{receipt.method === 'bank' ? 'La simulazione si conclude con un pagamento tramite bonifico ancora da ricevere.' : 'Hai completato il percorso di acquisto dimostrativo.'} Nessun ordine reale è stato creato.</p>
            <dl className="checkout-receipt"><div><dt>Stato</dt><dd className="receipt-status">{receipt.method === 'bank' ? 'In attesa · demo' : 'Approvato · demo'}</dd></div><div><dt>Metodo</dt><dd>{paymentMethods.find(option => option.id === receipt.method)?.label}</dd></div><div><dt>Totale simulato</dt><dd>{money(receipt.quote.totalCents)}</dd></div><div><dt>Consegna</dt><dd>{receipt.delivery === 'shipping' ? 'A domicilio' : stores.find(store => store.id === receipt.pickup)?.name}</dd></div></dl>
            <div className="checkout-confirmation-note"><ShieldCheck size={22} /><p>Nessun addebito, email o prenotazione. I capi restano nella bag per provare gli altri metodi.</p></div>
            <button type="button" className="button dark checkout-primary" onClick={onClose}>Torna allo shop <ArrowRight size={19} /></button><button type="button" className="checkout-back" onClick={retry}><ArrowLeft size={16} />Prova un altro metodo</button>
          </div>}
        </div><aside className="checkout-order-summary" aria-label="Riepilogo della selezione"><OrderSummary quote={summary} canEdit={step !== 2 && !processing} onEdit={onReturnToBag} /></aside></div>
      </div>
    </DialogContent>
  </Dialog>;
}
