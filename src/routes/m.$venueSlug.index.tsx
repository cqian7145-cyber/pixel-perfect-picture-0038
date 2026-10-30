import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import { EXPERIENCES } from "@/lib/memories/experiences";
import type { Submission } from "@/lib/memories/types";
import { Btn, CustomerShell, DemoBadge, ErrorNote, Loading, MockBadge, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/")({
  head: () => ({ meta: [{ title: "门店记忆馆 · Moonlight Memories" }, { name: "description", content: "读一封过去的来信，留下今夜的一句话。" }, { property: "og:title", content: "门店记忆馆 · Moonlight Memories" }, { property: "og:description", content: "读一封过去的来信，留下今夜的一句话。" }] }),
  component: Home,
});

function Home() {
  const { venueSlug } = Route.useParams();
  const venue = useLoad(() => repo.getVenue(venueSlug), [venueSlug]);
  const stories = useLoad(() => repo.listStories(venueSlug), [venueSlug]);
  const notes = useLoad(() => repo.listApproved(venueSlug, "note"), [venueSlug]);
  const [letter, setLetter] = useState<Submission | null | undefined>(undefined);
  const [opening, setOpening] = useState(false);

  if (venue.error) return <CustomerShell slug={venueSlug}><ErrorNote msg={venue.error} onRetry={venue.reload} /></CustomerShell>;
  if (venue.data === undefined) return <CustomerShell slug={venueSlug} back={false}><Loading /></CustomerShell>;
  if (venue.data === null) return <CustomerShell slug={venueSlug}><p className="py-12 text-center text-muted-foreground">没有找到这家店的记忆馆。</p></CustomerShell>;
  const v = venue.data;

  async function draw() { setOpening(true); setLetter(await repo.drawLetter(venueSlug)); setOpening(false); }

  return (
    <CustomerShell slug={venueSlug} back={false}>
      <section className="fade-up pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">{v.city} {v.isDemo && <DemoBadge />}</div>
        <h1 className="mt-2 font-serif text-3xl">{v.name}</h1>
        <p className="mt-3 text-muted-foreground">{v.mood}</p>
        <p className="mt-6 border-l-2 border-warm pl-4 font-serif text-lg text-warm">{v.tagline}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-lg">读一封过去的来信</h2>
        {letter ? (
          <div key={letter.id} className="paper-card envelope-open mt-4 p-6">
            <p className="font-serif text-lg leading-8">{letter.content}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-paper-muted"><span>—— {letter.penName}</span>{letter.isDemo && <span>演示内容</span>}</div>
          </div>
        ) : letter === null ? (
          <p className="mt-4 text-sm text-muted-foreground">信箱暂时是空的，做第一个写信的人吧。</p>
        ) : (
          <button onClick={draw} disabled={opening} className="paper-card float-paper mt-4 flex h-36 w-full items-center justify-center font-serif text-lg">
            {opening ? "拆信中…" : "✉ 轻点拆开一封"}
          </button>
        )}
        <div className="mt-4 flex gap-3">
          {letter && <Btn variant="ghost" onClick={draw}>再拆一封</Btn>}
          <Link to="/m/$venueSlug/letters" params={{ venueSlug }} className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm hover:bg-accent">留给下一位</Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl bg-card p-5">
        <h2 className="text-lg">留下今夜的一句话</h2>
        <p className="mt-2 text-sm text-muted-foreground">不用登录，审核后会出现在记忆墙上。</p>
        <Link to="/m/$venueSlug/write" params={{ venueSlug }} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-warm px-5 text-sm font-medium text-warm-foreground">写一句</Link>
        {notes.data && notes.data.length > 0 && (
          <ul className="mt-5 space-y-2">{notes.data.slice(0, 3).map((n) => <li key={n.id} className="text-sm text-foreground/90">“{n.content}” <span className="text-muted-foreground">· {n.penName}{n.isDemo && " · 演示"}</span></li>)}</ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg">今晚的活动</h2>
        <div className="mt-3 rounded-xl border border-border p-5">
          <div className="flex items-center justify-between"><p className="font-serif text-lg">{v.tonightEvent.title}</p><DemoBadge /></div>
          <p className="mt-1 text-sm text-warm">{v.tonightEvent.time}</p>
          <p className="mt-2 text-sm text-muted-foreground">{v.tonightEvent.note}</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between"><h2 className="text-lg">本店的故事</h2><Link to="/m/$venueSlug/stories" params={{ venueSlug }} className="text-sm text-muted-foreground hover:text-foreground">全部 →</Link></div>
        {stories.data ? (
          <div className="mt-4 grid gap-4">
            {stories.data.filter((s) => s.featured).map((s) => (
              <Link key={s.id} to="/m/$venueSlug/stories/$storyId" params={{ venueSlug, storyId: s.id }} className="paper-card block p-5">
                <p className="font-serif text-lg">{s.title}</p><p className="mt-2 text-sm text-paper-muted">{s.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : <Loading />}
      </section>

      <section className="mt-10">
        <h2 className="text-lg">更多记忆玩法</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {EXPERIENCES.map((e) => (
            <Link key={e.type} to="/m/$venueSlug/experiences/$type" params={{ venueSlug, type: e.type }} className="flex min-h-24 flex-col rounded-xl bg-card p-4 hover:bg-accent">
              <span className="text-xs text-muted-foreground">{String(e.no).padStart(2, "0")}</span>
              <span className="mt-1 font-serif">{e.title}</span>
              {!e.real && <span className="mt-auto pt-2"><MockBadge /></span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 text-center">
        <Link to="/account/memories" className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm hover:bg-accent">我的记忆</Link>
      </section>
    </CustomerShell>
  );
}
