import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import type { ReviewStatus } from "@/lib/memories/types";
import { Btn, ErrorNote, Loading, StatusBadge, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/studio/review")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "内容审核 · Memories Studio" }, { name: "description", content: "审核顾客投稿。" }, { property: "og:title", content: "内容审核" }, { property: "og:description", content: "审核顾客投稿。" }] }),
  component: Review,
});

const TABS: { k: ReviewStatus; l: string }[] = [{ k: "pending", l: "待审核" }, { k: "approved", l: "已公开" }, { k: "rejected", l: "未通过" }, { k: "withdrawn", l: "已撤回" }];
const REASONS = ["包含联系方式", "涉及他人隐私", "内容不适宜公开"];

function Review() {
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [rejecting, setRejecting] = useState<string | null>(null);
  const { data, error, reload } = useLoad(() => repo.listForReview("yeshi"), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  async function decide(id: string, status: "approved" | "rejected", reason?: string) {
    if (busy) return;
    setBusy(id); setActionError(null);
    try { await repo.review(id, status, reason); setRejecting(null); reload(); }
    catch (e) { setActionError(e instanceof Error ? e.message : "审核失败，请重试。"); }
    finally { setBusy(null); }
  }
  const list = data?.filter((s) => s.status === tab);
  return (
    <div>
      <h1 className="text-2xl">内容审核</h1>
      <p className="mt-1 text-sm text-muted-foreground">所有公开投稿必须经过审核。投稿授权仅限本店记忆馆展示，不可用于商业广告。</p>
      <div className="mt-5 flex gap-2 overflow-x-auto">{TABS.map((t) => <Btn key={t.k} variant={tab === t.k ? "primary" : "ghost"} aria-pressed={tab === t.k} onClick={() => { setTab(t.k); setRejecting(null); }} className="shrink-0 px-3">{t.l} {data?.filter(s => s.status === t.k).length ?? 0}</Btn>)}</div>
      {actionError && <div className="mt-4"><ErrorNote msg={actionError} /></div>}
      {error ? <ErrorNote msg={error} onRetry={reload} /> : !list ? <Loading /> : list.length === 0 ? <p className="py-12 text-center text-muted-foreground">没有内容。</p> : (
        <ul className="mt-5 space-y-3">{list.map((s) => (
          <li key={s.id} className="rounded-xl bg-card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><StatusBadge status={s.status} /><span>{s.kind === "note" ? "今夜留一句" : "留给下一位"}</span><span>· {s.penName}</span>{s.isDemo && <span className="text-warm">· 演示内容</span>}</div>
            <p className="mt-3 font-serif text-lg">{s.content}</p>
            {s.rejectReason && <p className="mt-1 text-sm text-muted-foreground">原因：{s.rejectReason}</p>}
            {s.status === "pending" && (rejecting === s.id ? (
              <div className="mt-4 flex flex-wrap gap-2">{REASONS.map((r) => <Btn key={r} disabled={busy !== null} variant="danger" onClick={() => decide(s.id, "rejected", r)}>{r}</Btn>)}<Btn variant="ghost" disabled={busy !== null} onClick={() => setRejecting(null)}>取消</Btn></div>
            ) : (
              <div className="mt-4 flex gap-2"><Btn disabled={busy !== null} onClick={() => decide(s.id, "approved")}>{busy === s.id ? "处理中…" : "通过"}</Btn><Btn disabled={busy !== null} variant="danger" onClick={() => setRejecting(s.id)}>拒绝</Btn></div>
            ))}
          </li>
        ))}</ul>
      )}
    </div>
  );
}
