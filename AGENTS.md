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

## Architecture rules
- All network access goes through `src/services` (Axios client + endpoint map); components never build URLs. Why: the Django contract is still provisional.
- Exactly one backend adapter (live or fixtures) is chosen in `src/services/index.ts`; never fall back to fixtures on API errors. Why: demo data must never masquerade as real data.
- Fixture mode must not fabricate successful orders or payments; sample orders carry `is_example`. Why: honesty requirement of the portfolio brief.
- Routing uses TanStack Router (scaffold constraint); pages live in `src/routes`. Why: react-router-dom would conflict with TanStack Start.
- Client auth/staff guards are UI-only; the backend enforces permissions. Why: client checks are bypassable.
