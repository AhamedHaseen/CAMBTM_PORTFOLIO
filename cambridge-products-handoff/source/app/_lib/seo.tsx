import type { Metadata } from "next";

export const siteUrl = "https://cambt.com";

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
  image,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string | null;
}): Metadata {
  const url = new URL(path, siteUrl).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: "Cambridge Technology",
      title,
      description,
      url,
      ...(image ? { images: [{ url: new URL(image, siteUrl).toString() }] } : {}),
    },
    robots: { index, follow: index },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}

/**
 * A named list of capabilities, as structured data.
 *
 * `ItemList` of `Service` rather than a single `Service` with an `OfferCatalog`, because these are
 * genuinely separate things a client can ask for and not variants of one offering. Each entry is a
 * `Service` with `provider` set, which is what lets a search engine attribute the capability to
 * CAMBT rather than treating it as a loose phrase on a page.
 *
 * Deliberately no `offers` and no price. The owner's instruction is that no price appears anywhere
 * on the site, and emitting an empty or invented `Offer` to satisfy a schema validator would be a
 * claim about cost.
 */
export function capabilityListSchema({
  name,
  items,
  path,
}: {
  name: string;
  items: Array<{ name: string; description: string }>;
  path: string;
}) {
  const url = new URL(path, siteUrl).toString();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: item.name,
        description: item.description,
        provider: { "@type": "Organization", name: "Cambridge Technology", url: siteUrl },
      },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}
