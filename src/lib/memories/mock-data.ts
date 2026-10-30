import type { Story, Submission, Venue } from "./types";

// 以下全部为演示内容，非真实顾客投稿或真实门店资料。
export const DEMO_VENUES: Venue[] = [
  {
    slug: "yeshi",
    name: "夜诗小馆（演示）",
    city: "贵阳",
    tagline: "让每一家酒馆，成为一座有记忆的空间。",
    mood: "南明河边的二楼，一盏暖灯，一张旧木长桌。",
    tonightEvent: { title: "周五 · 慢歌与故事", time: "21:00 – 23:30", note: "现场木吉他，中场读三封来信" },
    isDemo: true,
  },
];

const s = (id: string, title: string, excerpt: string, body: string[], author: string, date: string, tags: string[], featured = false): Story => ({
  id, venueSlug: "yeshi", title, excerpt, body, author, date, tags, featured, isDemo: true,
});

export const DEMO_STORIES: Story[] = [
  s("s1", "第三张桌子的生日", "她说今年不许愿了，结果全店一起唱了歌。", [
    "那晚雨很大，三号桌坐着两个人，一块很小的蛋糕。",
    "调酒师关掉了音乐，整间屋子安静了三秒，然后有人起头唱生日歌。",
    "她后来说，那是她来贵阳之后第一次觉得这座城市认识她。",
  ], "雨夜旅人", "2026-03-14", ["一张桌子的故事", "生日"], true),
  s("s2", "写给不会再来的人", "如果你看到这封信，说明这里还在。", [
    "我搬去南方了。走之前把常坐的位置拍了下来。",
    "如果你恰好坐在这里，替我点一杯桂花酒吧。",
  ], "北上的风", "2026-05-02", ["留给下一位"], true),
  s("s3", "店主手记：开店第一年", "第一年最怕的不是没人来，而是来了的人不再来。", [
    "我们开业那天只来了七位客人，其中三位是朋友。",
    "后来有人在墙上留了第一张纸条：『灯光很好，下次带朋友来。』",
    "这是我们决定做记忆馆的原因。",
  ], "店主（演示）", "2026-01-20", ["店主手记"]),
  s("s4", "青云路的凌晨两点", "散场之后，我们沿着河走了很久。", [
    "那天的乐队唱了一首没人听过的歌。",
    "我们走到甲秀楼，天快亮了，谁也没说再见。",
  ], "不睡的猫", "2026-07-08", ["贵阳故事漫游"]),
];

export const DEMO_SUBMISSIONS: Submission[] = [
  { id: "d1", venueSlug: "yeshi", kind: "note", content: "今天终于把辞职信交了，这杯敬自己。", penName: "新的开始", consentPublicDisplay: true, status: "approved", createdAt: "2026-10-28T22:10:00Z", isDemo: true },
  { id: "d2", venueSlug: "yeshi", kind: "note", content: "隔壁桌的笑声好好听。", penName: "路过", consentPublicDisplay: true, status: "approved", createdAt: "2026-10-27T21:40:00Z", isDemo: true },
  { id: "d3", venueSlug: "yeshi", kind: "letter", content: "给下一位坐在窗边的人：今晚的月亮很圆，记得抬头看一眼。", penName: "窗边的人", consentPublicDisplay: true, status: "approved", createdAt: "2026-10-20T23:00:00Z", isDemo: true },
  { id: "d4", venueSlug: "yeshi", kind: "letter", content: "如果你今天不太开心，没关系，这里的灯一直亮到凌晨两点。", penName: "某个周三", consentPublicDisplay: true, status: "approved", createdAt: "2026-10-15T22:00:00Z", isDemo: true },
  { id: "d5", venueSlug: "yeshi", kind: "note", content: "第一次一个人来喝酒，比想象中自在。", penName: "独酌", consentPublicDisplay: true, status: "pending", createdAt: "2026-10-30T13:00:00Z", isDemo: true },
  { id: "d6", venueSlug: "yeshi", kind: "letter", content: "加我微信 xxx，下次一起喝。", penName: "匿名", consentPublicDisplay: true, status: "pending", createdAt: "2026-10-30T12:00:00Z", isDemo: true },
];
