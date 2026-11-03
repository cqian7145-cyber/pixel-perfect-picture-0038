import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MAX_LENGTH, repo, validateSubmission } from "@/lib/memories/repository";
import type { Submission } from "@/lib/memories/types";
import { Btn, ErrorNote, Loading, StatusBadge, useLoad } from "./ui";

export function SubmitForm({ slug, kind, placeholder, onDone }: { slug: string; kind: Submission["kind"]; placeholder: string; onDone?: (s: Submission) => void }) {
  const [content, setContent] = useState("");
  const [penName, setPenName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Submission | null>(null);
  const settings = useLoad(() => repo.getSettings(slug), [slug]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    const input = { venueSlug: slug, kind, content, penName, consentPublicDisplay: consent };
    const err = validateSubmission(input);
    if (err) return setError(err);
    setBusy(true); setError(null);
    try { const s = await repo.submit(input); setDone(s); onDone?.(s); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div className="paper-card envelope-open p-6">
      <div className="flex items-center justify-between"><p className="font-serif text-lg">已投进信箱</p><StatusBadge status="pending" /></div>
      <p className="mt-3 leading-7">“{done.content}”</p>
      <p className="mt-4 text-sm text-paper-muted">店主审核通过后才会公开展示。你可以在「我的记忆」中查看状态或随时撤回。</p>
      <div className="mt-4 flex flex-wrap items-center gap-4"><Btn variant="ghost" onClick={() => { setDone(null); setContent(""); setConsent(false); }}>{kind === "letter" ? "再写一封" : "再写一句"}</Btn><Link to="/account/memories" className="text-sm underline underline-offset-4">查看我的记忆</Link></div>
    </div>
  );

  if (settings.error) return <ErrorNote msg={settings.error} onRetry={settings.reload} />;
  if (!settings.data) return <Loading />;
  if (kind === "note" ? !settings.data.allowNotes : !settings.data.allowLetters) return <p className="py-6 text-sm text-muted-foreground">店主暂时关闭了此信箱，仍可阅读已公开的内容。</p>;

  return (
    <form onSubmit={submit} className="paper-card p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between border-b border-paper-text/15 pb-4 text-paper-muted"><span className="font-serif text-sm">Moonlight · {kind === "letter" ? "一封来信" : "今夜留一句"}</span><Mail size={22} strokeWidth={1} /></div>
      <label className="sr-only" htmlFor="content">内容</label>
      <textarea id="content" value={content} disabled={busy} onChange={(e) => { setContent(e.target.value); setError(null); }} placeholder={placeholder} rows={5} maxLength={MAX_LENGTH}
        className="w-full resize-none bg-transparent font-serif text-lg leading-7 placeholder:text-paper-muted focus:outline-none" />
      <div className="text-right text-xs text-paper-muted">{content.trim().length}/{MAX_LENGTH}</div>
      <input aria-label="笔名" disabled={busy} value={penName} onChange={(e) => { setPenName(e.target.value); setError(null); }} placeholder="署个笔名（可不填，默认匿名）" maxLength={12}
        className="mt-3 h-11 w-full rounded-md border border-paper-text/20 bg-transparent px-3 text-sm placeholder:text-paper-muted" />
      <label className="mt-4 flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" disabled={busy} checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(null); }} className="mt-1 h-5 w-5 accent-current" />
        <span>我同意本店在审核通过后，于本店记忆馆内匿名展示这段文字。<b>不授权用于任何商业广告。</b>可随时撤回。</span>
      </label>
      <p className="mt-2 text-xs text-paper-muted">请勿留下联系方式、真实姓名或他人隐私。</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <Btn variant="primary" type="submit" disabled={busy} className="mt-5 w-full !rounded-md"><Send size={16} className="mr-2" />{busy ? "投递中…" : "投进信箱"}</Btn>
    </form>
  );
}
