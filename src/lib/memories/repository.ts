import { DEMO_STORIES, DEMO_SUBMISSIONS, DEMO_VENUES } from "./mock-data";
import type { NewSubmission, ReviewStatus, Story, Submission, Venue, VenueSettings } from "./types";

/**
 * Repository 接口：UI 只依赖此接口。
 * 当前实现：MockMemoriesRepository（浏览器 localStorage，模拟匿名会话）。
 * 后续：RemoteMemoriesRepository 调用服务端 API（匿名会话由服务端签发，密钥不进入浏览器）。
 */
export interface MemoriesRepository {
  getVenue(slug: string): Promise<Venue | null>;
  listStories(slug: string): Promise<Story[]>;
  getStory(slug: string, id: string): Promise<Story | null>;
  listApproved(slug: string, kind: Submission["kind"]): Promise<Submission[]>;
  drawLetter(slug: string): Promise<Submission | null>;
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
  if (!input.consentPublicDisplay) return "请先确认展示授权";
  return null;
}

const KEY = "moonlight-memories-mock-v1";
interface Store { submissions: Submission[]; mine: string[]; featured: Record<string, boolean>; settings: Record<string, VenueSettings> }

function load(): Store {
  const fresh: Store = { submissions: [...DEMO_SUBMISSIONS], mine: [], featured: {}, settings: {} };
  if (typeof window === "undefined") return fresh;
  try { const raw = localStorage.getItem(KEY); return raw ? { ...fresh, ...JSON.parse(raw) } : fresh; } catch { return fresh; }
}
function save(s: Store) { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(s)); }
const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 180));

class MockMemoriesRepository implements MemoriesRepository {
  async getVenue(slug: string) { return delay(DEMO_VENUES.find((v) => v.slug === slug) ?? null); }
  async listStories(slug: string) {
    const f = load().featured;
    return delay(DEMO_STORIES.filter((s) => s.venueSlug === slug).map((s) => ({ ...s, featured: f[s.id] ?? s.featured })));
  }
  async getStory(slug: string, id: string) { return delay((await this.listStories(slug)).find((s) => s.id === id) ?? null); }
  async listApproved(slug: string, kind: Submission["kind"]) {
    return delay(load().submissions.filter((s) => s.venueSlug === slug && s.kind === kind && s.status === "approved"));
  }
  async drawLetter(slug: string) {
    const all = await this.listApproved(slug, "letter");
    return all[Math.floor(Math.random() * all.length)] ?? null;
  }
  async submit(input: NewSubmission) {
    const err = validateSubmission(input);
    if (err) throw new Error(err);
    const st = load();
    const sub: Submission = { ...input, content: input.content.trim(), penName: input.penName.trim() || "匿名", id: crypto.randomUUID(), status: "pending", createdAt: new Date().toISOString(), isDemo: false };
    st.submissions.unshift(sub); st.mine.unshift(sub.id); save(st);
    return delay(sub);
  }
  async listMine() { const st = load(); return delay(st.submissions.filter((s) => st.mine.includes(s.id))); }
  async withdraw(id: string) { const st = load(); const s = st.submissions.find((x) => x.id === id); if (s) s.status = "withdrawn"; save(st); return delay(undefined); }
  async listForReview(slug: string) { return delay(load().submissions.filter((s) => s.venueSlug === slug)); }
  async review(id: string, status: "approved" | "rejected", reason?: string) {
    const st = load(); const s = st.submissions.find((x) => x.id === id);
    if (s && s.status !== "withdrawn") { s.status = status; if (reason) s.rejectReason = reason; else delete s.rejectReason; }
    save(st); return delay(undefined);
  }
  async setFeatured(storyId: string, featured: boolean) { const st = load(); st.featured[storyId] = featured; save(st); return delay(undefined); }
  async getSettings(slug: string) {
    const v = DEMO_VENUES.find((x) => x.slug === slug);
    return delay(load().settings[slug] ?? { requireReview: true as const, allowLetters: true, allowNotes: true, maxLength: MAX_LENGTH, displayName: v?.name ?? slug });
  }
  async saveSettings(slug: string, s: VenueSettings) { const st = load(); st.settings[slug] = { ...s, requireReview: true }; save(st); return delay(undefined); }
}

export const repo: MemoriesRepository = new MockMemoriesRepository();
