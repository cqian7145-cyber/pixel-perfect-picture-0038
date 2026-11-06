export type ReviewStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface Venue {
  slug: string;
  name: string;
  city: string;
  tagline: string;
  mood: string;
  tonightEvent: { title: string; time: string; note: string };
  isDemo: boolean;
}

export interface Story {
  id: string;
  venueSlug: string;
  title: string;
  excerpt: string;
  body: string[];
  author: string; // 匿名笔名
  date: string;
  tags: string[];
  featured: boolean;
  isDemo: boolean;
}

/** 投稿：今夜留一句 / 留给下一位 共用 */
export interface Submission {
  id: string;
  venueSlug: string;
  kind: "note" | "letter";
  content: string;
  penName: string;
  /** 授权：允许在本店记忆馆公开展示（不包含商业广告使用） */
  consentPublicDisplay: boolean;
  status: ReviewStatus;
  rejectReason?: string;
  createdAt: string;
  isDemo: boolean;
  /** 仅「留给下一位」：信的心情，用于按心情抽信 */
  mood?: LetterMood;
  /** 仅「留给下一位」：YYYY-MM-DD，到这天才可能被抽到 */
  openOn?: string;
}

export type LetterMood = "gentle" | "courage" | "quiet" | "missing";
export const LETTER_MOODS: { id: LetterMood; label: string }[] = [
  { id: "gentle", label: "想听温柔的话" }, { id: "courage", label: "想被鼓励" }, { id: "quiet", label: "想安静一下" }, { id: "missing", label: "有点想念谁" },
];
/** 回音只能从固定短句里选，不需审核、不会公开，也无法用来留联系方式 */
export const ECHO_OPTIONS = ["收到了，谢谢你", "今晚刚好需要这句", "我也是这样", "抱抱你"] as const;
export type EchoText = (typeof ECHO_OPTIONS)[number];
export interface LetterEcho { id: string; letterId: string; text: EchoText; at: string }

export interface NewSubmission {
  mood?: LetterMood;
  openOn?: string;
  venueSlug: string;
  kind: "note" | "letter";
  content: string;
  penName: string;
  consentPublicDisplay: boolean;
}

export interface VenueSettings {
  requireReview: true;
  allowLetters: boolean;
  allowNotes: boolean;
  maxLength: number;
  displayName: string;
}
