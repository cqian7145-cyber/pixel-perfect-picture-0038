import { DEMO_STORIES, DEMO_SUBMISSIONS, DEMO_VENUES } from "./mock-data";
import { ECHO_OPTIONS } from "./types";
import type { EchoText, LetterEcho, LetterMood, NewSubmission, ReviewStatus, Story, Submission, Venue, VenueSettings } from "./types";

/**
 * Repository 接口：UI 只依赖此接口。
 * 当前实现：MockMemoriesRepository（浏览器 localStorage，模拟匿名会话）。
 * 后续：RemoteMemoriesRepository 调用服务端 API（匿名会话由服务端签发，密钥不进入浏览器）。
 */
export interface MemoriesRepository {
  getExperienceScenes(slug: string): Promise<{ tables: Record<number, string>; timeline: { date: string; title: string; isDemo: boolean }[]; stops: { title: string; text: string; isDemo: boolean }[] }>;
  getVenue(slug: string): Promise<Venue | null>;
  listStories(slug: string): Promise<Story[]>;
  getStory(slug: string, id: string): Promise<Story | null>;
  listApproved(slug: string, kind: Submission["kind"]): Promise<Submission[]>;
  drawLetter(slug: string, excludeId?: string, mood?: LetterMood): Promise<Submission | null>;
  /** 读者给抽到的信留一个固定短句回音；仅作者本设备可见 */
  echoLetter(letterId: string, text: EchoText): Promise<void>;
  listEchoesForMine(): Promise<LetterEcho[]>;
  /** 北极星：近 N 周被后来客人抽到的客人信件数（不含演示信、不含自己写的信），按周一起算 */
  weeklyGuestLetterDraws(slug: string, weeks?: number): Promise<{ weekStart: string; count: number }[]>;
  submit(input: NewSubmission): Promise<Submission>;
  listMine(): Promise<Submission[]>;
  withdraw(id: string): Promise<void>;
  listForReview(slug: string): Promise<Submission[]>;
  review(id: string, status: Exclude<ReviewStatus, "withdrawn" | "pending">, reason?: string): Promise<void>;
  setFeatured(storyId: string, featured: boolean): Promise<void>;
  getSettings(slug: string): Promise<VenueSettings>;
  saveSettings(slug: string, s: VenueSettings): Promise<void>;
}

export const MAX_LENGTH = 140;

export function validateSubmission(input: NewSubmission): string | null {
  const text = input.content.trim();
  if (!text) return "请写下一句话";
  if (text.length > MAX_LENGTH) return `最多 ${MAX_LENGTH} 字`;
  if (/(微信|vx|wx|qq|电话|手机号|\d{7,})/i.test(text)) return "为保护隐私，请不要留下联系方式";
  if (/(微信|vx|wx|qq|电话|手机号|\d{7,})/i.test(input.penName)) return "笔名中请不要留下联系方式";
  if (input.penName.trim().length > 12) return "笔名最多 12 字";
  if (!input.consentPublicDisplay) return "请先确认展示授权";
  if (input.openOn) {
    if (input.kind !== "letter") return "只有来信可以定在某一天开启";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.openOn) || isNaN(Date.parse(input.openOn))) return "开启日期格式不对";
    if (input.openOn < localDay(new Date())) return "开启日期不能早于今天";
    if (input.openOn > localDay(new Date(Date.now() + 366 * 864e5))) return "开启日期最远一年内";
  }
  return null;
}

export function localDay(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function isOpen(s: Submission, now = new Date()) { return !s.openOn || s.openOn <= localDay(now); }

const KEY = "moonlight-memories-mock-v1";
interface DrawLog { slug: string; letterId: string; at: string }
interface Store { echoes?: LetterEcho[]; draws?: DrawLog[]; submissions: Submission[]; mine: string[]; featured: Record<string, boolean>; settings: Record<string, VenueSettings> }

function load(): Store {
  const fresh: Store = { submissions: DEMO_SUBMISSIONS.map(s => ({ ...s })), mine: [], featured: {}, settings: {} };
  if (typeof window === "undefined") return fresh;
  try { const raw = localStorage.getItem(KEY); return raw ? { ...fresh, ...JSON.parse(raw) } : fresh; } catch { return fresh; }
}
function save(s: Store) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(s)); }
  catch { throw new Error("本设备无法保存，请检查浏览器存储权限后重试。"); }
}
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 180));

