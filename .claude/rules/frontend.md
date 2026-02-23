---
globs: ["app/**/*.tsx", "components/**"]
---

# Frontend Rules

- Use shadcn/ui components — install via `npx shadcn@latest add <component>`
- Tailwind only — no separate CSS files
- Loading skeletons for all async data
- Search bar must have debounced autocomplete (300ms delay)
- Paper cards show: title, authors (truncated), abstract (2 lines), citation count, source badge, year
- Progressive display: papers appear as they stream in, not all at once
- Dark mode support via next-themes
- Mobile responsive — test at 375px width
