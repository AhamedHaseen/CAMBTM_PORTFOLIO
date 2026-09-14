import { Breadcrumb } from "@cambt/ui";
import type { Metadata } from "next";
import Link from "next/link";
import { productScreens } from "../_content/product-screens";
import { products } from "../_content/products";
import { breadcrumbSchema, createPageMetadata, JsonLd } from "../../_lib/seo";
import shell from "../_styles/editorial.module.css";
import { AdaptationArgument } from "./adaptation-argument";
import { FittedField } from "./fitted-field";
import { MarkedHeading } from "./marked-heading";
import { SystemIndex } from "./system-index";
import { SystemWall } from "./system-wall";
import styles from "./products.module.css";
import { EmphasizedText } from "../../_components/emphasized-text";
import { loadEntityDocuments, loadSiteDocument } from "../../_lib/site-content";
import { productsIndexContent } from "../_content/products-page-content";

/**
 * The systems index.
 *
 * The page argues in one order: here is what we have built, here is why ours fits and a generic one
 * does not, here is what fitting means in practice, and here they all are. Evidence first, argument
 * second, catalogue third. The previous version had this backwards, leading with four products that
 * had no screenshots and burying eight that did.
 *
 * The hero, the argument and the customisation section are the page's three set pieces, and only
 * one of them ships client JavaScript.
 */

export async function generateMetadata(): Promise<Metadata> {
  const document = await loadSiteDocument("page.products", productsIndexContent);
  return createPageMetadata({
    title: document.seoTitle ?? "Systems",
    description:
      document.seoDescription ??
      "Working systems Cambridge Technology builds, deploys and fits to how a business actually trades.",
    path: "/products",
    image: document.socialImagePath,
  });
}

export default async function ProductsPage() {
  const [{ data: content }, productRecords] = await Promise.all([
    loadSiteDocument("page.products", productsIndexContent),
    loadEntityDocuments("entity.product", products),
  ]);

  const industries = [...new Set(productRecords.flatMap((product) => product.industries))].sort();

  return (
    <main className={shell.main} id="main-content">
      <JsonLd
        data={breadcrumbSchema([
          { name: content.breadcrumb.home, path: "/" },
          { name: content.breadcrumb.current, path: "/products" },
        ])}
      />

      <section className={shell.hero}>
        <div className={shell.heroInner}>
          <Breadcrumb
            items={[
              { href: "/", label: content.breadcrumb.home },
              { label: content.breadcrumb.current },
            ]}
          />
          <div className={shell.heroGrid}>
            <div>
              <span className={shell.label}>{content.hero.label}</span>
              <h1>
                <EmphasizedText emphasis={content.hero.emphasis} text={content.hero.title} />
              </h1>
              <p className={shell.heroLead}>{content.hero.lead}</p>
              <div className={shell.heroActions}>
                <Link className={shell.primaryAction} href={content.hero.primaryAction.href}>
                  {content.hero.primaryAction.label}
                </Link>
                <Link className={shell.secondaryAction} href={content.hero.secondaryAction.href}>
                  {content.hero.secondaryAction.label}
                </Link>
              </div>
            </div>
            <div className={styles.heroStack}>
              {/*
                The hero is the index in miniature, and that repetition is the point: a reader who
                already knows which system they came for reaches it from the first screen instead
                of scrolling past the argument to find it.
              */}
              <SystemWall
                systems={productRecords.map((product) => ({
                  slug: product.slug,
                  name: product.name,
                  label: product.shortName ?? product.name,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={`${shell.section} ${shell.sectionWhite}`} id="how-we-differ">
        <div className={shell.inner}>
          <AdaptationArgument copy={content.adaptation} />
        </div>
      </section>

      <section className={shell.section} id="fitted">
        <div className={shell.inner}>
          <div className={styles.customisation}>
            <div>
              <span className={shell.label}>{content.customisation.label}</span>
              <MarkedHeading
                className={styles.customisationHeading}
                parts={content.customisation.headingParts}
              />
              <p className={styles.customisationBody}>{content.customisation.body}</p>
              <ul className={styles.points}>
                {content.customisation.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className={styles.fieldHolder}>
              <FittedField />
            </div>
          </div>
        </div>
      </section>

      <section className={`${shell.section} ${shell.sectionWhite}`} id="systems">
        <div className={shell.inner}>
          <div className={shell.sectionHead}>
            <span className={shell.label}>{content.index.label}</span>
            <h2>{content.index.heading}</h2>
          </div>

          <SystemIndex
            industries={industries}
            labels={content.index}
            systems={productRecords.map((product) => ({
              slug: product.slug,
              name: product.name,
              positioning: product.positioning,
              category: product.category,
              industries: [...product.industries],
              screenCount: (productScreens[product.slug] ?? []).length,
            }))}
          />
        </div>
      </section>

      <section className={shell.cta}>
        <div className={shell.ctaInner}>
          <h2>{content.contact.heading}</h2>
          <div className={shell.ctaBody}>
            <p>{content.contact.body}</p>
            <Link className={shell.ctaAction} href={content.contact.action.href}>
              {content.contact.action.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
