import { createFileRoute, Link } from "@tanstack/react-router";
import { repo } from "@/lib/memories/repository";
import { DemoBadge, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/studio/")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "概览 · Memories Studio" }, { name: "description", content: "门店记忆馆数据概览。" }, { property: "og:title", content: "概览 · Memories Studio" }, { property: "og:description", content: "门店记忆馆数据概览。" }] }),
  component: Overview,
});

function Overview() {
  const { data, error, reload } = useLoad(() => repo.listForReview("yeshi"), []);
  const draws = useLoad(() => repo.weeklyGuestLetterDraws("yeshi"), []);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  const c = (st: string) => data.filter((s) => s.status === st).length;
  const cards = [["待审核", c("pending")], ["已公开", c("approved")], ["未通过", c("rejected")], ["已撤回", c("withdrawn")]] as const;
  return (
    <div>
      <div className="flex items-center gap-2"><h1 className="text-2xl">概览</h1><DemoBadge /></div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([l, n]) => <div key={l} className="rounded-xl bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 font-serif text-3xl">{n}</p></div>)}</div>
      <section className="mt-8 rounded-xl bg-card p-5">
        <h2 className="text-lg">每周被后来客人抽到的客人信件数</h2>
        <p className="mt-1 text-xs text-muted-foreground">不含演示信与读者自己写的信 · 目前仅统计本设备（本地模拟）</p>
        {draws.data ? <WeeklyChart rows={draws.data} /> : <Loading />}
      </section>
      {c("pending") > 0 && <Link to="/studio/review" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-warm px-5 text-sm font-medium text-warm-foreground">去审核 {c("pending")} 条</Link>}
    </div>
  );
}

function WeeklyChart({ rows }: { rows: { weekStart: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  const last = rows[rows.length - 1]?.count ?? 0;
  return <div className="mt-4">
    <p className="font-serif text-3xl">{last}<span className="ml-2 text-sm text-muted-foreground">本周</span></p>
    <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label={`近 ${rows.length} 周抽信数：${rows.map(r => `${r.weekStart} ${r.count}`).join("，")}`}>
      {rows.map(r => <div key={r.weekStart} className="flex flex-1 flex-col items-center gap-1"><span className="text-xs text-muted-foreground">{r.count}</span><div className="w-full rounded-t bg-warm" style={{ height: `${(r.count / max) * 96}px`, minHeight: 2 }} /><span className="text-[10px] text-muted-foreground">{r.weekStart}</span></div>)}
    </div>
  </div>;
}
