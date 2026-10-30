import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EXPERIENCES } from "@/lib/memories/experiences";
import { DEMO_STORIES, DEMO_SUBMISSIONS } from "@/lib/memories/mock-data";
import { Btn, CustomerShell, DemoBadge, MockBadge } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/experiences/$type")({
  head: () => ({
    meta: [
      { title: "记忆玩法 · Moonlight Memories" },
      { name: "description", content: "Moonlight Memories 互动玩法演示。" },
      { property: "og:title", content: "记忆玩法 · Moonlight Memories" },
      { property: "og:description", content: "Moonlight Memories 互动玩法演示。" },
    ],
  }),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { venueSlug, type } = Route.useParams();
  const exp = EXPERIENCES.find((e) => e.type === type);
  if (!exp)
    return (
      <CustomerShell slug={venueSlug}>
        <p className="py-12 text-center text-muted-foreground">没有这个玩法。</p>
      </CustomerShell>
    );
  const Demo = DEMOS[type];
  return (
    <CustomerShell slug={venueSlug} title={exp.title}>
      <div className="flex items-center gap-2">
        {exp.real ? <span className="text-xs text-success">核心功能</span> : <MockBadge />}
        <DemoBadge />
      </div>
      <h1 className="mt-3 text-2xl">{exp.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{exp.desc}</p>
      {!exp.real && (
        <p className="mt-3 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          此玩法为交互原型，数据仅保存在当前页面，刷新即消失，尚未作为真实服务上线。
        </p>
      )}
      <div className="mt-6">
        {exp.to === "write" && <GoTo slug={venueSlug} to="/m/$venueSlug/write" label="去写一句" />}
        {exp.to === "letters" && (
          <GoTo slug={venueSlug} to="/m/$venueSlug/letters" label="去写一封信" />
        )}
        {exp.to === "home" && <GoTo slug={venueSlug} to="/m/$venueSlug" label="进入记忆馆" />}
        {Demo && <Demo />}
      </div>
    </CustomerShell>
  );
}

function GoTo({
  slug,
  to,
  label,
}: {
  slug: string;
  to: "/m/$venueSlug/write" | "/m/$venueSlug/letters" | "/m/$venueSlug";
  label: string;
}) {
  return (
    <Link
      to={to}
      params={{ venueSlug: slug }}
      className="inline-flex min-h-11 items-center rounded-full bg-warm px-6 text-sm font-medium text-warm-foreground"
    >
      {label}
    </Link>
  );
}

function TimePost() {
  const [text, setText] = useState("");
  const [months, setMonths] = useState(12);
  const [sealed, setSealed] = useState(false);
  if (sealed)
    return (
      <div className="paper-card envelope-open p-6 text-center">
        <p className="font-serif text-xl">信已封存</p>
        <p className="mt-2 text-sm text-paper-muted">
          将于 {months} 个月后可拆（演示，不会真的寄出）
        </p>
        <button
          className="mt-4 underline text-sm"
          onClick={() => {
            setSealed(false);
            setText("");
          }}
        >
          再写一封
        </button>
      </div>
    );
  return (
    <div className="paper-card p-5">
      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="亲爱的未来的我："
        className="w-full resize-none bg-transparent font-serif text-lg placeholder:text-paper-muted focus:outline-none"
      />
      <div className="mt-3 flex gap-2">
        {[3, 6, 12].map((m) => (
          <button
            key={m}
            onClick={() => setMonths(m)}
            className={`min-h-11 flex-1 rounded-full border text-sm ${months === m ? "border-paper-text bg-paper-text text-paper" : "border-paper-text/30"}`}
          >
            {m} 个月
          </button>
        ))}
      </div>
      <Btn
        variant="primary"
        disabled={!text.trim()}
        onClick={() => setSealed(true)}
        className="mt-4 w-full"
      >
        封存
      </Btn>
    </div>
  );
}

function TableStory() {
  const [table, setTable] = useState<number | null>(null);
  const stories: Record<number, string> = {
    1: "这里求过一次婚（演示）。她答应了，然后两个人都哭了。",
    3: DEMO_STORIES[0]?.excerpt ?? "这张桌子上，有人留下一句话（演示）。",
    5: "常客老周每周五都坐这里，点同一杯金汤力（演示）。",
  };
  return (
    <div>
      <p className="text-sm text-muted-foreground">选择一张桌子（模拟扫桌码）：</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            onClick={() => setTable(n)}
            className={`min-h-16 rounded-xl border ${table === n ? "border-warm bg-warm/10" : "border-border bg-card"}`}
          >
            {n} 号桌
          </button>
        ))}
      </div>
      {table && (
        <div key={table} className="paper-card fade-up mt-5 p-5 font-serif leading-7">
          {stories[table] ?? "这张桌子还没有故事，也许今晚就会有。"}
        </div>
      )}
    </div>
  );
}

