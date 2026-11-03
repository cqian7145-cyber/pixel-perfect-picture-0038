import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import { DemoBadge, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/studio/curation")({
  head: () => ({ meta: [{ title: "故事精选 · Memories Studio" }, { name: "description", content: "选择在记忆馆首页展示的故事。" }, { property: "og:title", content: "故事精选" }, { property: "og:description", content: "选择在记忆馆首页展示的故事。" }] }),
  component: Curation,
});

function Curation() {
  const { data, error, reload } = useLoad(() => repo.listStories("yeshi"), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  return (
    <div>
      <h1 className="text-2xl">故事精选与策展</h1>
      <p className="mt-1 text-sm text-muted-foreground">精选的故事会出现在顾客端首页「本店的故事」。</p>
      {actionError && <ErrorNote msg={actionError} />}
      {error ? <ErrorNote msg={error} onRetry={reload} /> : !data ? <Loading /> : (
        <ul className="mt-5 space-y-3">{data.map((s) => (
          <li key={s.id} className="flex items-center gap-4 rounded-xl bg-card p-4">
            <div className="min-w-0 flex-1"><p className="font-serif">{s.title} {s.isDemo && <DemoBadge className="ml-1" />}</p><p className="mt-1 text-sm text-muted-foreground">{s.excerpt}</p></div>
            <label className="flex min-h-11 shrink-0 items-center gap-2 text-sm"><input type="checkbox" disabled={busy !== null} className="h-5 w-5" checked={s.featured} onChange={async (e) => { setBusy(s.id); setActionError(null); try { await repo.setFeatured(s.id, e.target.checked); reload(); } catch (e) { setActionError(e instanceof Error ? e.message : "保存失败。"); } finally { setBusy(null); } }} />精选</label>
          </li>
        ))}</ul>
      )}
    </div>
  );
}
