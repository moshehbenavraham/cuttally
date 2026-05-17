/**
 * Centralized SEO metadata + JSON-LD for CommCalc.
 *
 * SITE_URL is the inferred production hostname for the marketing site.
 * The in-product mock browser bar references `app.commcalc.io`, so the
 * marketing site is assumed to live at the apex `commcalc.io`. If the
 * real production URL differs, update SITE_URL below — every per-route
 * canonical, OG, and sitemap entry derives from it.
 */
export const SITE_URL = "https://commcalc.io";
export const SITE_NAME = "CommCalc";
export const SITE_DESCRIPTION =
  "Real-time commission engine for sales teams. Configure comp plans, log deals, and watch payouts calculate instantly.";
export const APP_URL = "https://app.commcalc.io";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/social-preview.svg`;

// TanStack's head() meta/links accept loose record shapes; the framework
// types are intentionally permissive. Keep these as Record so per-route
// helpers don't fight the type system over { name } vs { property }.
type MetaEntry = Record<string, string>;
type LinkEntry = Record<string, string>;

interface BuildHeadOptions {
  title: string;
  description?: string;
  /** Path beginning with `/` (e.g. "/login"). Used to build canonical + og:url. */
  path: string;
  /** Add robots: noindex, nofollow — for auth-walled or transient pages. */
  noindex?: boolean;
  /** Absolute or relative path. Defaults to DEFAULT_OG_IMAGE. */
  image?: string;
  /** Open Graph type. Defaults to "website". */
  ogType?: string;
}

function absolute(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

export function buildHead({
  title,
  description,
  path,
  noindex = false,
  image,
  ogType = "website",
}: BuildHeadOptions): { meta: MetaEntry[]; links: LinkEntry[] } {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;
  const desc = description ?? SITE_DESCRIPTION;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = absolute(image ?? DEFAULT_OG_IMAGE);

  const meta: MetaEntry[] = [
    { title: fullTitle },
    { name: "description", content: desc },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: desc },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: ogType },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: desc },
    { name: "twitter:image", content: ogImage },
  ];

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  } else {
    meta.push({ name: "robots", content: "index, follow" });
  }

  const links: LinkEntry[] = [{ rel: "canonical", href: canonical }];

  return { meta, links };
}

/**
 * JSON-LD @graph string suitable for a <script type="application/ld+json">.
 * Emitted once at the root so every page carries WebSite + Organization +
 * SoftwareApplication identity.
 */
export function buildSiteJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_OG_IMAGE,
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#software`,
        name: SITE_NAME,
        url: APP_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: SITE_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        publisher: { "@id": `${SITE_URL}#organization` },
      },
    ],
  });
}
