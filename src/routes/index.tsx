import { createFileRoute } from "@tanstack/react-router";

import { VenueHome } from "./m.$venueSlug.index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moonlight Memories · 贵阳夜诗酒馆" },
      { name: "description", content: "在夜诗酒馆的记忆馆读一封来信，留下今夜的一句话。演示门店。" },
      { property: "og:title", content: "Moonlight Memories" },
      { property: "og:description", content: "让每一家酒馆，成为一座有记忆的空间。" },
    ],
  }),
  component: Index,
});

function Index() {
  return <VenueHome venueSlug="yeshi" />;
}
