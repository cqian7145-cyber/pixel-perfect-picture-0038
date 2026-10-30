import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { repo } from "@/lib/memories/repository";
import { Btn, ErrorNote, Loading, StatusBadge, useLoad } from "@/components/memories/ui";

export const Route = createFileRoute("/account/memories")({
  head: () => ({
    meta: [
      { title: "我的记忆 · Moonlight Memories" },
      { name: "description", content: "查看你留下的句子与来信。" },
      { property: "og:title", content: "我的记忆" },
      { property: "og:description", content: "查看你留下的句子与来信。" },
      // 个人内容页不是公开页面：禁止收录。仅为提示，不构成访问控制。
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Mine,
});

function Mine() {
  // 原型：模拟登录。真实认证由现有 Moonlight 账号体系提供，未登录绝不展示任何数据。
  const [signedIn, setSignedIn] = useState(false);
  return (
    <div className="min-h-screen bg-night">
      <main className="mx-auto max-w-xl px-4 py-8">
        <Link
          to="/m/$venueSlug"
          params={{ venueSlug: "yeshi" }}
          className="text-sm text-muted-foreground"
        >
          ← 返回记忆馆
        </Link>
        <h1 className="mt-4 text-2xl">我的记忆</h1>
        {!signedIn ? (
          <div className="mt-8 rounded-xl bg-card p-6 text-center">
            <p>登录后查看你的投稿与审核状态。</p>
            <p className="mt-2 text-xs text-muted-foreground">
              原型阶段为模拟登录，仅显示本设备上的投稿。
            </p>
            <Btn className="mt-5" onClick={() => setSignedIn(true)}>
              模拟登录
            </Btn>
          </div>
        ) : (
          <MineList onSignOut={() => setSignedIn(false)} />
        )}
      </main>
    </div>
  );
}

function MineList({ onSignOut }: { onSignOut: () => void }) {
  const { data, error, reload } = useLoad(() => repo.listMine(), []);
  if (error) return <ErrorNote msg={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return (
    <div className="mt-6">
      {data.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">你还没有留下记忆。</p>
      ) : (
        <ul className="space-y-4">
          {data.map((s) => (
            <li key={s.id} className="paper-card p-5">
              <div className="flex items-center justify-between text-xs text-paper-muted">
                <span>
                  {s.kind === "note" ? "今夜留一句" : "留给下一位"} ·{" "}
                  {new Date(s.createdAt).toLocaleString("zh-CN")}
                </span>
                <StatusBadge status={s.status} />
              </div>
              <p className="mt-3 font-serif leading-7">{s.content}</p>
              {s.status === "rejected" && s.rejectReason && (
                <p className="mt-2 text-sm text-paper-muted">未通过原因：{s.rejectReason}</p>
              )}
              <p className="mt-2 text-xs text-paper-muted">
                授权：仅本店记忆馆匿名展示 · 不含商业广告
              </p>
              {(s.status === "pending" || s.status === "approved") && (
                <button
                  className="mt-3 min-h-11 text-sm underline"
                  onClick={async () => {
                    await repo.withdraw(s.id);
                    reload();
                  }}
                >
                  撤回
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Btn variant="ghost" className="mt-6" onClick={onSignOut}>
        退出
      </Btn>
    </div>
  );
}
