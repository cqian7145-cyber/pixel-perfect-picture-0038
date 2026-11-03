import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "Memories Studio · Moonlight" }, { name: "description", content: "Moonlight Memories 商家后台原型。" }, { property: "og:title", content: "Memories Studio" }, { property: "og:description", content: "Moonlight Memories 商家后台原型。" }] }),
  component: StudioLayout,
});

const NAV = [
  { to: "/studio", label: "概览", exact: true },
  { to: "/studio/review", label: "内容审核" },
  { to: "/studio/curation", label: "故事精选" },
  { to: "/studio/settings", label: "基础设置" },
] as const;

function StudioLayout() {
  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-border bg-card md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <div className="px-5 py-4"><p className="font-serif text-lg">Memories Studio</p><p className="text-xs text-muted-foreground">夜诗小馆（演示）</p></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: "exact" in n }} className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent" activeProps={{ className: "bg-accent text-foreground" }}>{n.label}</Link>
          ))}
          <Link to="/m/$venueSlug" params={{ venueSlug: "yeshi" }} className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent">查看顾客端 ↗</Link>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-5 md:p-8"><p className="mb-5 border-b border-border pb-3 text-sm text-muted-foreground">本地模拟 · 未上线 · 不具备正式店主权限保护，仅管理本浏览器的演示记录。</p><Outlet /></main>
    </div>
  );
}