class MockMemoriesRepository implements MemoriesRepository {
  async getExperienceScenes(slug: string) {
    if (!DEMO_VENUES.some(v => v.slug === slug)) return delay({ tables: {}, timeline: [], stops: [] });
    const stories = await this.listStories(slug);
    return delay({
      tables: { 1: "这里求过一次婚（演示）。她答应了，然后两个人都哭了。", 3: stories[0]?.excerpt ?? "暂无故事", 5: "常客每周五都坐这里，点同一杯金汤力（演示）。" },
      timeline: stories.slice().sort((a, b) => a.date.localeCompare(b.date)).map(s => ({ date: s.date, title: s.title, isDemo: s.isDemo })),
      stops: [{ title: "南明河", text: "河边的风把散场的人吹得很慢。", isDemo: true }, { title: "甲秀楼", text: stories[3]?.excerpt ?? "夜色里的城市。", isDemo: true }, { title: "青云路", text: "凌晨两点，街边的灯还亮着。", isDemo: true }, { title: "回到小馆", text: "灯还亮着。", isDemo: true }],
    });
  }
  async getVenue(slug: string) {
    const venue = DEMO_VENUES.find((v) => v.slug === slug);
    return delay(venue ? { ...venue, name: (await this.getSettings(slug)).displayName } : null);
  }
  async listStories(slug: string) {
    const f = load().featured;
    return delay(DEMO_STORIES.filter((s) => s.venueSlug === slug).map((s) => ({ ...s, featured: f[s.id] ?? s.featured })));
  }
  async getStory(slug: string, id: string) { return delay((await this.listStories(slug)).find((s) => s.id === id) ?? null); }
  async listApproved(slug: string, kind: Submission["kind"]) {
    return delay(load().submissions.filter((s) => s.venueSlug === slug && s.kind === kind && s.status === "approved" && s.consentPublicDisplay && isOpen(s)));
  }
  async echoLetter(letterId: string, text: EchoText) {
    if (!ECHO_OPTIONS.includes(text)) throw new Error("请从给出的回音里选一句。");
    const st = load(); const l = st.submissions.find(s => s.id === letterId);
    if (!l || l.kind !== "letter" || l.status !== "approved") throw new Error("这封信已经不在信箱里了。");
    if (st.mine.includes(letterId)) throw new Error("这是你自己写的信。");
    const echoes = st.echoes ?? [];
    if (echoes.some(e => e.letterId === letterId)) throw new Error("你已经给这封信留过回音了。");
    st.echoes = [...echoes, { id: crypto.randomUUID(), letterId, text, at: new Date().toISOString() }];
    save(st); return delay(undefined);
  }
  async listEchoesForMine() {
    const st = load();
    return delay((st.echoes ?? []).filter(e => st.mine.includes(e.letterId)));
  }
  async drawLetter(slug: string, excludeId?: string, mood?: LetterMood) {
    const all = (await this.listApproved(slug, "letter")).filter(s => !mood || s.mood === mood);
    const candidates = all.length > 1 ? all.filter((s) => s.id !== excludeId) : all;
    const letter = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
    if (letter && !letter.isDemo) {
      const st = load();
      if (!st.mine.includes(letter.id)) { st.draws = [...(st.draws ?? []), { slug, letterId: letter.id, at: new Date().toISOString() }]; save(st); }
    }
    return letter;
  }
  async weeklyGuestLetterDraws(slug: string, weeks = 8, now = new Date()) {
    return delay(weeklyBuckets((load().draws ?? []).filter(d => d.slug === slug).map(d => d.at), weeks, now));
  }
  async submit(input: NewSubmission) {
    const err = validateSubmission(input);
    if (err) throw new Error(err);
    if (!DEMO_VENUES.some((v) => v.slug === input.venueSlug)) throw new Error("没有找到这家店的记忆馆。");
    const settings = await this.getSettings(input.venueSlug);
    if (input.kind === "note" ? !settings.allowNotes : !settings.allowLetters) throw new Error("店主暂时关闭了此信箱，仍可阅读已公开的内容。");
    const st = load();
    const sub: Submission = { ...input, mood: input.kind === "letter" ? input.mood : undefined, openOn: input.kind === "letter" && input.openOn ? input.openOn : undefined, content: input.content.trim(), penName: input.penName.trim() || "匿名", id: crypto.randomUUID(), status: "pending", createdAt: new Date().toISOString(), isDemo: false };
    st.submissions.unshift(sub); st.mine.unshift(sub.id); save(st);
    return delay(sub);
  }
  async listMine() { const st = load(); return delay(st.submissions.filter((s) => st.mine.includes(s.id))); }
  async withdraw(id: string) {
    const st = load();
    if (!st.mine.includes(id)) throw new Error("只能撤回本设备上自己的投稿。");
    const s = st.submissions.find((x) => x.id === id);
    if (!s) throw new Error("未找到这条投稿。");
    s.status = "withdrawn"; save(st); return delay(undefined);
  }
  async listForReview(slug: string) { return delay(load().submissions.filter((s) => s.venueSlug === slug)); }
  async review(id: string, status: "approved" | "rejected", reason?: string) {
    const st = load(); const s = st.submissions.find((x) => x.id === id);
    if (!s || s.status !== "pending") throw new Error("投稿状态已变化，请刷新审核列表。");
    if (status === "approved" && !s.consentPublicDisplay) throw new Error("未获展示授权，不能公开。");
    s.status = status; if (reason) s.rejectReason = reason; else delete s.rejectReason;
    save(st); return delay(undefined);
  }
  async setFeatured(storyId: string, featured: boolean) {
    if (!DEMO_STORIES.some(s => s.id === storyId)) throw new Error("故事不存在或已下架。");
    const st = load(); st.featured[storyId] = featured; save(st); return delay(undefined);
  }
  async getSettings(slug: string) {
    const v = DEMO_VENUES.find((x) => x.slug === slug);
    return delay(load().settings[slug] ?? { requireReview: true as const, allowLetters: true, allowNotes: true, maxLength: MAX_LENGTH, displayName: v?.name ?? slug });
  }
  async saveSettings(slug: string, s: VenueSettings) {
    if (!DEMO_VENUES.some((v) => v.slug === slug)) throw new Error("没有找到这家店。");
    if (!s.displayName.trim()) throw new Error("请填写记忆馆显示名称。");
    const st = load(); st.settings[slug] = { ...s, displayName: s.displayName.trim(), maxLength: MAX_LENGTH, requireReview: true }; save(st); return delay(undefined);
  }
}

export const repo: MemoriesRepository = new MockMemoriesRepository();

/** 按周（周一 00:00 本地时间）统计，返回从旧到新 */
export function weeklyBuckets(times: string[], weeks: number, now: Date) {
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(monday); start.setDate(monday.getDate() - 7 * (weeks - 1 - i));
    const end = new Date(start); end.setDate(start.getDate() + 7);
    const count = times.filter(t => { const d = new Date(t); return d >= start && d < end; }).length;
    return { weekStart: `${start.getMonth() + 1}/${start.getDate()}`, count };
  });
}
