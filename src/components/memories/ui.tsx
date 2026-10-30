import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import type { ReviewStatus } from "@/lib/memories/types";

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setError(null);
    fn()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { data, error, reload: () => setTick((t) => t + 1) };
}

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-warm/50 px-2 py-0.5 text-[11px] text-warm ${className}`}
    >
      演示内容
    </span>
  );
}
export function MockBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
      本地模拟 · 未上线
    </span>
  );
}

const STATUS: Record<ReviewStatus, { label: string; cls: string }> = {
  pending: { label: "审核中", cls: "bg-warm/20 text-warm" },
  approved: { label: "已公开", cls: "bg-success/15 text-success" },
  rejected: { label: "未通过", cls: "bg-destructive/15 text-destructive" },
  withdrawn: { label: "已撤回", cls: "bg-muted text-muted-foreground" },
};
export function StatusBadge({ status }: { status: ReviewStatus }) {
  const s = STATUS[status];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.label}</span>;
}

export function CustomerShell({
  slug,
  title,
  children,
  back = true,
}: {
  slug: string;
  title?: string;
  children: ReactNode;
  back?: boolean;
}) {
  return (
    <div className="min-h-screen bg-night">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90">
        <div className="mx-auto flex h-14 max-w-xl items-center gap-3 px-4">
          {back ? (
            <Link
              to="/m/$venueSlug"
              params={{ venueSlug: slug }}
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="返回记忆馆"
            >
              ←
            </Link>
          ) : (
            <span className="font-serif text-lg">☾</span>
          )}
          <span className="font-serif text-base">{title ?? "Moonlight Memories"}</span>
          <Link
            to="/account/memories"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            我的记忆
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16 pt-6">{children}</main>
    </div>
  );
}

export function Loading() {
  return <p className="py-12 text-center text-sm text-muted-foreground">正在点灯…</p>;
}
export function ErrorNote({ msg, onRetry }: { msg: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">
      {msg}{" "}
      {onRetry && (
        <button onClick={onRetry} className="ml-2 underline">
          重试
        </button>
      )}
    </div>
  );
}

export function Btn({
  variant = "primary",
  className = "",
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "warm" | "ghost" | "danger";
}) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    warm: "bg-warm text-warm-foreground hover:bg-warm/90",
    ghost: "border border-border text-foreground hover:bg-accent",
    danger: "border border-destructive/50 text-destructive hover:bg-destructive/10",
  }[variant];
  return (
    <button
      {...p}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-colors disabled:opacity-50 ${v} ${className}`}
    />
  );
}
