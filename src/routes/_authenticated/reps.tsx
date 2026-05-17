import { createFileRoute, Outlet } from "@tanstack/react-router";
import { buildHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/reps")({
  head: () =>
    buildHead({
      title: "Reps",
      description: "Rep performance, attainment, and commission breakdowns.",
      path: "/reps",
      noindex: true,
    }),
  component: () => <Outlet />,
});
