/**
 * Stub for the handoff package. Not part of the cambt.com source.
 *
 * On cambt.com the detail page's "How this system is delivered" section resolves each product's
 * `relatedServices` against Cambridge Technology's own service records and links to the matching
 * service page. Those records belong to Cambridge Technology and are not included here.
 *
 * As supplied, `services` is empty, so every related service keeps the title written on the product
 * record and links to "/services". Replace this file with Cambridge Marketing's own service list, or
 * remove the section from `products/[slug]/page.tsx`.
 */

export interface Service {
  slug: string;
  title: string;
}

export const services: readonly Service[] = [];

export function serviceHref(service: Service): string {
  return `/services#${service.slug}`;
}
