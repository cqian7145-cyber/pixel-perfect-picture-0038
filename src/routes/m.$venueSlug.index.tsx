import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Mail, PenLine, Music2, BookOpen, Bookmark } from "lucide-react";
import tavernImage from "@/assets/tavern-night.jpg";
import { repo } from "@/lib/memories/repository";
import { EXPERIENCES } from "@/lib/memories/experiences";
import type { Submission } from "@/lib/memories/types";
import { Btn, CustomerShell, DemoBadge, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/")({
  head: () => ({ meta: [{ property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { title: "门店记忆馆 · Moonlight Memories" }, { name: "description", content: "读一封过去的来信，留下今夜的一句话。" }, { property: "og:title", content: "门店记忆馆 · Moonlight Memories" }, { property: "og:description", content: "读一封过去的来信，留下今夜的一句话。" }] }),
  component: Home,
});

function Home() {
  const { venueSlug } = Route.useParams();
  return <VenueHome venueSlug={venueSlug} />;
}

export function VenueHome({ venueSlug }: { venueSlug: string }) {
  const venue = useLoad(() => repo.getVenue(venueSlug), [venueSlug]);
  const stories = useLoad(() => repo.listStories(venueSlug), [venueSlug]);
  const notes = useLoad(() => repo.listApproved(venueSlug, "note"), [venueSlug]);
  const [letter, setLetter] = useState<Submission | null | undefined>();
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function draw() {
    if (opening) return;
    setOpening(true); setError(null);
    try { const next = await repo.drawLetter(venueSlug, letter?.id); setLetter(next); if (next) window.__lovableEvents?.track?.("project.guest_letter_drawn", { is_demo: next.isDemo }); }
    catch (e) { setError(e instanceof Error ? e.message : "来信暂时没有送达，请重试。"); }
    finally { setOpening(false); }
  }
  if (venue.error) return <CustomerShell slug={venueSlug}><ErrorNote msg={venue.error} onRetry={venue.reload} /></CustomerShell>;
  if (!venue.data) return <CustomerShell slug={venueSlug} back={false}>{venue.data === null ? <p>没有找到这家店的记忆馆。</p> : <Loading />}</CustomerShell>;
  const v = venue.data;
  return (
    <div className="min-h-screen bg-background">
      <section className="venue-cover">
        <img src={tavernImage} width={1440} height={1024} alt="暖灯、窗边夜景与桌上的信封，演示酒馆场景" className="venue-cover-image" fetchPriority="high" />
        <div className="venue-cover-shade" />
        <div className="relative mx-auto max-w-5xl px-5 pt-6 md:px-10">
          <header className="flex items-center justify-between">
            <Link to="/" className="brand-sign"><span className="font-serif text-2xl italic">Moonlight ☾</span><span className="mt-1 block text-[10px]">M E M O R I E S</span></Link>
            <Link to="/studio" className="flex min-h-11 items-center gap-2 text-sm text-foreground/80">店主入口 <ArrowUpRight size={16} /></Link>
          </header>
          <div className="cover-title fade-up">
            <p className="mb-3 text-sm text-warm">GUIYANG · NIGHT STORIES</p>
            <h1 className="font-serif text-3xl md:text-5xl">{v.city} · {v.name.replace(/（演示）$/, "")}</h1>
            <p className="mt-4 font-serif text-base leading-7 text-foreground/90">{v.tagline}</p>
            <span className="mt-4 inline-block text-xs text-foreground/70">{v.isDemo && "门店与背景影像均为演示素材"}</span>
          </div>
        </div>
      </section>
      <main className="relative mx-auto -mt-16 max-w-5xl px-5 pb-16 md:px-10">
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <Btn aria-label="读一封过去的来信" onClick={draw} disabled={opening} variant="ghost" className="paper-card primary-paper !items-start !justify-between !rounded-lg !border-0 !p-5 !text-left !text-paper-text">
            <span><Mail className="mb-4 text-paper-muted" size={28} strokeWidth={1} /><span className="block font-serif text-lg md:text-2xl">读一封<br />过去的来信</span><span className="mt-3 block text-sm font-normal leading-6 text-paper-muted">陌生人的心话，<br />或许正好说给你听。</span></span><ArrowRight size={19} className="self-end" />
          </Btn>
          <Link to="/m/$venueSlug/write" params={{ venueSlug }} className="paper-card primary-paper p-5">
            <PenLine className="mb-4 text-paper-muted" size={28} strokeWidth={1} /><h2 className="font-serif text-lg md:text-2xl">留下今夜的<br />一句话</h2><p className="mt-3 text-sm leading-6 text-paper-muted">把此刻的心情，<br />留给下一个陌生人。</p><ArrowRight size={19} className="ml-auto mt-3" />
          </Link>
        </div>
        {error && <div className="mt-4"><ErrorNote msg={error} onRetry={draw} /></div>}
        {letter && <article className="paper-card envelope-open mt-5 p-6 md:p-8"><p className="mb-4 text-xs text-paper-muted">一封留给你的信 · {letter.isDemo && "演示内容"}</p><p className="font-serif text-lg leading-8">{letter.content}</p><div className="mt-5 flex items-center justify-between"><span className="text-sm text-paper-muted">—— {letter.penName}</span><Btn variant="ghost" onClick={draw}>再读一封 <ArrowRight size={16} className="ml-2" /></Btn></div><Link to="/m/$venueSlug/letters" params={{ venueSlug }} className="mt-4 inline-block text-sm underline underline-offset-4">写一封，留给下一位</Link></article>}
        {letter === null && <p className="py-5 text-sm text-muted-foreground">信箱暂时是空的，做第一个写信的人吧。</p>}
        <nav className="mt-3 grid grid-cols-3 gap-3 md:mt-5 md:gap-5">
          <Link to="/m/$venueSlug/activities" params={{ venueSlug }} onClick={() => { window.__lovableEvents?.track?.("lovable.interaction", { action: "open_activity", target: "tonight_activity" }); }} className="paper-card secondary-paper"><Music2 size={22} strokeWidth={1} /><h2>今晚的活动</h2><p>音乐 · 相遇</p><ArrowRight size={16} /></Link>
          <Link to="/m/$venueSlug/stories" params={{ venueSlug }} className="paper-card secondary-paper"><BookOpen size={22} strokeWidth={1} /><h2>本店的故事</h2><p>关于这盏灯</p><ArrowRight size={16} /></Link>
          <Link to="/account/memories" className="paper-card secondary-paper"><Bookmark size={22} strokeWidth={1} /><h2>我的记忆</h2><p>我留下的来信</p><ArrowRight size={16} /></Link>
        </nav>
        <section className="mt-10 border-b border-border pb-8">
          <div className="flex items-center justify-between"><h2 className="font-serif text-xl">今夜，在这里</h2><DemoBadge /></div><p className="mt-4 font-serif text-lg">{v.tonightEvent.title}</p><p className="mt-2 text-sm text-warm">{v.tonightEvent.time}</p><p className="mt-2 text-sm text-muted-foreground">{v.tonightEvent.note}</p>
        </section>
        <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-xl">被收藏的夜晚</h2><Link to="/m/$venueSlug/stories" params={{ venueSlug }} className="flex items-center gap-2 text-sm text-muted-foreground">全部故事 <ArrowRight size={16} /></Link></div><div className="mt-5 grid gap-4 md:grid-cols-2">{stories.data?.filter(s => s.featured).map(s => <Link key={s.id} to="/m/$venueSlug/stories/$storyId" params={{ venueSlug, storyId: s.id }} className="paper-card p-6"><p className="text-xs text-paper-muted">{s.date} · {s.isDemo && "演示内容"}</p><h3 className="mt-4 text-xl">{s.title}</h3><p className="mt-3 text-sm leading-7 text-paper-muted">{s.excerpt}</p><ArrowRight size={18} className="ml-auto mt-5" /></Link>)}</div></section>
        <section className="mt-9"><h2 className="text-xl">记忆墙的一角</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{notes.data?.slice(0,2).map(n => <div key={n.id} className="border-l border-warm/50 py-2 pl-5"><p className="font-serif leading-7">“{n.content}”</p><p className="mt-2 text-xs text-muted-foreground">{n.penName} · {n.isDemo && "演示内容"}</p></div>)}</div></section>
        <section className="mt-10"><h2 className="text-xl">十种方式，留住一个夜晚</h2><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{EXPERIENCES.map(e => <Link key={e.type} to="/m/$venueSlug/experiences/$type" params={{ venueSlug, type:e.type }} className="experience-entry"><span className="text-xs text-warm">{String(e.no).padStart(2,"0")}</span><h3 className="mt-3 text-base">{e.title}</h3><span className="mt-3 block text-xs text-muted-foreground">本地模拟 · 未上线</span></Link>)}</div></section>
        <footer className="mt-12 border-t border-border pt-8 text-center"><p className="font-serif text-lg italic text-warm">Moonlight Memories</p><p className="mt-3 text-xs text-muted-foreground">在每一个普通的夜晚，故事都值得被记住。</p></footer>
      </main>
    </div>
  );
}
