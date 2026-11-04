import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { repo } from "@/lib/memories/repository";
import { Btn, ErrorNote, Loading, StatusBadge, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/account/memories")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "我的记忆 · Moonlight Memories" }, { name: "description", content: "查看你留下的句子与来信。" }, { property: "og:title", content: "我的记忆" }, { property: "og:description", content: "查看你留下的句子与来信。" }] }),
  component: Mine,
});

function Mine() {
  // 原型：模拟登录。真实认证由现有 Moonlight 账号体系提供，未登录绝不展示任何数据。
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <div className="min-h-screen bg-night">
      <main className="mx-auto max-w-xl px-4 py-8">
        <Link to="/m/$venueSlug" params={{ venueSlug: "yeshi" }} className="text-sm text-muted-foreground">← 返回记忆馆</Link>
        <h1 className="mt-4 text-2xl">我的记忆</h1>
        {!signedIn ? (
          <div className="mt-8 rounded-xl bg-card p-6 text-center">
            <p>登录后查看你的投稿与审核状态。</p>
            <p className="mt-2 text-xs text-muted-foreground">原型阶段为模拟登录，仅显示本设备上的投稿。</p>
            <Btn disabled={!ready} className="mt-5" onClick={() => setSignedIn(true)}>{ready ? "模拟登录" : "正在准备…"}</Btn>
          </div>
        ) : <MineList onSignOut={() => setSignedIn(false)} />}
      </main>
    </div>
  );
}

function MineList({ onSignOut }: { onSignOut: () => void }) {
  const { data, error, reload } = useLoad(() => repo.listMine(), []);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-muted-foreground">本设备记录 · 同一浏览器的使用者可查看，不是正式账号空间。</p>
      {actionError && <ErrorNote msg={actionError} />}
      {data.length === 0 ? <p className="py-10 text-center text-muted-foreground">你还没有留下记忆。</p> : (
        <ul className="space-y-4">{data.map((s) => (
          <li key={s.id} className="paper-card p-5">
            <div className="flex items-center justify-between text-xs text-paper-muted"><span>{s.kind === "note" ? "今夜留一句" : "留给下一位"} · {new Date(s.createdAt).toLocaleString("zh-CN")}</span><StatusBadge status={s.status} /></div>
            <p className="mt-3 font-serif leading-7">{s.content}</p>
            {s.status === "rejected" && s.rejectReason && <p className="mt-2 text-sm text-paper-muted">未通过原因：{s.rejectReason}</p>}
            <p className="mt-2 text-xs text-paper-muted">授权：仅本店记忆馆匿名展示 · 不含商业广告</p>
            {s.status !== "withdrawn" && (confirmId === s.id ? <div className="mt-4"><p className="text-sm text-paper-muted">撤回后不再公开展示，且无法恢复。确定撤回？</p><div className="mt-3 flex gap-2"><Btn variant="danger" disabled={busy} onClick={async () => { setBusy(true); setActionError(null); try { await repo.withdraw(s.id); setConfirmId(null); reload(); } catch (e) { setActionError(e instanceof Error ? e.message : "撤回失败，请重试。"); } finally { setBusy(false); } }}>{busy ? "撤回中…" : "确定撤回"}</Btn><Btn variant="ghost" disabled={busy} onClick={() => setConfirmId(null)}>保留</Btn></div></div> : <Btn variant="ghost" className="mt-3" onClick={() => setConfirmId(s.id)}>撤回</Btn>)}
          </li>
        ))}</ul>
      )}
      <Btn variant="ghost" className="mt-6" onClick={onSignOut}>退出</Btn>
    </div>
  );
}
