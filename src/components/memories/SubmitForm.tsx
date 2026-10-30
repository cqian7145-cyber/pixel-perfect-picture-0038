import { useState } from "react";
import { MAX_LENGTH, repo, validateSubmission } from "@/lib/memories/repository";
import type { Submission } from "@/lib/memories/types";
import { Btn, StatusBadge } from "./ui";

export function SubmitForm({
  slug,
  kind,
  placeholder,
  onDone,
}: {
  slug: string;
  kind: Submission["kind"];
  placeholder: string;
  onDone?: (s: Submission) => void;
}) {
  const [content, setContent] = useState("");
  const [penName, setPenName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Submission | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const input = { venueSlug: slug, kind, content, penName, consentPublicDisplay: consent };
    const err = validateSubmission(input);
    if (err) return setError(err);
    setBusy(true);
    setError(null);
    try {
      const s = await repo.submit(input);
      setDone(s);
      onDone?.(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="paper-card envelope-open p-6">
        <div className="flex items-center justify-between">
          <p className="font-serif text-lg">已投进信箱</p>
          <StatusBadge status="pending" />
        </div>
        <p className="mt-3 leading-7">“{done.content}”</p>
        <p className="mt-4 text-sm text-paper-muted">
          店主审核通过后才会公开展示。你可以在「我的记忆」中查看状态或随时撤回。
        </p>
        <button
          className="mt-4 text-sm underline"
          onClick={() => {
            setDone(null);
            setContent("");
            setConsent(false);
          }}
        >
          再写一句
        </button>
      </div>
    );

  return (
    <form onSubmit={submit} className="paper-card p-5">
      <label className="sr-only" htmlFor="content">
        内容
      </label>
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={5}
        maxLength={MAX_LENGTH + 20}
        className="w-full resize-none bg-transparent font-serif text-lg leading-7 placeholder:text-paper-muted focus:outline-none"
      />
      <div className="text-right text-xs text-paper-muted">
        {content.trim().length}/{MAX_LENGTH}
      </div>
      <input
        value={penName}
        onChange={(e) => setPenName(e.target.value)}
        placeholder="署个笔名（可不填，默认匿名）"
        maxLength={12}
        className="mt-3 h-11 w-full rounded-md border border-paper-text/20 bg-transparent px-3 text-sm placeholder:text-paper-muted"
      />
      <label className="mt-4 flex items-start gap-3 text-sm leading-6">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-5 w-5 accent-current"
        />
        <span>
          我同意本店在审核通过后，于本店记忆馆内匿名展示这段文字。<b>不授权用于任何商业广告。</b>
          可随时撤回。
        </span>
      </label>
      <p className="mt-2 text-xs text-paper-muted">请勿留下联系方式、真实姓名或他人隐私。</p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
      <Btn variant="primary" type="submit" disabled={busy} className="mt-4 w-full">
        {busy ? "投递中…" : "投进信箱"}
      </Btn>
    </form>
  );
}
