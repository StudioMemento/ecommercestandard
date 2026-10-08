import Shop from '../shop';
import {storefront} from '../storefront';
export const metadata={title:`Tutti i capi | ${storefront.name}`};
export default function Page(){return <Shop initialView="catalog"/>}
