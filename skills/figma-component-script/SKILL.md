---
name: figma-component-script
description: Builds a real Figma component set (variants, states, boolean, text and instance-swap properties) as one Plugin API script the user pastes into a script-runner plugin such as Scripter, so no Figma MCP calls are used. Use when the user wants to create, script or generate a Figma component, component set, variants or states, or wants to save Figma MCP calls on a free, student or Starter plan. Also writes the matching code component, Storybook story and docs page when asked.
---

# Figma component script

You write one self-contained script. The user pastes it into a Figma
plugin that runs Plugin API code (Scripter by default). The script draws a
complete component set on the canvas. You never call the Figma MCP for this.

Why: Figma's MCP server gives Starter (free) plans and View or Collab
seats 20 tool calls a month, and its write-to-canvas tool (`use_figma`)
is not on Starter at all. A pasted script costs zero calls, runs in
seconds and can be re-run after every change.

## The flow

1. **Interview** (always, before any code). Ask the questions below.
2. **Spec**. Play back a short spec table. Wait for "yes" or edits.
3. **Script**. Generate one script from `templates/component-set.figma.js`.
4. **Run and check**. Tell the user how to run it, then walk the checks.
5. **Code** (only if asked). Follow `references/code-handoff.md`.

Never skip step 1 or 2. A wrong guess costs a re-run and a messy canvas.
If the user already answered some questions in their message, do not ask
them again: list what you understood and ask only what is missing.

## 1. Interview

Ask in ONE message, grouped and numbered, with a suggested default for
each so the user can answer "defaults are fine" or only change a few.
Keep it to these groups. Read `references/interview.md` for the full
question bank, defaults per component type and how to read answers.

**A. Where it runs**
- Which plugin will run the script? Scripter (default), another
  script runner, or their own development plugin? See
  `references/plugin-runners.md`: the wrapper differs per runner.
- Their Figma plan and seat (only to explain limits, never a blocker).
- Fonts installed and available in the file (default Inter).
- Does the file already have variables or styles for colour, spacing
  and radius? If yes, ask for the exact names (or a collection name).
- Do they already have icon components? If yes, ask for their exact
  names. If no, the script creates simple placeholder icons.

**B. The component**
- Name and one-line job ("Button: starts an action").
- Anatomy: the parts, in order (container, leading icon, label,
  trailing icon, badge...). Suggest one from `references/interview.md`.

**C. Variants** (things a designer picks): e.g. Size (S, M, L),
Style or Hierarchy (Primary, Secondary, Ghost), Tone (Neutral, Danger).

**D. States** (things that happen to it): suggest the right set from
`references/states.md` for this component type, e.g. Default, Hover,
Pressed, Focus, Disabled, Loading. Ask which to keep.

**E. Properties** (things a designer toggles or types). Apply the rules
in `references/props-rules.md` and propose them, for example:
- Every optional part becomes a **boolean** toggle (Show leading icon).
- Every icon or slot also becomes an **instance swap**, with preferred
  icons, so a designer can toggle it AND swap it like in a real library.
- Every visible string becomes a **text** property (Label).
- Size, style and state stay **variants**.

**F. Rules**: min touch target (default 44 px tall on touch, focus ring
2 px), radius, padding scale, dark mode needed or not.

## 2. Spec

Reply with a compact table, then ask "Generate it?":

| Part | Decision |
|---|---|
| Runner | Scripter |
| Component | Button: starts an action |
| Variants | Size: S, M, L · Style: Primary, Secondary, Ghost |
| States | Default, Hover, Pressed, Focus, Disabled |
| Booleans | Show leading icon (off), Show trailing icon (off) |
| Instance swaps | Leading icon, Trailing icon · preferred: Plus, Arrow right, Check |
| Text | Label = "Button" |
| Tokens | Variables "color/brand/500"... else hex fallbacks |
| Count | 3 × 3 × 5 = 45 variants |

Warn when the count passes about 150 variants. Suggest moving a state
into a boolean or splitting the set.

## 3. Script

Start from `templates/component-set.figma.js`. It is tested and already
handles fonts, placeholder icons, variants, property wiring, layout of
the grid, variables with hex fallback, and a final summary. Change only:

- the `SPEC` object at the top (names, variants, states, props, tokens),
- `drawVariant()` if the anatomy is not a button-like row,
- the runner wrapper at the bottom (see `references/plugin-runners.md`).

Hard rules (read `references/plugin-api.md` before changing anything):
- `await figma.loadFontAsync()` for every font style before setting text.
- Create every variant as a `ComponentNode` named
  `Size=M, Style=Primary, State=Default`, then `figma.combineAsVariants`.
- Add boolean, text and instance-swap properties on the **component
  set**, then wire each variant's layers with `componentPropertyReferences`.
- Icons inside variants are **instances** of icon components, never
  loose vectors, or instance swap cannot work.
- Use auto layout for the container. Hug content, fixed height per size.
- Name every layer. No "Frame 12".
- Put the set in a new section at the viewport centre, select it, zoom.
- End with `figma.notify()` saying what was made.
- One file, no imports, no network, plain JavaScript that is also valid
  TypeScript. Keep it under about 400 lines.

Output the whole script in one code block. Never output partial patches
for the user to merge by hand.

## 4. Run and check

Tell the user, in short steps for their runner (Scripter: open the
plugin, new script, paste, Run). Then ask them to check:

1. The set shows the expected variant count in the right panel.
2. An instance's properties panel shows the toggles, the swap and text.
3. Toggling an icon off removes it and the button re-hugs.
4. Swapping the icon shows the preferred icons first.
5. Focus and Disabled look different from Default without colour alone.

If the run fails, ask for the exact error line from the runner's console
and fix the script. Common fixes are in `references/plugin-api.md`.

## 5. Code (on request)

Read `references/code-handoff.md`. Map every Figma property to a code
prop one to one, then write the component, a Storybook story file and a
docs page (Storybook MDX or Fumadocs MDX, whichever the user uses).

## Files

- `references/interview.md`: full question bank and defaults per component
- `references/states.md`: state sets per component type
- `references/props-rules.md`: variant vs boolean vs text vs instance swap
- `references/plugin-runners.md`: Scripter and other runners, wrappers
- `references/plugin-api.md`: API calls used, gotchas, error fixes
- `references/code-handoff.md`: Figma props to React props, story, docs
- `templates/component-set.figma.js`: the tested starting script
