import { Breadcrumb } from "@cambt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findProduct, products } from "../../_content/products";
import { productsIndexContent } from "../../_content/products-page-content";
import { productScreens } from "../../_content/product-screens";
import { ScreenStack } from "./screen-stack";
import { breadcrumbSchema, createPageMetadata, JsonLd } from "../../../_lib/seo";
import { loadEntityDocuments, loadSiteDocument } from "../../../_lib/site-content";
import { serviceHref, services } from "../../_content/services";
import shell from "../../_styles/editorial.module.css";
import styles from "./product-detail.module.css";

/**
 * Revision Phase D reference product detail page.
 *
 * This is where a product's modules, features, interface, and integrations belong. Service
 * pages link here rather than restating any of it, which is the ownership boundary the
 * revision directive sets.
 *
 * NOVA ERP's name is owner-confirmed; nothing else about it is. Every unverified section
 * renders an explicit red marker rather than plausible filler, and no interface capture is
 * fabricated. The structure is complete and will populate as real content arrives.
 */

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/* Only listed slugs are valid routes; anything else 404s rather than rendering. */
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const fallback = findProduct(slug);
  if (!fallback) return {};
  const product = await loadSiteDocument(`entity.product.${slug}`, fallback);
  return createPageMetadata({
    title: product.seoTitle ?? fallback.name,
    description: product.seoDescription ?? fallback.lead ?? fallback.positioning,
    path: `/products/${fallback.slug}`,
    image: product.socialImagePath,
  });
}

