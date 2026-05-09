<!-- For new events, use the dedicated template:
  https://github.com/Al033/OTI/blob/main/.github/PULL_REQUEST_TEMPLATE/new-event.md
  Apply by appending ?template=new-event.md to your PR URL. -->

## Summary

<!-- 1-3 bullets describing the change and the why. -->

## Test plan

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test` — corpus integrity + retrieval gold-set
- [ ] `pnpm build`
- [ ] (if data/events.ts changed) `pnpm validate-event` and
      `pnpm test --reporter=spec` confirms recall@3 ≥ 0.80

## Methodology fidelity

- [ ] No claim made in `/methodology` is contradicted by this change
      (the rule: methodology page describes shipped reality, not aspiration)
- [ ] No new look-ahead-bias surface introduced (Phase A still sees only
      `narrativeAtTime` + t=0 returns)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
