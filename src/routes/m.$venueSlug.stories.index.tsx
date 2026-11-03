import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import { Btn, CustomerShell, DemoBadge, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/stories/")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "本店的故事 · Moonlight Memories" }, { name: "description", content: "这家酒馆里发生过的夜晚。" }, { property: "og:title", content: "本店的故事" }, { property: "og:description", content: "这家酒馆里发生过的夜晚。" }] }),
  component: Stories,
});

function Stories() {
  const { venueSlug } = Route.useParams();
  const { data, error, reload } = useLoad(() => repo.listStories(venueSlug), [venueSlug]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("全部");
  const tags = [...new Set(data?.flatMap(s => s.tags) ?? [])];
  const filtered = data?.filter(s => (tag === "全部" || s.tags.includes(tag)) && `${s.title} ${s.excerpt} ${s.author}`.includes(query.trim()));
  return (
    <CustomerShell slug={venueSlug} title="本店的故事">
      <p className="text-xs text-warm">THE MOONLIGHT ARCHIVE</p>
      <h1 className="mt-3 text-3xl">被时光留下的故事</h1>
      <div className="my-6 border-b border-border pb-4 text-sm text-muted-foreground">一张桌子，一封来信，一个被记住的夜晚。</div>
      <input aria-label="搜索故事" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索故事或笔名" className="mb-4 h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm" />
      <div className="mb-6 flex flex-wrap gap-2">{["全部", ...tags].map(t => <Btn key={t} variant={tag === t ? "primary" : "ghost"} aria-pressed={tag === t} onClick={() => setTag(t)} className="px-3">{t}</Btn>)}</div>
      {error ? <ErrorNote msg={error} onRetry={reload} /> : !filtered ? <Loading /> : filtered.length === 0 ? <div className="py-8 text-center"><p className="text-muted-foreground">没有找到相关故事。</p><Btn variant="ghost" className="mt-4" onClick={() => { setQuery(""); setTag("全部"); }}>查看全部</Btn></div> : (
        <div className="grid gap-5">
          {filtered.map((s, i) => (
            <Link key={s.id} to="/m/$venueSlug/stories/$storyId" params={{ venueSlug, storyId: s.id }} className="paper-card fade-up block p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between text-xs text-paper-muted"><span>{s.date} · {s.author}</span>{s.isDemo && <span>演示内容</span>}</div>
              <p className="mt-2 font-serif text-xl">{s.title}</p>
              <p className="mt-3 text-base leading-7 text-paper-muted">{s.excerpt}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-paper-muted">{s.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-6"><DemoBadge /> <span className="text-xs text-muted-foreground">故事为原型演示，非真实顾客投稿。</span></div>
    </CustomerShell>
  );
}
