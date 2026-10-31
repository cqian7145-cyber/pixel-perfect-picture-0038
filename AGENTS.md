<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- UI talks to data only through `src/lib/memories/repository.ts` (`MemoriesRepository` interface); swap the mock adapter for a remote API adapter later — keeps the prototype portable to the main Moonlight repo.
- Any non-real story/venue/person must carry `isDemo` and show a 演示内容 label; public submissions always require review.
