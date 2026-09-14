import { createDatabase, getPublishedSiteDocumentEnvelope } from "@cambt/database";
import { unstable_cache } from "next/cache";

export interface PublicSiteDocument<T> {
  data: T;
  seoDescription: string | null;
  seoTitle: string | null;
  socialImagePath: string | null;
}

function mergeWithFallback<T>(fallback: T, candidate: unknown): T {
  if (Array.isArray(fallback)) return (Array.isArray(candidate) ? candidate : fallback) as T;
  if (fallback && typeof fallback === "object") {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return fallback;
    return Object.fromEntries(
      Object.entries(fallback as Record<string, unknown>).map(([key, value]) => [
        key,
        mergeWithFallback(value, (candidate as Record<string, unknown>)[key]),
      ]),
    ) as T;
  }
  return (typeof candidate === typeof fallback ? candidate : fallback) as T;
}

async function readDocument(key: string) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;
  const { client, db } = createDatabase(databaseUrl);
  try {
    return await getPublishedSiteDocumentEnvelope(db, key);
  } catch {
    return null;
  } finally {
    await client.end({ timeout: 2 });
  }
}

function cachedDocument(key: string) {
  return unstable_cache(() => readDocument(key), ["site-document", key], {
    revalidate: 3600,
    tags: ["site-content", `site-document:${key}`],
  })();
}

export async function loadSiteDocument<T extends object>(
  key: string,
  fallback: T,
): Promise<PublicSiteDocument<T>> {
  const document = await cachedDocument(key);
  return {
    data: mergeWithFallback(fallback, document?.data),
    seoDescription: document?.seoDescription ?? null,
    seoTitle: document?.seoTitle ?? null,
    socialImagePath: document?.socialImagePath ?? null,
  };
}

export async function loadEntityDocuments<T extends { slug: string }>(
  prefix: string,
  fallbacks: readonly T[],
): Promise<T[]> {
  return Promise.all(
    fallbacks.map(
      async (fallback) => (await loadSiteDocument(`${prefix}.${fallback.slug}`, fallback)).data,
    ),
  );
}
