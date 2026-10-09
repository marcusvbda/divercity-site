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

## Installed

Public site / portal, in `src/components/ui/`: button, checkbox, input, label, plus project-specific `contract-preview` (also used by the admin), `cta` (CMS CTA), `Navbar`, `ImageModal`.

Admin kit, in `src/components/admin/ui/` (AdminCN template, style `base-vega`, Base UI): alert, avatar, badge, breadcrumb, button, button-group, card, checkbox, collapsible, combobox, command, dialog, dropdown-menu, field, input, input-group, label, pagination, popover, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip. Admin-specific: `src/components/admin/data-table.tsx`, `tiptap-editor.tsx`, `calendar/`, `layout/`.

## Rules

- Public site: check `src/components/ui/` first; admin: check `src/components/admin/ui/` first and never import `@/components/ui/*` there (except `contract-preview`); if shadcn has the component but it is not installed, `npx shadcn@latest add <component>` — never hand-roll it
- Base UI composition uses the `render` prop, not `asChild`. Read the local component file for its API before using it
- Use `cn()` from `@/lib/utils` and `cva()` for variants
- Icons only from `lucide-react`; confirm the icon exists in the installed version
- Admin listings use `src/components/admin/data-table.tsx`; admin navigation is the sidebar with submenus (`admin/layout/nav-config.ts`)
- Do not edit generated shadcn components or `components.json` unless the task requires it
