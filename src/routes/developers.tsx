import { createFileRoute } from "@tanstack/react-router";
import { ApiDocs } from "@/components/landing/api-docs";

export const Route = createFileRoute("/developers")({
  component: ApiDocs,
});
