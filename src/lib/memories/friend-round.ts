export const FRIEND_QUESTION = {
  title: "今晚，你更想怎样度过？",
  options: ["听歌，安静坐一会儿", "和朋友聊聊近况", "读一封信，留一句话"],
};

export interface FriendAnswer { own: number; prediction: number }

export function revealRound(a: FriendAnswer, b: FriendAnswer) {
  const valid = (n: number) => Number.isInteger(n) && n >= 0 && n < FRIEND_QUESTION.options.length;
  if (![a.own, a.prediction, b.own, b.prediction].every(valid)) throw new Error("请先完成两个人的选择。");
  return {
    aGuessed: a.prediction === b.own,
    bGuessed: b.prediction === a.own,
    sameChoice: a.own === b.own,
    prompt: a.own === b.own ? "你们选了相同的夜晚，是因为相同的理由吗？" : "你们选了不同的夜晚，今天发生了什么，让你想这样度过？",
  };
}