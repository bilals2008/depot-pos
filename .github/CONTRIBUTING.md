# Contributing to Orion Orbit

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: correct a bug
docs: update documentation
refactor: restructure code
style: formatting changes
chore: tooling, dependencies
```

## Code Standards

- Follow the existing code style (no commented code, use semantic tokens)
- Use `@/` alias for `src/` imports
- shadcn/ui components in `src/components/ui/` — never modify
- Access translations via `useSettings().t("key")`
- No hardcoded colors — use Tailwind v4 theme tokens
- Keep components focused and files under 300 lines where possible

## Pull Request Process

1. Ensure no lint errors (`npm run lint`)
2. Update README.md if introducing new features
3. PRs require at least one review before merging
