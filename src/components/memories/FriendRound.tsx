import { useState } from "react";
import { FRIEND_QUESTION, revealRound, type FriendAnswer } from "@/lib/memories/friend-round";
import { Btn } from "./ui";

export function FriendRound() {
  const [phase, setPhase] = useState<"start" | "a" | "handoff" | "b" | "ready" | "result">("start");
  const [own, setOwn] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [a, setA] = useState<FriendAnswer | null>(null);
  const [b, setB] = useState<FriendAnswer | null>(null);
  const reset = () => { setPhase("start"); setOwn(null); setPrediction(null); setA(null); setB(null); };
  const result = a && b && phase === "result" ? revealRound(a, b) : null;

  return <section className="border-t border-border pt-6">
    <p className="text-xs text-warm">朋友自愿参与 · 演示内容</p>
    <h2 className="mt-3 text-2xl">猜猜彼此的今夜</h2>
    {phase === "start" && <div className="mt-4"><p className="text-sm leading-7 text-muted-foreground">两位朋友各选自己的答案，再猜对方的选择。答案只留在本页，不做匹配或性格评分。</p><Btn className="mt-4" onClick={() => setPhase("a")}>我们都愿意，开始一轮</Btn></div>}
    {(phase === "a" || phase === "b") && <div className="mt-5">
      <p className="mb-4 text-sm text-warm">{phase === "a" ? "朋友 A" : "朋友 B"} 的选择</p>
      <fieldset><legend className="font-serif text-lg">{FRIEND_QUESTION.title}</legend><div className="mt-3 grid gap-2">{FRIEND_QUESTION.options.map((label, i) => <Btn className="justify-start rounded-md text-left" variant={own === i ? "primary" : "ghost"} aria-pressed={own === i} key={label} onClick={() => setOwn(i)}>{label}</Btn>)}</div></fieldset>
      <fieldset className="mt-6"><legend className="font-serif text-lg">你猜对方会选哪一个？</legend><div className="mt-3 grid gap-2">{FRIEND_QUESTION.options.map((label, i) => <Btn className="justify-start rounded-md text-left" variant={prediction === i ? "warm" : "ghost"} aria-pressed={prediction === i} key={label} onClick={() => setPrediction(i)}>{label}</Btn>)}</div></fieldset>
      <Btn className="mt-5" disabled={own === null || prediction === null} onClick={() => { if (own === null || prediction === null) return; const answer = { own, prediction }; if (phase === "a") { setA(answer); setPhase("handoff"); } else { setB(answer); setPhase("ready"); } setOwn(null); setPrediction(null); }}>收好我的答案</Btn>
    </div>}
    {phase === "handoff" && <div className="mt-5"><p className="font-serif text-lg">A 的答案已收好</p><p className="mt-2 text-sm text-muted-foreground">现在把手机交给朋友 B，前一位的答案暂不展示。</p><Btn className="mt-4" onClick={() => setPhase("b")}>我是朋友 B，开始选择</Btn></div>}
    {phase === "ready" && <div className="mt-5"><p className="font-serif text-lg">两个人的答案都收好了</p><Btn className="mt-4" onClick={() => setPhase("result")}>我们一起揭晓</Btn></div>}
    {result && a && b && <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">{[{ name: "朋友 A", answer: a, guessed: result.aGuessed }, { name: "朋友 B", answer: b, guessed: result.bGuessed }].map(x => <article key={x.name} className="paper-card p-5"><h3 className="text-lg">{x.name}</h3><p className="mt-3 text-xs text-paper-muted">自己的选择</p><p className="mt-1 leading-7">{FRIEND_QUESTION.options[x.answer.own]}</p><p className="mt-3 text-xs text-paper-muted">猜对方的选择</p><p className="mt-1 leading-7">{FRIEND_QUESTION.options[x.answer.prediction]}</p><p className="mt-4 text-sm text-paper-muted">{x.guessed ? "这次猜中了" : "这次有点不一样"}</p></article>)}</div>
      <p className="mt-5 font-serif text-lg leading-8">{result.prompt}</p><Btn variant="ghost" className="mt-4" onClick={reset}>再来一轮</Btn>
    </div>}
    {phase !== "start" && <Btn variant="ghost" className="mt-5" onClick={reset}>结束这一轮</Btn>}
  </section>;
}