/** Renders a section's content, or a red marker naming exactly what is outstanding. */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const fallback = findProduct(slug);
  if (!fallback) notFound();
  const [{ data: product }, { data: pageContent }, serviceRecords] = await Promise.all([
    loadSiteDocument(`entity.product.${slug}`, fallback),
    loadSiteDocument("page.products", productsIndexContent),
    loadEntityDocuments("entity.service", services),
  ]);
  const screens = productScreens[slug] ?? [];
  /* Six or more captures earns the full sales page. Fewer gets the lean one, which is honest
     about how much there is to show rather than padding a thin system out to look like a thick
     one. */
  const full = product.depth === "full";
  /*
   * Which optional sections have anything to say. A section with nothing in it is not rendered at
   * all, rather than printed with a note explaining its own emptiness. Omitting an empty section is
   * not the same as inventing a value, so the no-fabrication rule still holds; what is missing per
   * system is tracked in docs/products-checklist.md, where the owner reviews it, rather than shown
   * to a client.
   */
  const showContext =
    Boolean(product.suits) || product.industries.length > 0 || product.integrations.length > 0;
  const themed = product.screenKind === "theme";

  const relatedServices = product.relatedServices.map((relationship) => {
    const record = serviceRecords.find((service) => service.slug === relationship.slug);
    return {
      ...relationship,
      title: record?.title ?? relationship.title,
      /*
       * Services lost their own pages on 2026-09-10, so a relationship now resolves to the
       * capability on a category page that covers it. A relationship naming a slug that is no
       * longer a canonical record has nowhere specific to go, so it lands on the Services hub
       * rather than on a fabricated anchor.
       */
      href: record ? serviceHref(record) : "/services",
    };
  });

  return (
    <main className={shell.main} id="main-content">
      <JsonLd
        data={breadcrumbSchema([
          { name: pageContent.detail.breadcrumbHome, path: "/" },
          { name: pageContent.detail.breadcrumbIndex, path: "/products" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />

      <section className={shell.hero}>
        <div aria-hidden="true" className={shell.heroSignal} />
        <div className={shell.heroInner}>
          <Breadcrumb
            items={[
              { href: "/", label: pageContent.detail.breadcrumbHome },
              { href: "/products", label: pageContent.detail.breadcrumbIndex },
              { label: product.name },
            ]}
          />
          <div className={shell.heroGrid}>
            <div>
              <span className={shell.label}>{product.category}</span>
              <h1>{product.name}</h1>
            </div>
            <div>
              <p className={shell.heroLead}>{product.lead ?? product.positioning}</p>
              <div className={shell.heroActions}>
                {product.demoUrl ? (
                  <a className={shell.primaryAction} href={product.demoUrl}>
                    {pageContent.detail.demoLabel}
                  </a>
                ) : (
                  <Link className={shell.primaryAction} href="/contact">
                    {pageContent.detail.requestDemoLabel}
                  </Link>
                )}
                {product.documentationUrl ? (
                  <a className={shell.secondaryAction} href={product.documentationUrl}>
                    {pageContent.detail.documentationLabel}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        Screens before words. A client sees the system running before they read a claim about it,
        and the copy below then answers the questions the screens have already raised.
      */}
      {screens.length > 0 ? (
        <section className={`${shell.section} ${shell.sectionWhite}`} id="interface">
          <div className={shell.inner}>
            <div className={shell.sectionHead}>
              {/*
              CAMBCARD shows themes rather than an admin interface: what the recipient opens, not
              what an operator drives. Calling that "the system in use" would misdescribe it.
            */}
              <span className={shell.label}>
                {themed
                  ? pageContent.detail.sections.interface.themeLabel
                  : pageContent.detail.sections.interface.label}
              </span>
              <h2>
                {themed
                  ? pageContent.detail.sections.interface.themeHeading
                  : pageContent.detail.sections.interface.heading}
              </h2>
              <p>
                {themed
                  ? pageContent.detail.sections.interface.themeNote
                  : product.evidence === "illustration"
                    ? pageContent.detail.sections.interface.illustrationNote
                    : pageContent.detail.sections.interface.captureNote}
              </p>
            </div>
            <ScreenStack
              captionPrefix={product.name}
              galleryLabel={`${product.name}: themes`}
              screens={screens}
            />
          </div>
        </section>
      ) : null}

      {full && product.solves.length > 0 ? (
        <section className={shell.section} id="solves">
          <div className={shell.inner}>
            <div className={shell.sectionHead}>
              <span className={shell.label}>{pageContent.detail.sections.solves.label}</span>
              <h2>{pageContent.detail.sections.solves.heading}</h2>
            </div>
            <ol className={styles.solves}>
              {product.solves.map((item) => (
                <li key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {product.modules.length > 0 ? (
        <section className={`${shell.section} ${shell.sectionWhite}`} id="modules">
          <div className={shell.inner}>
            <div className={shell.sectionHead}>
              <span className={shell.label}>{pageContent.detail.sections.modules.label}</span>
              <h2>{pageContent.detail.sections.modules.heading}</h2>
              <p>{pageContent.detail.sections.modules.body}</p>
            </div>
            <ul className={styles.modules}>
              {product.modules.map((module) => (
                <li key={module.name}>
                  <h3>{module.name}</h3>
                  {/*
                  A module the source named without describing renders as a name alone. Writing a
                  description to fill the gap would be inventing a capability.
                */}
                  {module.body ? <p>{module.body}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {full && product.replaces.length > 0 ? (
        <section className={shell.section} id="replaces">
          <div className={shell.inner}>
            <div className={shell.sectionHead}>
              <span className={shell.label}>{pageContent.detail.sections.replaces.label}</span>
              <h2>{pageContent.detail.sections.replaces.heading}</h2>
            </div>
            <ul className={styles.replaces}>
              {product.replaces.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {full && product.adapts.length > 0 ? (
        <section className={`${shell.section} ${shell.sectionMuted}`} id="adapts">
          <div className={shell.inner}>
            <div className={shell.sectionHead}>
              <span className={shell.label}>{pageContent.detail.sections.adapts.label}</span>
              <h2>{pageContent.detail.sections.adapts.heading}</h2>
              <p>{pageContent.detail.sections.adapts.body}</p>
            </div>
            <ul className={styles.adapts}>
              {product.adapts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {showContext ? (
        <section className={`${shell.section} ${shell.sectionPale}`} id="context">
          <div className={shell.inner}>
            <div className={styles.contextGrid}>
              {product.suits ? (
                <div>
                  <span className={shell.label}>{pageContent.detail.sections.suits.label}</span>
                  <p className={styles.suits}>{product.suits}</p>
                </div>
              ) : null}
              {product.industries.length > 0 ? (
                <div>
                  <span className={shell.label}>{pageContent.detail.sections.industriesLabel}</span>
                  <ul className={styles.chips}>
                    {product.industries.map((industry) => (
                      <li key={industry}>{industry}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {product.integrations.length > 0 ? (
                <div>
                  <span className={shell.label}>
                    {pageContent.detail.sections.integrationsLabel}
                  </span>
                  <ul className={styles.chips}>
                    {product.integrations.map((integration) => (
                      <li key={integration}>{integration}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${shell.section} ${shell.sectionWhite}`} id="services">
        <div className={shell.inner}>
          <div className={shell.sectionHead}>
            <span className={shell.label}>{pageContent.detail.sections.services.label}</span>
            <h2>{pageContent.detail.sections.services.heading}</h2>
            <p>{pageContent.detail.sections.services.body}</p>
          </div>
          <ul className={styles.services}>
            {relatedServices.map((service) => (
              <li key={service.slug}>
                <h3>
                  <Link className={styles.serviceLink} href={service.href}>
                    {service.title}
                  </Link>
                </h3>
                <p>{service.relationship}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={shell.cta}>
        <div className={shell.ctaInner}>
          <h2>{pageContent.detail.contact.heading}</h2>
          <div className={shell.ctaBody}>
            <p>{pageContent.detail.contact.body}</p>
            <Link className={shell.ctaAction} href={pageContent.detail.contact.action.href}>
              {pageContent.detail.contact.action.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
