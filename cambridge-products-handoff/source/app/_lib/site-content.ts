/**
 * Static content loader for the handoff package. Drop-in replacement, same signatures.
 *
 * On cambt.com these two functions read a published CMS document from PostgreSQL and merge it over
 * the committed fallback (see `site-content.cambt-reference.ts`, kept for reference; it needs
 * cambt.com's database package). Here they simply return the committed content, so the pages run
 * with no database. Point them at Cambridge Marketing's own CMS if it has one.
 */

export interface PublicSiteDocument<T> {
  data: T;
  seoDescription: string | null;
  seoTitle: string | null;
  socialImagePath: string | null;
}

export async function loadSiteDocument<T extends object>(
  _key: string,
  fallback: T,
): Promise<PublicSiteDocument<T>> {
  return { data: fallback, seoDescription: null, seoTitle: null, socialImagePath: null };
}

export async function loadEntityDocuments<T extends { slug: string }>(
  _prefix: string,
  fallbacks: readonly T[],
): Promise<T[]> {
  return [...fallbacks];
}
