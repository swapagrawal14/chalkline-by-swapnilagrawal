import { StudioApp } from "@/components/studio/studio-app";
import { createFileRoute } from "@tanstack/react-router";

type StudioSearch = { p?: string };

export const Route = createFileRoute("/studio")({
  validateSearch: (s: Record<string, unknown>): StudioSearch => ({
    p: typeof s.p === "string" ? s.p : undefined,
  }),
  component: StudioPage,
});

function StudioPage() {
  const { p } = Route.useSearch();
  return <StudioApp projectId={p} />;
}
