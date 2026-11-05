import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import { FriendRound } from "@/components/memories/FriendRound";
import { Btn, CustomerShell, ErrorNote, Loading, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/activities")({
  head: () => ({ meta: [{ title: "今晚的活动 · Moonlight Memories" }, { name: "description", content: "查看门店活动演示，自愿选择听歌、读信或与朋友玩一轮。" }, { property: "og:title", content: "今晚的活动 · Moonlight Memories" }, { property: "og:description", content: "安静听歌，读一封信，或与愿意的朋友玩一轮。" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Activities,
});

const step = (activity: "quiet" | "friend_round", step: string) => window.__lovableEvents?.track?.("project.activity_step", { activity, step, is_demo: true });

function Activities() {
  const { venueSlug } = Route.useParams();
  const { data, error, reload } = useLoad(() => repo.getVenue(venueSlug), [venueSlug]);
  const [mode, setMode] = useState<"quiet" | "friend">("quiet");
  return <CustomerShell slug={venueSlug} title="今晚的活动">
    {error ? <ErrorNote msg={error} onRetry={reload} /> : data === undefined ? <Loading /> : data === null ? <p className="text-muted-foreground">没有找到这家店的活动。</p> : <>
      <p className="text-xs text-warm">门店活动 · 演示内容</p><h1 className="mt-3 text-3xl">{data.tonightEvent.title}</h1>
      <p className="mt-4 text-warm">{data.tonightEvent.time}</p><p className="mt-3 leading-7 text-muted-foreground">{data.tonightEvent.note}</p>
      <p className="mt-4 border-b border-border pb-6 text-sm leading-7 text-muted-foreground">演示安排，非已确认场次；实际日期、演出授权与现场参与请以店内公告为准。不报名、不投稿，也可以只听歌。</p>
      <h2 className="mt-6 text-xl">今夜，按自己的心情来</h2>
      <div className="my-5 flex flex-wrap gap-3"><Btn variant={mode === "quiet" ? "primary" : "ghost"} aria-pressed={mode === "quiet"} onClick={() => { setMode("quiet"); step("quiet", "selected"); }}>自己安静待一会儿</Btn><Btn variant={mode === "friend" ? "primary" : "ghost"} aria-pressed={mode === "friend"} onClick={() => { setMode("friend"); step("friend_round", "selected"); }}>和朋友玩一轮</Btn></div>
      {mode === "friend" ? <FriendRound /> : <div className="border-t border-border pt-5"><p className="font-serif text-lg">听歌就好，或留一点今晚的心情。</p><div className="mt-5 flex flex-wrap gap-4"><Link to="/m/$venueSlug" params={{ venueSlug }} onClick={() => step("quiet", "completed")} className="min-h-11 py-3 text-sm underline underline-offset-4">回去读一封信</Link><Link to="/m/$venueSlug/write" params={{ venueSlug }} onClick={() => step("quiet", "completed")} className="min-h-11 py-3 text-sm underline underline-offset-4">留下今夜的一句话</Link><Link to="/m/$venueSlug/stories" params={{ venueSlug }} onClick={() => step("quiet", "completed")} className="min-h-11 py-3 text-sm underline underline-offset-4">读本店的故事</Link></div></div>}
    </>}
  </CustomerShell>;
}