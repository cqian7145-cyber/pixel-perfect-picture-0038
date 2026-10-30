import { beforeEach, describe, expect, it } from "vitest";
import { MAX_LENGTH, repo, validateSubmission } from "@/lib/memories/repository";
import type { NewSubmission, VenueSettings } from "@/lib/memories/types";

/**
 * MockMemoriesRepository 的回归测试。
 * 只覆盖领域规则（校验 / 状态流转 / 审核 / 归属），不依赖真实数据库与浏览器 UI。
 * 当前实现把数据写在 localStorage：每个用例前清空，保证与演示数据的初始状态一致。
 */

const VENUE = "yeshi";

const validInput: NewSubmission = {
  venueSlug: VENUE,
  kind: "note",
  content: "今晚的风有点凉，但灯很暖。",
  penName: "小满",
  consentPublicDisplay: true,
};

beforeEach(() => {
  localStorage.clear();
});

describe("投稿校验 validateSubmission", () => {
  it("拒绝空内容", () => {
    expect(validateSubmission({ ...validInput, content: "   " })).toBe("请写下一句话");
  });

  it("拒绝超过字数上限的内容", () => {
    const tooLong = "灯".repeat(MAX_LENGTH + 1);
    expect(validateSubmission({ ...validInput, content: tooLong })).toBe(`最多 ${MAX_LENGTH} 字`);
  });

  it("正好等于上限时通过", () => {
    expect(validateSubmission({ ...validInput, content: "灯".repeat(MAX_LENGTH) })).toBeNull();
  });

  it("拒绝联系方式（微信号 / 长数字串）", () => {
    expect(validateSubmission({ ...validInput, content: "加我微信聊" })).toContain("联系方式");
    expect(validateSubmission({ ...validInput, content: "电话 13800138000" })).toContain(
      "联系方式",
    );
  });

  it("未确认公开展示授权时拒绝", () => {
    expect(validateSubmission({ ...validInput, consentPublicDisplay: false })).toBe(
      "请先确认展示授权",
    );
  });

  it("合法内容通过", () => {
    expect(validateSubmission(validInput)).toBeNull();
  });

  it("提交非法内容时 repository 抛出校验错误，且不写入任何数据", async () => {
    await expect(repo.submit({ ...validInput, content: "" })).rejects.toThrow("请写下一句话");
    expect(await repo.listMine()).toHaveLength(0);
  });
});

describe("投稿状态流转", () => {
  it("新投稿状态为 pending、isDemo 为 false，并进入「我的投稿」", async () => {
    const created = await repo.submit(validInput);
    expect(created.status).toBe("pending");
    expect(created.isDemo).toBe(false);
    expect(created.content).toBe(validInput.content.trim());

    const mine = await repo.listMine();
    expect(mine.map((s) => s.id)).toContain(created.id);
  });

  it("未填笔名时落为「匿名」", async () => {
    const created = await repo.submit({ ...validInput, penName: "   " });
    expect(created.penName).toBe("匿名");
  });

  it("pending 的投稿不会出现在公开列表里", async () => {
    const created = await repo.submit(validInput);
    const approved = await repo.listApproved(VENUE, "note");
    expect(approved.map((s) => s.id)).not.toContain(created.id);
  });

  it("撤回后状态为 withdrawn，且从公开列表消失", async () => {
    const created = await repo.submit(validInput);
    await repo.withdraw(created.id);

    const mine = await repo.listMine();
    expect(mine.find((s) => s.id === created.id)?.status).toBe("withdrawn");
    const approved = await repo.listApproved(VENUE, "note");
    expect(approved.map((s) => s.id)).not.toContain(created.id);
  });

  it("撤回不存在的 id 不抛错（幂等）", async () => {
    await expect(repo.withdraw("no-such-id")).resolves.toBeUndefined();
  });
});

