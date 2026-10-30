import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moonlight Memories · 酒馆记忆馆原型" },
      {
        name: "description",
        content: "Moonlight Memories 可点击原型：顾客端记忆馆与 Memories Studio 商家后台。",
      },
      { property: "og:title", content: "Moonlight Memories" },
      { property: "og:description", content: "让每一家酒馆，成为一座有记忆的空间。" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-night px-6 text-center">
      <p className="text-sm tracking-[0.3em] text-muted-foreground">MOONLIGHT</p>
      <h1 className="mt-3 font-serif text-4xl fade-up">Memories</h1>
      <p className="mt-4 max-w-xs text-muted-foreground">让每一家酒馆，成为一座有记忆的空间。</p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          to="/m/$venueSlug"
          params={{ venueSlug: "yeshi" }}
          className="flex min-h-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          进入演示门店记忆馆
        </Link>
        <Link
          to="/studio"
          className="flex min-h-12 items-center justify-center rounded-full border border-border hover:bg-accent"
        >
          Memories Studio（商家）
        </Link>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">原型阶段 · 所有门店与故事均为演示内容</p>
    </div>
  );
}
