# Paperclip Nothing-Inspired Theme Audit and Verification Plan

Date: 2026-05-01
Issue: EMT-27 — Design and verify Nothing-inspired Paperclip theme

## Required Google Fonts

Paperclip should load exactly these Google Fonts:
- `Space Grotesk`
- `Space Mono`
- `Doto`

Current load point is already correct in `ui/index.html`:
- `link rel="preconnect"` to `fonts.googleapis.com` and `fonts.gstatic.com`
- stylesheet href at `ui/index.html:13-16`

This means the font delivery requirement is already satisfied at the document level. No extra runtime font loader is needed unless we later decide to self-host.

## Current theme-switch surface

Paperclip currently supports a two-mode theme switch only:
- persisted key: `paperclip.theme`
- values: `light` | `dark`
- bootstrap application in `ui/index.html:27-47`
- runtime context in `ui/src/context/ThemeContext.tsx`

Important implication: there is not yet a separate named "Nothing" theme mode. The current implementation path is to make the existing light/dark pair embody the Nothing-inspired system rather than adding a third theme selector.

## Audit summary

### Already centralized and usable

1. Core theme tokens are centralized in `ui/src/index.css`.
2. Typography is already wired to the intended font families:
   - `--font-display: "Doto"`
   - `--font-body: "Space Grotesk"`
   - `--font-label: "Space Mono"`
3. Global badge typography already pushes labels toward instrument-panel styling:
   - uppercase
   - mono
   - tight small size
4. The design guide page exists and can be used as a visual verification surface:
   - `ui/src/pages/DesignGuide.tsx`

### Current gaps against the updated loud industrial brief

1. The base palette in `ui/src/index.css` still uses the earlier generic monochrome values:
   - dark background `#000000`
   - dark card `#111111`
   - light background `#f5f5f5`
   - signal red only

   That is close to the original Nothing-inspired direction but not yet aligned to Mark's louder industrial palette from the operator directive:
   - dark base `#090807`
   - dark surfaces `#181614` / `#1D1A17`
   - borders `#3A3632`
   - warm foreground `#E5DDD0`
   - molten orange-red event accent `#FF4719`
   - urgent/error red `#D71921`

2. Multiple semantic surfaces still bypass the shared token layer and hardcode Tailwind color utilities. The biggest concentration is `ui/src/lib/status-colors.ts`, which currently uses direct blue/yellow/violet/green/red utility classes for:
   - issue status icon colors
   - issue status text colors
   - status badges
   - agent status dots
   - priority colors

3. Several app surfaces still hardcode one-off semantic colors and therefore require visual verification after any token retune, including:
   - `ui/src/components/ApprovalCard.tsx`
   - `ui/src/components/BudgetIncidentCard.tsx`
   - `ui/src/components/IssueRow.tsx`
   - `ui/src/components/KanbanBoard.tsx`
   - `ui/src/pages/Approvals.tsx`
   - `ui/src/pages/PluginSettings.tsx`
   - `ui/src/pages/ProjectDetail.tsx`
   - `ui/src/components/BudgetSidebarMarker.tsx`

## Proposed token direction

Apply the loud industrial Nothing-inspired brief to the existing light/dark system.

### Dark mode target

- `--background`: `#090807`
- `--card`: `#181614`
- `--popover`: `#181614`
- `--surface-raised`: `#1D1A17`
- `--border`: `#2A2623`
- `--border-visible`: `#3A3632`
- `--text-display`: `#FFFFFF`
- `--text-primary`: `#E5DDD0`
- `--text-secondary`: `#B0A89C`
- `--text-disabled`: `#6F685F`
- event accent token: `#FF4719`
- urgent/error token: `#D71921`
- success: keep green semantic but avoid neon
- warning: warm amber, machinery not SaaS gold

### Light mode target

- `--background`: warm off-white or stark paper white
- `--card`: `#FFFFFF`
- `--popover`: `#FFFFFF`
- `--surface-raised`: subtle off-white separation only
- `--border`: light neutral technical line
- `--border-visible`: darker drafting-line neutral
- `--text-display`: near-black
- `--text-primary`: near-black warm neutral
- `--text-secondary`: technical gray
- `--text-disabled`: muted gray
- preserve the same accent semantics as dark mode

## Typography roles

Keep the current family assignment, but tighten application discipline:
- `Doto`: hero numerics, flagship moments only
- `Space Grotesk`: headings, body, navigation
- `Space Mono`: labels, metadata, chips, issue IDs, status instrumentation

Implementation note: the CSS variables already support this. Most remaining work is usage consistency, not font setup.

## Implementation checklist

1. Update `ui/src/index.css` base and `.dark` tokens to the loud industrial palette.
2. Introduce explicit semantic tokens for status families instead of raw Tailwind hues where practical, so status rendering remains consistent across surfaces.
3. Refactor `ui/src/lib/status-colors.ts` to map through Paperclip semantic tokens rather than raw `text-blue-*`, `text-yellow-*`, etc., where doing so preserves contrast and meaning.
4. Normalize one-off accent/error/success/warning surfaces in:
   - approvals
   - budget incidents
   - issue unread markers
   - kanban active-run dots
   - plugin and validation notices
5. Use `ui/src/pages/DesignGuide.tsx` as a living verification page for:
   - typography hierarchy
   - core tokens
   - badges and chips
   - form controls
   - navigation chrome
   - dialogs, menus, popovers, sheets
6. Verify both modes in the actual app before giving switch instructions.

## Render verification checklist

Required screens/surfaces to inspect in both dark and light modes:

### Core navigation + board surfaces
- sidebar
- top navigation/header chrome
- dashboard cards and activity rows
- issue board columns and cards
- issue list rows