describe("模拟审核流程", () => {
  it("审核列表包含本店的待审与已公开内容", async () => {
    const list = await repo.listForReview(VENUE);
    expect(list.some((s) => s.status === "pending")).toBe(true);
    expect(list.some((s) => s.status === "approved")).toBe(true);
    expect(list.every((s) => s.venueSlug === VENUE)).toBe(true);
  });

  it("通过后进入公开列表", async () => {
    const created = await repo.submit(validInput);
    await repo.review(created.id, "approved");

    const approved = await repo.listApproved(VENUE, "note");
    expect(approved.map((s) => s.id)).toContain(created.id);
    expect(approved.find((s) => s.id === created.id)?.status).toBe("approved");
  });

  it("拒绝时记录原因，且不公开", async () => {
    const created = await repo.submit({ ...validInput, content: "这是一段待拒绝的留言。" });
    await repo.review(created.id, "rejected", "涉及他人隐私");

    const mine = await repo.listMine();
    const stored = mine.find((s) => s.id === created.id);
    expect(stored?.status).toBe("rejected");
    expect(stored?.rejectReason).toBe("涉及他人隐私");

    const approved = await repo.listApproved(VENUE, "note");
    expect(approved.map((s) => s.id)).not.toContain(created.id);
  });

  it("先拒绝再通过时，拒绝原因被清除", async () => {
    const created = await repo.submit(validInput);
    await repo.review(created.id, "rejected", "理由 A");
    await repo.review(created.id, "approved");

    const mine = await repo.listMine();
    const stored = mine.find((s) => s.id === created.id);
    expect(stored?.status).toBe("approved");
    expect(stored?.rejectReason).toBeUndefined();
  });

  it("已撤回的投稿不能再被审核", async () => {
    const created = await repo.submit(validInput);
    await repo.withdraw(created.id);
    await repo.review(created.id, "approved");

    const mine = await repo.listMine();
    expect(mine.find((s) => s.id === created.id)?.status).toBe("withdrawn");
  });
});

describe("空数据与未知门店", () => {
  it("没有信件的门店返回空列表，拆信返回 null", async () => {
    const letters = await repo.listApproved("venue-with-no-letters", "letter");
    expect(letters).toEqual([]);
    await expect(repo.drawLetter("venue-with-no-letters")).resolves.toBeNull();
  });

  it("未知门店 getVenue 返回 null", async () => {
    await expect(repo.getVenue("no-such-venue")).resolves.toBeNull();
  });

  it("未知门店不会返回任何故事", async () => {
    expect(await repo.listStories("no-such-venue")).toEqual([]);
    await expect(repo.getStory(VENUE, "no-such-story")).resolves.toBeNull();
  });

  it("未知门店的设置回退到 slug 作为显示名", async () => {
    const settings = await repo.getSettings("no-such-venue");
    expect(settings.displayName).toBe("no-such-venue");
    expect(settings.requireReview).toBe(true);
  });

  // ↓ 已知缺陷（MEM-000 E-10）：未知门店既不会抛错也不会被拦截，页面只是渲染空态。
  //   真实数据层（MEM-002）应以 404 / NotFoundError 结束请求，因此这里先记录待实现项。
  it.todo("未知门店的读写应被拒绝（抛 NotFound），而不是静默返回空数据");
  it.todo("向未知门店提交投稿应被拒绝（当前实现会接受任意 venueSlug）");
});

describe("门店设置", () => {
  it("默认开启审核、两种玩法都开放、字数上限与 MAX_LENGTH 一致", async () => {
    const settings = await repo.getSettings(VENUE);
    expect(settings.requireReview).toBe(true);
    expect(settings.allowLetters).toBe(true);
    expect(settings.allowNotes).toBe(true);
    expect(settings.maxLength).toBe(MAX_LENGTH);
    expect(settings.displayName).toBe("夜诗小馆（演示）");
  });

  it("保存后可以读回", async () => {
    const current = await repo.getSettings(VENUE);
    await repo.saveSettings(VENUE, {
      ...current,
      displayName: "夜诗小馆 · 新招牌",
      allowNotes: false,
    });

    const saved = await repo.getSettings(VENUE);
    expect(saved.displayName).toBe("夜诗小馆 · 新招牌");
    expect(saved.allowNotes).toBe(false);
  });

  it("无论传入什么，requireReview 都被强制为 true", async () => {
    const current = await repo.getSettings(VENUE);
    // @ts-expect-error requireReview 在类型上只允许 true，这里故意传入 false 验证服务端约束
    const unsafe: VenueSettings = { ...current, requireReview: false };
    await repo.saveSettings(VENUE, unsafe);

    const saved = await repo.getSettings(VENUE);
    expect(saved.requireReview).toBe(true);
  });
});
