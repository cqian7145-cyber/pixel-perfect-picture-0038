export interface Experience {
  type: string;
  no: number;
  title: string;
  desc: string;
  real: boolean; // 后续接入真实后端
  to?: "write" | "letters" | "home";
}

export const EXPERIENCES: Experience[] = [
  {
    no: 1,
    type: "tonight-note",
    title: "今夜留一句",
    desc: "写下今晚的一句话，审核后挂上记忆墙。",
    real: true,
    to: "write",
  },
  {
    no: 2,
    type: "memory-hall",
    title: "月光记忆馆",
    desc: "本店的故事与来信，安静地陈列。",
    real: true,
    to: "home",
  },
  {
    no: 3,
    type: "next-guest",
    title: "留给下一位",
    desc: "写一封信给未来坐在这里的陌生人。",
    real: true,
    to: "letters",
  },
  {
    no: 4,
    type: "time-post",
    title: "时光邮局",
    desc: "写给一年后的自己，到期再拆。",
    real: false,
  },
  {
    no: 5,
    type: "table-story",
    title: "一张桌子的故事",
    desc: "扫桌上的码，读这张桌子经历过的夜晚。",
    real: false,
  },
  {
    no: 6,
    type: "co-write",
    title: "今夜共同写一篇",
    desc: "全场接龙，每桌一句，打烊时成文。",
    real: false,
  },
  { no: 7, type: "owner-notes", title: "店主手记", desc: "店主写给常客的话。", real: false },
  {
    no: 8,
    type: "screening",
    title: "回忆放映夜",
    desc: "在大屏上轮播已授权的来信与故事。",
    real: false,
  },
  {
    no: 9,
    type: "timeline",
    title: "酒馆时间长河",
    desc: "从开业第一天到今晚的时间线。",
    real: false,
  },
  {
    no: 10,
    type: "city-walk",
    title: "贵阳故事漫游",
    desc: "跟着故事走一段城市夜路。",
    real: false,
  },
];
