import { createFileRoute, Link } from "@tanstack/react-router";
import { repo } from "@/lib/memories/repository";
import { CustomerShell, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/stories/$storyId")({
  head: () => ({ meta: [{ title: "故事 · Moonlight Memories" }, { name: "description", content: "一个发生在酒馆里的夜晚。" }, { property: "og:title", content: "故事 · Moonlight Memories" }, { property: "og:description", content: "一个发生在酒馆里的夜晚。" }] }),
  component: StoryPage,
});

function StoryPage() {
  const { venueSlug, storyId } = Route.useParams();
  const { data, error, reload } = useLoad(() => repo.getStory(venueSlug, storyId), [venueSlug, storyId]);
  return (
    <CustomerShell slug={venueSlug} title="故事">
      {error ? <ErrorNote msg={error} onRetry={reload} /> : data === undefined ? <Loading /> : data === null ? (
        <div className="py-12 text-center"><p className="text-muted-foreground">这个故事不存在或已下架。</p><Link to="/m/$venueSlug/stories" params={{ venueSlug }} className="mt-4 inline-block underline">看看其他故事</Link></div>
      ) : (
        <article className="paper-card fade-up p-6">
          <div className="flex justify-between text-xs text-paper-muted"><span>{data.date}</span>{data.isDemo && <span>演示内容</span>}</div>
          <h1 className="mt-3 text-2xl">{data.title}</h1>
          <div className="mt-5 space-y-4 font-serif leading-8">{data.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <p className="mt-6 text-right text-sm text-paper-muted">—— {data.author}</p>
          <div className="mt-4 flex flex-wrap gap-2">{data.tags.map((t) => <span key={t} className="rounded-full border border-paper-text/20 px-2 py-0.5 text-xs">{t}</span>)}</div>
        </article>
      )}
    </CustomerShell>
  );
}
