---
name: shadcn
description: shadcn/ui guidelines for divercity-site (base-nova style on Base UI). Apply when creating, modifying or using UI components — buttons, dialogs, sheets, drawers, dropdowns, selects, tabs, tables, forms or any UI primitive.
user-invocable: false
---

## Stack

- shadcn CLI 4 — style `base-nova`, primitives from `@base-ui/react` (not Radix)
- lucide-react (icon library)
- class-variance-authority, clsx, tailwind-merge
- `components.json`: RSC on, CSS variables, base color `neutral`, css at `src/app/globals.css`

## Path Aliases

- `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`

## Installed in `src/components/ui/`

avatar, badge, breadcrumb, button, card, chart, checkbox, drawer, dropdown-menu, field, input, label, popover, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, textarea, toggle, toggle-group, tooltip.

Project-specific: `admin-data-table` (admin listings), `admin-sub-sidebar`, `sortable-table-head`, `contract-preview`, `tiptap-editor`, `cta` (CMS CTA), `Navbar`, `ImageModal`, `nav-skeleton`.

## Rules

- Check `src/components/ui/` first; if shadcn has the component but it is not installed, `npx shadcn@latest add <component>` — never hand-roll it
- Base UI composition uses the `render` prop, not `asChild`. Read the local component file for its API before using it
- Use `cn()` from `@/lib/utils` and `cva()` for variants
- Icons only from `lucide-react`; confirm the icon exists in the installed version
- Admin listings use `AdminDataTable`; admin areas follow the sidebar + sub-sidebar layout
- Do not edit generated shadcn components or `components.json` unless the task requires it
