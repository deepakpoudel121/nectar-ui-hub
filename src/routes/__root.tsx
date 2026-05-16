import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="display text-[8rem] leading-none text-primary">404</div>
        <h2 className="mt-2 display text-3xl">Off the rack</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn't exist. Re-rack and head back.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="display text-3xl">Something snapped</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-sm bg-primary px-5 py-3 text-xs font-bold uppercase tracking-widest text-primary-foreground"
          >
            Retry
          </button>
          <a href="/" className="rounded-sm border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FitBrain — Lift. Log. Learn." },
      { name: "description", content: "AI-powered workout logging. Talk like a lifter, get structured data, watch your numbers climb." },
      { property: "og:title", content: "FitBrain — Lift. Log. Learn." },
      { property: "og:description", content: "AI-powered workout logging. Talk like a lifter, get structured data, watch your numbers climb." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "FitBrain — Lift. Log. Learn." },
      { name: "twitter:description", content: "AI-powered workout logging. Talk like a lifter, get structured data, watch your numbers climb." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3efd7b2c-b66c-4df8-86de-14c7b00db937/id-preview-04348fc6--7bf27fce-b151-4dbd-8ab4-016fbd50daef.lovable.app-1778904130225.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3efd7b2c-b66c-4df8-86de-14c7b00db937/id-preview-04348fc6--7bf27fce-b151-4dbd-8ab4-016fbd50daef.lovable.app-1778904130225.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
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
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
