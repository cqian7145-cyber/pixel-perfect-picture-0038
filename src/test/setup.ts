import "@testing-library/jest-dom/vitest";
import { randomUUID } from "node:crypto";

// jsdom 20 没有实现 crypto.randomUUID；浏览器在非安全上下文（http + 局域网 IP）下同样没有。
// 测试环境按 Node 的能力补齐，避免用例因环境差异而误判。
if (typeof globalThis.crypto?.randomUUID !== "function") {
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    configurable: true,
    value: () => randomUUID(),
  });
}

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
