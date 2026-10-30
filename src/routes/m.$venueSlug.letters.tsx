import { createFileRoute } from "@tanstack/react-router";
import { SubmitForm } from "@/components/memories/SubmitForm";
import { CustomerShell } from "@/components/memories/ui";

export const Route = createFileRoute("/m/$venueSlug/letters")({
  head: () => ({
    meta: [
      { title: "留给下一位 · Moonlight Memories" },
      { name: "description", content: "写一封信，给下一位来到这里的陌生人。" },
      { property: "og:title", content: "留给下一位" },
      { property: "og:description", content: "写一封信，给下一位来到这里的陌生人。" },
    ],
  }),
  component: Letters,
});

function Letters() {
  const { venueSlug } = Route.useParams();
  return (
    <CustomerShell slug={venueSlug} title="留给下一位">
      <h1 className="text-2xl">写给下一位陌生人</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        你不会知道是谁读到它，对方也不会知道你是谁。信件匿名，不支持回复或私信。
      </p>
      <div className="mt-6">
        <SubmitForm slug={venueSlug} kind="letter" placeholder="给下一位坐在这里的人：" />
      </div>
    </CustomerShell>
  );
}
