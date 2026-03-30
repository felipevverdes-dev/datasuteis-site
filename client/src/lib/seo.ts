import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";
import {
  DEFAULT_AUTHOR,
  DEFAULT_OG_IMAGE,
  buildLocalizedUrl,
  getDefaultRobotsContent,
  HTML_LANG_BY_LANGUAGE,
  SITE_LAST_MODIFIED_DATE,
  SITE_LAST_MODIFIED_DATETIME,
  SITE_NAME,
  SITE_URL,
  readRequestedLanguage,
} from "@/lib/site";

export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  robots?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  schema?: Record<string, unknown> | Record<string, unknown>[];
  publishedTime?: string;
  modifiedTime?: string;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag!.setAttribute(key, value);
  });
}

function removeMeta(selector: string) {
  document.head.querySelector(selector)?.remove();
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let tag = document.head.querySelector<HTMLLinkElement>(selector);
  if (!tag) {
    tag = document.createElement("link");
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag!.setAttribute(key, value);
  });
}

function getCanonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const requestedLanguage = readRequestedLanguage();
  if (requestedLanguage && requestedLanguage !== "pt") {
    return buildLocalizedUrl(normalizedPath, requestedLanguage);
  }

  return `${SITE_URL}${normalizedPath}`;
}

function getOgLocale() {
  const htmlLang = document.documentElement.lang || HTML_LANG_BY_LANGUAGE.pt;
  return htmlLang.replace("-", "_");
}

const SCHEMA_TYPES_WITH_DATE_MODIFIED = new Set([
  "Article",
  "ContactPage",
  "Game",
  "WebApplication",
  "WebPage",
]);

type SchemaValue =
  | Record<string, unknown>
  | Record<string, unknown>[]
  | undefined;

function enrichSchemaDates(value: SchemaValue): SchemaValue {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => enrichSchemaDates(item) as Record<string, unknown>);
  }

  const nextValue = Object.fromEntries(
    Object.entries(value).map(([key, itemValue]) => {
      if (Array.isArray(itemValue)) {
        return [key, itemValue.map(entry => (typeof entry === "object" && entry ? enrichSchemaDates(entry as Record<string, unknown>) : entry))];
      }

      if (itemValue && typeof itemValue === "object") {
        return [key, enrichSchemaDates(itemValue as Record<string, unknown>)];
      }

      return [key, itemValue];
    })
  ) as Record<string, unknown>;

  const schemaType = nextValue["@type"];
  if (
    typeof schemaType === "string" &&
    SCHEMA_TYPES_WITH_DATE_MODIFIED.has(schemaType) &&
    !("dateModified" in nextValue)
  ) {
    nextValue.dateModified = SITE_LAST_MODIFIED_DATE;
  }

  return nextValue;
}

export function usePageSeo({
  title,
  description,
  path,
  type = "website",
  robots = getDefaultRobotsContent(),
  image = DEFAULT_OG_IMAGE,
  imageAlt = title,
  keywords = [],
  schema,
  publishedTime,
  modifiedTime,
}: SeoConfig) {
  const keywordsValue = keywords.join(", ");
  const normalizedSchema = enrichSchemaDates(schema);
  const schemaValue = normalizedSchema ? JSON.stringify(normalizedSchema) : "";
  const effectiveModifiedTime = modifiedTime ?? SITE_LAST_MODIFIED_DATETIME;

  useEffect(() => {
    const canonical = getCanonicalUrl(path);

    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[name="author"]', { name: "author", content: DEFAULT_AUTHOR });
    if (keywordsValue) {
      upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywordsValue });
    } else {
      removeMeta('meta[name="keywords"]');
    }

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: imageAlt,
    });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: getOgLocale(),
    });
    upsertMeta('meta[property="og:updated_time"]', {
      property: "og:updated_time",
      content: effectiveModifiedTime,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: "twitter:image:alt",
      content: imageAlt,
    });

    if (type === "article" && publishedTime) {
      upsertMeta('meta[property="article:published_time"]', {
        property: "article:published_time",
        content: publishedTime,
      });
    } else {
      removeMeta('meta[property="article:published_time"]');
    }

    if (type === "article") {
      upsertMeta('meta[property="article:modified_time"]', {
        property: "article:modified_time",
        content: effectiveModifiedTime,
      });
    } else {
      removeMeta('meta[property="article:modified_time"]');
    }

    upsertLink('link[rel="canonical"]', { rel: "canonical", href: canonical });
    upsertLink('link[rel="alternate"][hreflang="pt-BR"]', {
      rel: "alternate",
      hreflang: "pt-BR",
      href: buildLocalizedUrl(path, "pt"),
    });
    upsertLink('link[rel="alternate"][hreflang="en"]', {
      rel: "alternate",
      hreflang: "en",
      href: buildLocalizedUrl(path, "en"),
    });
    upsertLink('link[rel="alternate"][hreflang="es"]', {
      rel: "alternate",
      hreflang: "es",
      href: buildLocalizedUrl(path, "es"),
    });
    upsertLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: "alternate",
      hreflang: "x-default",
      href: buildLocalizedUrl(path, "pt"),
    });

    const schemaNodeId = "route-schema";
    document.getElementById(schemaNodeId)?.remove();

    if (schema) {
      const script = document.createElement("script");
      script.id = schemaNodeId;
      script.type = "application/ld+json";
      script.textContent = schemaValue;
      document.head.appendChild(script);
    }

    trackPageView(path, title);
  }, [
    description,
    image,
    imageAlt,
    keywordsValue,
    effectiveModifiedTime,
    path,
    publishedTime,
    robots,
    schemaValue,
    title,
    type,
  ]);
}
