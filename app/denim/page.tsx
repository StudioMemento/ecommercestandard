import Shop from '../shop';
import {storefront} from '../storefront';
export const metadata={title:`Jeans e guida alle vestibilità | ${storefront.name}`};
export default function Page(){return <Shop initialView="denim"/>}
