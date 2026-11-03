import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EXPERIENCES } from "@/lib/memories/experiences";
import { MAX_LENGTH, repo } from "@/lib/memories/repository";
import { Btn, CustomerShell, DemoBadge, ErrorNote, Loading, MockBadge, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/experiences/$type")({
  head: () => ({ meta: [{ title: "记忆玩法 · Moonlight Memories" }, { name: "description", content: "Moonlight Memories 互动玩法演示。" }, { property: "og:title", content: "记忆玩法 · Moonlight Memories" }, { property: "og:description", content: "Moonlight Memories 互动玩法演示。" }] }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { venueSlug, type } = Route.useParams();
  const exp = EXPERIENCES.find((e) => e.type === type);
  if (!exp) return <CustomerShell slug={venueSlug}><p className="py-12 text-center text-muted-foreground">没有这个玩法。</p></CustomerShell>;
  const Demo = DEMOS[type];
  return (
    <CustomerShell slug={venueSlug} title={exp.title}>
      <div className="flex items-center gap-2">{exp.real ? <span className="text-xs text-success">核心功能</span> : <MockBadge />}<DemoBadge /></div>
      <h1 className="mt-3 text-2xl">{exp.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{exp.desc}</p>
      {!exp.real && <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">此玩法为交互原型，数据仅保存在当前页面，刷新即消失，尚未作为真实服务上线。</p>}
      <div className="mt-6">
        {exp.to === "write" && <GoTo slug={venueSlug} to="/m/$venueSlug/write" label="去写一句" />}
        {exp.to === "letters" && <GoTo slug={venueSlug} to="/m/$venueSlug/letters" label="去写一封信" />}
        {exp.to === "home" && <GoTo slug={venueSlug} to="/m/$venueSlug" label="进入记忆馆" />}
        {Demo && <Demo key={`${venueSlug}-${type}`} slug={venueSlug} />}
      </div>
    </CustomerShell>
  );
}

function GoTo({ slug, to, label }: { slug: string; to: "/m/$venueSlug/write" | "/m/$venueSlug/letters" | "/m/$venueSlug"; label: string }) {
  return <Link to={to} params={{ venueSlug: slug }} className="inline-flex min-h-11 items-center rounded-full bg-warm px-6 text-sm font-medium text-warm-foreground">{label}</Link>;
}

function TimePost() {
  const [text, setText] = useState(""); const [months, setMonths] = useState(12); const [sealed, setSealed] = useState(false); const [opened, setOpened] = useState(false);
  if (sealed) return <div className="paper-card envelope-open p-6 text-center"><p className="font-serif text-xl">{opened ? "给未来的自己" : "信已封存"}</p><p className="mt-2 text-sm text-paper-muted">{months} 个月后的来信 · 演示，不会真的寄出</p>{opened && <p className="mt-5 whitespace-pre-wrap break-words text-left font-serif text-lg leading-8">{text}</p>}<div className="mt-5 flex flex-wrap justify-center gap-3"><Btn variant="ghost" onClick={() => setOpened(!opened)}>{opened ? "合上信封" : "现在拆开看看"}</Btn><Btn variant="ghost" onClick={() => { setSealed(false); setOpened(false); }}>修改这封信</Btn></div></div>;
  return (
    <div className="paper-card p-5">
      <textarea aria-label="给未来自己的信" maxLength={MAX_LENGTH} rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="亲爱的未来的我：" className="w-full resize-none bg-transparent font-serif text-lg placeholder:text-paper-muted focus:outline-none" />
      <p className="text-right text-xs text-paper-muted">{text.length}/{MAX_LENGTH}</p><div className="mt-3 flex gap-2">{[3, 6, 12].map((m) => <Btn variant="ghost" aria-pressed={months === m} key={m} onClick={() => setMonths(m)} className={`min-h-11 flex-1 rounded-full border text-sm ${months === m ? "border-paper-text bg-paper-text text-paper" : "border-paper-text/30"}`}>{m} 个月</Btn>)}</div>
      <Btn variant="primary" disabled={!text.trim()} onClick={() => setSealed(true)} className="mt-4 w-full">封存</Btn>
    </div>
  );
}

function TableStory({ slug }: { slug: string }) {
  const [table, setTable] = useState<number | null>(null);
  const { data, error, reload } = useLoad(() => repo.getExperienceScenes(slug), [slug]);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return <div><div className="grid grid-cols-3 gap-3">{[1, 2, 3, 4, 5, 6].map(n => <Btn key={n} variant={table === n ? "warm" : "ghost"} aria-pressed={table === n} onClick={() => setTable(n)} className="min-h-16 rounded-lg">{n} 号桌</Btn>)}</div>{table && <div key={table} className="paper-card fade-up mt-5 p-5 font-serif leading-7"><p className="mb-3 text-xs text-paper-muted">{table} 号桌 · 演示内容</p>{data.tables[table] ?? "这张桌子还没有故事，也许今晚就会有。"}</div>}</div>;
}

function CoWrite() {
  const [lines, setLines] = useState<string[]>(["那天晚上，灯忽然暗了一下。（演示开头）"]); const [t, setT] = useState("");
  return (
    <div>
      <div className="paper-card p-5 font-serif leading-8">{lines.map((l, i) => <p key={i}>{l}</p>)}</div>
      <div className="mt-4 flex gap-2">
        <input value={t} onChange={(e) => setT(e.target.value)} maxLength={40} placeholder="接一句（40字内）" aria-label="续写一句" className="h-11 min-w-0 flex-1 rounded-full border border-input bg-transparent px-4 text-sm" />
        <Btn variant="warm" disabled={!t.trim()} onClick={() => { setLines([...lines, t.trim()]); setT(""); }}>接上</Btn>
      </div>
      <Btn variant="ghost" className="mt-4" disabled={lines.length === 1} onClick={() => { setLines(["那天晚上，灯忽然暗了一下。（演示开头）"]); setT(""); }}>重新开始</Btn><p className="mt-2 text-xs text-muted-foreground">正式版：每桌限一句，打烊后经店主审核成文。</p>
    </div>
  );
}

function OwnerNotes({ slug }: { slug: string }) {
  const { data, error, reload } = useLoad(async () => (await repo.listStories(slug)).find(s => s.tags.includes("店主手记")) ?? null, [slug]);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (data === undefined) return <Loading />;
  if (!data) return <p className="text-muted-foreground">店主还没有留下手记。</p>;
  return <article className="paper-card p-6"><h2 className="text-xl">{data.title}</h2><div className="mt-4 space-y-3 font-serif leading-8">{data.body.map((p, i) => <p key={i}>{p}</p>)}</div><p className="mt-4 text-right text-sm text-paper-muted">{data.author}</p></article>;
}

function Screening({ slug }: { slug: string }) {
  const { data, error, reload } = useLoad(() => repo.listApproved(slug, "note"), [slug]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const length = data?.length ?? 0;
  useEffect(() => { if (!playing || length < 2) return; const id = setInterval(() => setI(x => (x + 1) % length), 6000); return () => clearInterval(id); }, [playing, length]);
  useEffect(() => { if (!playing) return; const pause = () => { if (document.hidden) setPlaying(false); }; document.addEventListener("visibilitychange", pause); return () => document.removeEventListener("visibilitychange", pause); }, [playing]);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  const item = data.length ? data[i % data.length] : undefined;
  return <div><div className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-background p-6 text-center">{item ? <div key={item.id} className="fade-up"><p className="whitespace-pre-wrap break-words font-serif text-lg leading-8">“{item.content}”</p><p className="mt-4 text-sm text-muted-foreground">—— {item.penName}{item.isDemo && " · 演示内容"}</p></div> : <p className="text-muted-foreground">暂无已审核且授权的文字。</p>}</div><div className="mt-4 flex flex-wrap gap-3"><Btn disabled={length < 2} onClick={() => setPlaying(!playing)}>{playing ? "暂停" : "开始放映"}</Btn><Btn variant="ghost" disabled={length < 2} onClick={() => setI(x => (x + 1) % length)}>下一条</Btn><Btn variant="ghost" onClick={() => { setPlaying(false); setI(0); reload(); }}>刷新内容</Btn></div><p className="mt-3 text-xs text-muted-foreground">{length > 0 ? `${i % length + 1} / ${length}` : "0 / 0"}</p></div>;
}

function Timeline({ slug }: { slug: string }) {
  const { data, error, reload } = useLoad(() => repo.getExperienceScenes(slug), [slug]);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return <ol className="relative ml-3 border-l border-warm/50">{data.timeline.map(e => <li key={e.date} className="mb-6 ml-5"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-warm" /><p className="text-xs text-warm">{e.date}{e.isDemo && " · 演示内容"}</p><p className="mt-1">{e.title}</p></li>)}</ol>;
}

function CityWalk({ slug }: { slug: string }) {
  const { data, error, reload } = useLoad(() => repo.getExperienceScenes(slug), [slug]);
  const [i, setI] = useState(0);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  const stop = data.stops[i];
  if (!stop) return <p className="text-muted-foreground">暂无漫游故事。</p>;
  return <div><div className="flex gap-1">{data.stops.map((_, k) => <span key={k} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-warm" : "bg-muted"}`} />)}</div><div key={i} className="paper-card fade-up mt-5 p-6"><p className="text-xs text-paper-muted">第 {i + 1} / {data.stops.length} 站 · 演示内容</p><h2 className="mt-2 text-xl">{stop.title}</h2><p className="mt-3 font-serif leading-7">{stop.text}</p></div><div className="mt-4 flex gap-3"><Btn variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>上一站</Btn>{i === data.stops.length - 1 ? <Btn variant="warm" onClick={() => setI(0)}>再走一遍</Btn> : <Btn variant="warm" onClick={() => setI(i + 1)}>下一站</Btn>}</div><p className="mt-3 text-xs text-muted-foreground">不使用定位，不显示他人位置。</p></div>;
}

const DEMOS: Record<string, React.ComponentType<{ slug: string }> | undefined> = {
  "time-post": TimePost, "table-story": TableStory, "co-write": CoWrite, "owner-notes": OwnerNotes, screening: Screening, timeline: Timeline, "city-walk": CityWalk,
};
