import Shop from '../shop';
import {storefront} from '../storefront';
export const metadata={title:`Abbigliamento uomo | ${storefront.name}`};
export default function Page(){return <Shop initialView="uomo"/>}
