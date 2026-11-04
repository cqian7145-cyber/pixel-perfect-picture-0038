import { describe, expect, it } from "vitest";
import { revealRound } from "@/lib/memories/friend-round";

describe("Voluntary friend round", () => {
  it("compares each prediction against the other person's actual answer", () => {
    const result = revealRound({ own: 0, prediction: 1 }, { own: 1, prediction: 2 });
    expect(result.aGuessed).toBe(true);
    expect(result.bGuessed).toBe(false);
    expect(result.sameChoice).toBe(false);
  });
  it("recognizes shared choices without assigning compatibility scores", () => {
    expect(revealRound({ own: 2, prediction: 2 }, { own: 2, prediction: 2 })).toMatchObject({ sameChoice: true, aGuessed: true, bGuessed: true });
  });
  it("requires complete valid choices before reveal", () => {
    expect(() => revealRound({ own: -1, prediction: 0 }, { own: 0, prediction: 0 })).toThrow();
    expect(() => revealRound({ own: 0, prediction: 3 }, { own: 0, prediction: 0 })).toThrow();
  });
});