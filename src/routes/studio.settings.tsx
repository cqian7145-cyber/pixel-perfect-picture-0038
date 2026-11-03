import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { repo } from "@/lib/memories/repository";
import type { VenueSettings } from "@/lib/memories/types";
import { Btn, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/studio/settings")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "基础设置 · Memories Studio" }, { name: "description", content: "记忆馆基础设置。" }, { property: "og:title", content: "基础设置" }, { property: "og:description", content: "记忆馆基础设置。" }] }),
  component: Settings,
});

function Settings() {
  const { data, error, reload } = useLoad(() => repo.getSettings("yeshi"), []);
  const [s, setS] = useState<VenueSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  useEffect(() => { if (data) setS(data); }, [data]);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!s) return <Loading />;
  const toggle = (k: "allowNotes" | "allowLetters", l: string) => (
    <label className="flex min-h-12 items-center justify-between border-b border-border text-sm">{l}<input type="checkbox" disabled={busy} className="h-5 w-5" checked={s[k]} onChange={(e) => { setS({ ...s, [k]: e.target.checked }); setSaved(false); }} /></label>
  );
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl">基础设置</h1>
      <div className="mt-6 rounded-xl bg-card p-5">
        <label className="text-sm text-muted-foreground" htmlFor="dn">记忆馆显示名称</label>
        <input id="dn" disabled={busy} maxLength={40} value={s.displayName} onChange={(e) => { setS({ ...s, displayName: e.target.value }); setSaved(false); }} className="mt-2 h-11 w-full rounded-md border border-input bg-transparent px-3" />
        <div className="mt-4">{toggle("allowNotes", "开放「今夜留一句」")}{toggle("allowLetters", "开放「留给下一位」")}</div>
        <div className="flex min-h-12 items-center justify-between text-sm"><span>公开前必须审核</span><span className="text-muted-foreground">始终开启</span></div>
      </div>
      {actionError && <ErrorNote msg={actionError} />}
      <Btn className="mt-5" disabled={busy || !s.displayName.trim()} onClick={async () => { setBusy(true); setActionError(null); try { await repo.saveSettings("yeshi", s); setSaved(true); } catch (e) { setActionError(e instanceof Error ? e.message : "保存失败，请重试。"); } finally { setBusy(false); } }}>{busy ? "保存中…" : saved ? "已保存" : "保存"}</Btn>
    </div>
  );
}
