import { Outlet, Link, HeadContent, Scripts } from "@tanstack/react-router";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { buildHead, buildSiteJsonLd } from "@/lib/seo";
import { themeBootstrapScript } from "@/hooks/use-theme";

interface RouterContext {
  queryClient: QueryClient;
}

/**
 * 404 page.
 *
 * TanStack Start's notFoundComponent can't use head() to emit `robots: noindex`
 * — the root route's head() runs unconditionally and advertises
 * `robots: index, follow`. Left alone, every unmatched URL inherits that
 * directive and search engines happily index garbage 404 paths.
 *
 * Fix: imperatively patch document.title and inject
 * `<meta name="robots" content="noindex,nofollow">` on mount, then restore the
 * prior values on unmount so navigating away from the 404 doesn't leave a
 * stale noindex directive on a real page.
 */
function NotFoundComponent() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const prevTitle = document.title;
    document.title = "Page not found — CommCalc";

    const existing = document.querySelector(
      'meta[name="robots"]',
    ) as HTMLMetaElement | null;
    const prevRobots = existing?.getAttribute("content") ?? null;

    let injected: HTMLMetaElement | null = null;
    if (existing) {
      existing.setAttribute("content", "noindex, nofollow");
    } else {
      injected = document.createElement("meta");
      injected.setAttribute("name", "robots");
      injected.setAttribute("content", "noindex, nofollow");
      document.head.appendChild(injected);
    }

    return () => {
      document.title = prevTitle;
      if (injected && injected.parentNode) {
        injected.parentNode.removeChild(injected);
      } else if (existing && prevRobots !== null) {
        existing.setAttribute("content", prevRobots);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => {
    const { meta, links } = buildHead({
      title: "CommCalc — Commission & comp calculator",
      description:
        "Real-time commission engine for sales teams. Configure comp plans, log deals, and watch payouts calculate instantly.",
      path: "/",
    });
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#002333" },
        ...meta,
      ],
      links: [{ rel: "stylesheet", href: appCss }, ...links],
      scripts: [
        { children: themeBootstrapScript },
        { type: "application/ld+json", children: buildSiteJsonLd() },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {/* Skip to main content — first focusable element on every page. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