function CoWrite() {
  const [lines, setLines] = useState<string[]>(["那天晚上，灯忽然暗了一下。（演示开头）"]);
  const [t, setT] = useState("");
  return (
    <div>
      <div className="paper-card p-5 font-serif leading-8">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={t}
          onChange={(e) => setT(e.target.value)}
          maxLength={40}
          placeholder="接一句（40字内）"
          className="h-11 flex-1 rounded-full border border-input bg-transparent px-4 text-sm"
        />
        <Btn
          variant="warm"
          disabled={!t.trim()}
          onClick={() => {
            setLines([...lines, t.trim()]);
            setT("");
          }}
        >
          接上
        </Btn>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        正式版：每桌限一句，打烊后经店主审核成文。
      </p>
    </div>
  );
}

function OwnerNotes() {
  const s = DEMO_STORIES.find((x) => x.id === "s3")!;
  return (
    <article className="paper-card p-6">
      <h2 className="text-xl">{s.title}</h2>
      <div className="mt-4 space-y-3 font-serif leading-8">
        {s.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="mt-4 text-right text-sm text-paper-muted">{s.author}</p>
    </article>
  );
}

function Screening() {
  const items = DEMO_SUBMISSIONS.filter((s) => s.status === "approved");
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const total = items.length;
  useEffect(() => {
    if (!playing || total === 0) return;
    const id = setInterval(() => setI((x) => (x + 1) % total), 3500);
    return () => clearInterval(id);
  }, [playing, total]);
  const current = items[i] ?? items[0];
  const next = () => setI((x) => (total === 0 ? 0 : (x + 1) % total));
  return (
    <div>
      <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-background p-6 text-center">
        {current ? (
          <p key={i} className="fade-up font-serif text-xl leading-9">
            “{current.content}”<br />
            <span className="text-sm text-muted-foreground">—— {current.penName}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">暂时没有可放映的内容。</p>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <Btn variant="primary" disabled={total === 0} onClick={() => setPlaying(!playing)}>
          {playing ? "暂停" : "开始放映"}
        </Btn>
        <Btn variant="ghost" disabled={total === 0} onClick={next}>
          下一条
        </Btn>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">只轮播已审核且授权公开展示的内容。</p>
    </div>
  );
}

function Timeline() {
  const ev = [
    ["2025-10", "开业，第一晚七位客人"],
    ["2025-12", "第一张纸条贴上墙"],
    ["2026-03", "三号桌的生日"],
    ["2026-07", "第一次放映夜"],
    ["2026-10", "今晚"],
  ];
  return (
    <ol className="relative ml-3 border-l border-warm/50">
      {ev.map(([d, t]) => (
        <li key={d} className="mb-6 ml-5">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-warm" />
          <p className="text-xs text-warm">{d}</p>
          <p className="mt-1">{t}</p>
        </li>
      ))}
    </ol>
  );
}

function CityWalk() {
  const stops = [
    ["南明河", "河边的风把散场的人吹得很慢。"],
    ["甲秀楼", DEMO_STORIES[3]?.excerpt ?? "楼下的石阶被雨打湿（演示）。"],
    ["青云路", "凌晨两点，烧烤摊还在。"],
    ["回到小馆", "灯还亮着。"],
  ];
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="flex gap-1">
        {stops.map((_, k) => (
          <span key={k} className={`h-1 flex-1 rounded-full ${k <= i ? "bg-warm" : "bg-muted"}`} />
        ))}
      </div>
      <div key={i} className="paper-card fade-up mt-5 p-6">
        <p className="text-xs text-paper-muted">第 {i + 1} 站</p>
        <p className="mt-1 font-serif text-xl">{stops[i]?.[0] ?? ""}</p>
        <p className="mt-3 font-serif leading-7">{stops[i]?.[1] ?? ""}</p>
      </div>
      <div className="mt-4 flex gap-3">
        <Btn variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
          上一站
        </Btn>
        <Btn variant="warm" disabled={i === stops.length - 1} onClick={() => setI(i + 1)}>
          下一站
        </Btn>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">不使用定位，不显示他人位置。</p>
    </div>
  );
}

const DEMOS: Record<string, (() => React.ReactElement) | undefined> = {
  "time-post": TimePost,
  "table-story": TableStory,
  "co-write": CoWrite,
  "owner-notes": OwnerNotes,
  screening: Screening,
  timeline: Timeline,
  "city-walk": CityWalk,
};
