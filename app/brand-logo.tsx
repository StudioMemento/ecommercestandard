import {storefront} from './storefront';
export function BrandLogo({decorative=false}:{decorative?:boolean}) {
  return <img src={storefront.logo} alt={decorative?'':storefront.name} width={storefront.logoWidth} height={storefront.logoHeight}/>;
}
