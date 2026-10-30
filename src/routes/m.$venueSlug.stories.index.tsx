import { createFileRoute, Link } from "@tanstack/react-router";
import { repo } from "@/lib/memories/repository";
import { CustomerShell, DemoBadge, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/stories/")({
  head: () => ({
    meta: [
      { title: "本店的故事 · Moonlight Memories" },
      { name: "description", content: "这家酒馆里发生过的夜晚。" },
      { property: "og:title", content: "本店的故事" },
      { property: "og:description", content: "这家酒馆里发生过的夜晚。" },
    ],
  }),
  component: Stories,
});

function Stories() {
  const { venueSlug } = Route.useParams();
  const { data, error, reload } = useLoad(() => repo.listStories(venueSlug), [venueSlug]);
  return (
    <CustomerShell slug={venueSlug} title="本店的故事">
      {error && <ErrorNote msg={error} onRetry={reload} />}
      {!data ? (
        <Loading />
      ) : data.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">还没有故事。</p>
      ) : (
        <div className="grid gap-5">
          {data.map((s, i) => (
            <Link
              key={s.id}
              to="/m/$venueSlug/stories/$storyId"
              params={{ venueSlug, storyId: s.id }}
              className="paper-card fade-up block p-5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between text-xs text-paper-muted">
                <span>
                  {s.date} · {s.author}
                </span>
                {s.isDemo && <span>演示内容</span>}
              </div>
              <p className="mt-2 font-serif text-xl">{s.title}</p>
              <p className="mt-2 text-sm text-paper-muted">{s.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-6">
        <DemoBadge />{" "}
        <span className="text-xs text-muted-foreground">故事为原型演示，非真实顾客投稿。</span>
      </div>
    </CustomerShell>
  );
}
