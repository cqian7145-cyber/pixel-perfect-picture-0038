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
}

export interface NewSubmission {
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
