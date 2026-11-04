import { createFileRoute } from "@tanstack/react-router";
import { repo } from "@/lib/memories/repository";
import { SubmitForm } from "@/components/memories/SubmitForm";
import { CustomerShell, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/write")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "今夜留一句 · Moonlight Memories" }, { name: "description", content: "写下今晚的一句话。" }, { property: "og:title", content: "今夜留一句" }, { property: "og:description", content: "写下今晚的一句话。" }] }),
  component: Write,
});

function Write() {
  const { venueSlug } = Route.useParams();
  const notes = useLoad(() => repo.listApproved(venueSlug, "note"), [venueSlug]);
  return (
    <CustomerShell slug={venueSlug} title="今夜留一句">
      <p className="mb-3 text-xs text-warm">A NOTE FOR TONIGHT</p>
      <h1 className="text-3xl">今夜，你想留下什么？</h1>
      <p className="mt-2 text-sm text-muted-foreground">一句就好。无需登录，审核通过后挂上记忆墙。</p>
      <div className="mt-6"><SubmitForm slug={venueSlug} kind="note" placeholder="比如：今天的风有点甜。" onDone={() => notes.reload()} /></div>
      <h2 className="mt-10 text-lg">记忆墙</h2>
      {notes.error ? <ErrorNote msg={notes.error} onRetry={notes.reload} /> : !notes.data ? <Loading /> : notes.data.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">还没有公开的留言。</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {notes.data?.map((n, i) => (
          <div key={n.id} className="paper-card p-4 text-sm leading-6" style={{ transform: `rotate(${i % 2 ? 1 : -1}deg)` }}>
            “{n.content}”<div className="mt-2 text-xs text-paper-muted">{n.penName}{n.isDemo && " · 演示内容"}</div>
          </div>
        ))}
      </div>
    </CustomerShell>
  );
}
