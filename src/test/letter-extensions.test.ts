import { beforeEach, describe, expect, it } from "vitest";
import { localDay, repo, validateSubmission } from "@/lib/memories/repository";
import type { NewSubmission } from "@/lib/memories/types";

const letter: NewSubmission = { venueSlug: "yeshi", kind: "letter", content: "给下一位：慢慢来。", penName: "路人", consentPublicDisplay: true };
beforeEach(() => localStorage.clear());
const tomorrow = () => localDay(new Date(Date.now() + 864e5));

describe("留给下一位 extensions", () => {
  it("draws only letters matching the chosen mood", async () => {
    for (let i = 0; i < 10; i++) expect((await repo.drawLetter("yeshi", undefined, "courage"))?.id).toBe("d4");
    expect(await repo.drawLetter("yeshi", undefined, "missing")).toBeNull();
  });
  it("keeps a dated letter out of draws until its day", async () => {
    const s = await repo.submit({ ...letter, openOn: tomorrow() });
    await repo.review(s.id, "approved");
    expect((await repo.listApproved("yeshi", "letter")).some(x => x.id === s.id)).toBe(false);
  });
  it("rejects past open dates and dates on notes", () => {
    expect(validateSubmission({ ...letter, openOn: "2020-01-01" })).not.toBeNull();
    expect(validateSubmission({ ...letter, kind: "note", openOn: tomorrow() })).not.toBeNull();
  });
  it("lets a reader echo once with a preset phrase, never on their own letter", async () => {
    const s = await repo.submit(letter);
    await expect(repo.echoLetter(s.id, "抱抱你")).rejects.toThrow();
    await expect(repo.echoLetter("d3", "随便写的话" as never)).rejects.toThrow();
    await repo.echoLetter("d3", "抱抱你");
    await expect(repo.echoLetter("d3", "我也是这样")).rejects.toThrow();
  });
});
