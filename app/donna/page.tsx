import Shop from '../shop';
import {storefront} from '../storefront';
export const metadata={title:`Abbigliamento donna | ${storefront.name}`};
export default function Page(){return <Shop initialView="donna"/>}
