import { beforeEach, describe, expect, it } from "vitest";
import { MAX_LENGTH, repo, validateSubmission } from "@/lib/memories/repository";
import type { NewSubmission } from "@/lib/memories/types";

const input: NewSubmission = { venueSlug: "yeshi", kind: "note", content: "今晚的灯很暖。", penName: "路人", consentPublicDisplay: true };
beforeEach(() => localStorage.clear());

describe("Memory submission rules", () => {
  it("accepts 140 characters and rejects 141", () => {
    expect(MAX_LENGTH).toBe(140);
    expect(validateSubmission({ ...input, content: "灯".repeat(140) })).toBeNull();
    expect(validateSubmission({ ...input, content: "灯".repeat(141) })).not.toBeNull();
  });
  it("requires explicit venue display consent", () => {
    expect(validateSubmission({ ...input, consentPublicDisplay: false })).not.toBeNull();
  });
  it("blocks contact details in both content and pen names", () => {
    expect(validateSubmission({ ...input, content: "微信联系我" })).not.toBeNull();
    expect(validateSubmission({ ...input, penName: "12345678901" })).not.toBeNull();
  });
  it("keeps public submissions pending until review", async () => {
    const s = await repo.submit(input);
    expect(s.status).toBe("pending");
    expect((await repo.listApproved("yeshi", "note")).some(x => x.id === s.id)).toBe(false);
  });
  it("removes withdrawn content and prevents reapproval", async () => {
    const s = await repo.submit(input);
    await repo.review(s.id, "approved");
    expect((await repo.listApproved("yeshi", "note")).some(x => x.id === s.id)).toBe(true);
    await repo.withdraw(s.id);
    expect((await repo.listApproved("yeshi", "note")).some(x => x.id === s.id)).toBe(false);
    await expect(repo.review(s.id, "approved")).rejects.toThrow();
  });
  it("prevents withdrawal of another author's demo submission", async () => {
    await expect(repo.withdraw("d3")).rejects.toThrow();
    expect((await repo.listApproved("yeshi", "letter")).some(x => x.id === "d3")).toBe(true);
  });
  it("applies closed letter settings without blocking notes or reading", async () => {
    const settings = await repo.getSettings("yeshi");
    await repo.saveSettings("yeshi", { ...settings, allowLetters: false, displayName: "新的记忆馆" });
    await expect(repo.submit({ ...input, kind: "letter" })).rejects.toThrow();
    expect((await repo.submit(input)).status).toBe("pending");
    expect((await repo.listApproved("yeshi", "letter")).length).toBe(2);
    expect((await repo.getVenue("yeshi"))?.name).toBe("新的记忆馆");
  });
  it("does not draw the same letter consecutively when alternatives exist", async () => {
    const first = await repo.drawLetter("yeshi");
    const next = await repo.drawLetter("yeshi", first?.id);
    expect(first).not.toBeNull();
    expect(next).not.toBeNull();
    expect(next?.id).not.toBe(first?.id);
  });
  it("isolates public content between venues", async () => {
    expect(await repo.listApproved("other-venue", "letter")).toEqual([]);
    expect(await repo.getStory("other-venue", "s1")).toBeNull();
    expect(await repo.getExperienceScenes("other-venue")).toEqual({ tables: {}, timeline: [], stops: [] });
  });
});