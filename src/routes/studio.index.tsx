import { createFileRoute, Link } from "@tanstack/react-router";
import { repo } from "@/lib/memories/repository";
import { DemoBadge, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/studio/")({
  head: () => ({ meta: [{ title: "概览 · Memories Studio" }, { name: "description", content: "门店记忆馆数据概览。" }, { property: "og:title", content: "概览 · Memories Studio" }, { property: "og:description", content: "门店记忆馆数据概览。" }] }),
  component: Overview,
});

function Overview() {
  const { data } = useLoad(() => repo.listForReview("yeshi"), []);
  if (!data) return <Loading />;
  const c = (st: string) => data.filter((s) => s.status === st).length;
  const cards = [["待审核", c("pending")], ["已公开", c("approved")], ["未通过", c("rejected")], ["已撤回", c("withdrawn")]] as const;
  return (
    <div>
      <div className="flex items-center gap-2"><h1 className="text-2xl">概览</h1><DemoBadge /></div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">{cards.map(([l, n]) => <div key={l} className="rounded-xl bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-2 font-serif text-3xl">{n}</p></div>)}</div>
      {c("pending") > 0 && <Link to="/studio/review" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-warm px-5 text-sm font-medium text-warm-foreground">去审核 {c("pending")} 条</Link>}
    </div>
  );
}