### Issue-detail surfaces
- issue header and properties
- markdown body and editor
- comments thread
- approvals cards
- work-products section
- document/work-product badges and metadata

### Execution visibility surfaces
- transcript/live-run surfaces
- status dots and run badges
- activity charts
- budget warnings/incidents

### Input/control surfaces
- buttons
- selects
- inputs
- checkboxes
- dropdown menus
- dialogs
- sheets
- tabs
- hover/focus states

## High-risk areas from current code audit

These are the most likely places to visually drift from the theme because they currently embed direct hue utilities:
- `ui/src/lib/status-colors.ts`
- `ui/src/components/ApprovalCard.tsx`
- `ui/src/components/BudgetIncidentCard.tsx`
- `ui/src/components/IssueRow.tsx`
- `ui/src/components/KanbanBoard.tsx`
- `ui/src/pages/Approvals.tsx`
- `ui/src/pages/PluginSettings.tsx`
- `ui/src/pages/ProjectDetail.tsx`

## Acceptance gate for Mark-facing switch instructions

Do not tell Mark how to switch themes until all are true:
1. loud industrial token pass is implemented
2. dark and light mode both render cleanly in the actual running app
3. status chips and alerts preserve semantic meaning without generic SaaS chrome
4. screenshot evidence exists for the audited surfaces
5. wallpaper/theme PR evidence exists in `mamerbot/nothing-theme`

## 2026-05-02 live verification pass

Verified route:
- actual runtime verification path is `/EMT/design-guide`
- bare `/design-guide` is not the correct company-scoped route in this app

Verified runtime behavior:
- dark and light mode both render successfully in the live app
- the page is reachable and interactive in both modes
- no browser console errors surfaced during the verification pass on the design-guide route

Dark-mode assessment:
- materially closer than the previous generic SaaS pass because the token base is now blacker, flatter, and more restrained
- still not yet at the acceptance bar for "loud industrial utilitarian Nothing-inspired"
- strongest improvement is the foundation palette
- biggest remaining misses are still generic SaaS accent distribution, conventional component chrome, and typography that is competent but not yet distinct/mechanical enough

Light-mode assessment:
- currently reads as a polished conventional app light theme more than a warm off-white / stark industrial first-class mode
- the current light canvas is usable and coherent, but still too close to neutral white SaaS instead of clearly intentional paper/warm-industrial composition
- border treatment remains clean but conventional rather than unmistakably hardware/manual/spec-sheet driven

Most important residual implementation drifts discovered after the live pass:
1. `ui/src/lib/status-colors.ts` still hardcodes blue/yellow/violet/green/red/orange mappings instead of fully expressing the new industrial semantic token system.
2. `ui/src/pages/DesignGuide.tsx` itself still contains hardcoded blue/violet/cyan/green/yellow/red demo classes, which means the verification page can visually undercut the very theme it is supposed to validate.
3. The live sidebar/navigation shell still reads partially Linear/Notion/SaaS because project dots, live indicators, badges, and avatar moments are still too colorful or playful relative to the brief.
4. Component shapes and selection states still read a little too soft/familiar. The theme foundation improved more than the component language.

Refined next implementation priorities:
1. Finish the semantic-token migration in `ui/src/lib/status-colors.ts`.
2. Rework `ui/src/pages/DesignGuide.tsx` demo/status surfaces so the guide validates the Nothing-inspired system instead of showcasing legacy SaaS hues.
3. Normalize the high-visibility live/status surfaces that most affect the shell read:
   - `ui/src/pages/IssueDetail.tsx`
   - `ui/src/components/IssueWorkProductsSection.tsx`
   - `ui/src/components/KanbanBoard.tsx`
   - `ui/src/components/CompanyRail.tsx`
   - `ui/src/pages/Agents.tsx`
4. Re-run the same live dark/light verification pass once those surfaces are token-aligned.

## 2026-05-03 live design QA pass

Verified runtime route:
- `/EMT/design-guide`

Verified runtime behavior:
- route loads successfully in both dark and light mode
- no browser console errors in either mode during the pass
- the current theme foundation is coherent and technically stable enough for visual review

Dark-mode findings:
- current build no longer fails primarily on raw wrong hues; the bigger problem is overall product character
- the page still reads closer to polished dark SaaS/admin UI than loud industrial utilitarian Nothing-inspired design
- top drifts: soft rounded component shapes, conventional SaaS sidebar chrome, overly friendly typography hierarchy, scattered multicolor accents, and large blank canvas areas without enough intentional structural framing

Light-mode findings:
- light mode is currently weaker than dark mode against the Nothing-inspired goal
- it reads as clean conventional white SaaS more than warm off-white / stark industrial product design
- top drifts: background still feels too plain-white rather than material/off-white, component radii remain soft, accent colors remain too product-SaaS, typography is competent but not distinctive, and the page composition lacks strong industrial framing

Most important conclusion from the 2026-05-03 pass:
- the remaining gap is now more about component language, chrome hardness, accent discipline, and typographic attitude than about base token correctness alone
- this means the next implementation pass should stay surgical and target the highest-visibility shell/demo surfaces rather than reopening the entire palette system

Refined next implementation priorities:
1. Harder component geometry in the most visible shell/demo surfaces (buttons, chips, nav states, panels) where the current rounded SaaS treatment is undermining the theme
2. Reduce accent sprawl in navigation and status-adjacent surfaces so red/event accents feel deliberate instead of generic product-status colorfulness
3. Strengthen industrial typography treatment for labels/metadata/navigation on the design-guide and shell surfaces
4. Re-run the same live dark/light verification pass after those targeted changes before giving any switch guidance to Mark

## Current status

This document is the implementation and verification brief for EMT-27 based on the live codebase audit plus repeated live browser verification passes. It should be treated as the source checklist for the next implementation pass and the final visual QA pass.
