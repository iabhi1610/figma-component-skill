# figma-component-skill

An agent skill for Claude Code (and other agents that read `SKILL.md`).
It asks you about a component first: states, variants, which parts are
optional, which icons can swap. Then it writes **one script** you paste
into the [Scripter](https://www.figma.com/community/plugin/757836922707087381) plugin.
The script builds the whole component set in Figma: variants, states,
boolean toggles, instance swaps with preferred icons and a text property.

No Figma MCP calls. That matters on Starter, Education and View seats,
where MCP calls are limited.

## Install

From GitHub, with the skills CLI:

```bash
npx skills add iabhi1610/figma-component-skill
```

Or from npm, into this project's `.claude/skills`:

```bash
npx @iabhi1610/figma-component-skill
npx @iabhi1610/figma-component-skill --global   # every project
```

## Use

```
Use the figma-component-script skill to make a Button.
```

1. Answer the questions (or say "defaults").
2. Say yes to the spec table.
3. Copy the script. In Figma: Plugins → Scripter → new script → paste → Run.
4. Ask for code: "Now the React component, a Storybook story and a docs page."

## What the script makes

- A section with the component set, labelled rows and state columns
- Every variant × state, auto layout, named layers
- `Label` text property
- `Show leading icon` / `Show trailing icon` booleans
- `Leading icon` / `Trailing icon` instance swaps with preferred icons
- Placeholder icon components, or your own icons found by name
- Colour variables bound by name when they exist, hex otherwise
- Focus ring and a width-stable Loading state

## Files

```
skills/figma-component-script/
  SKILL.md
  references/  interview, states, props rules, runners, API, code handoff
  templates/component-set.figma.js   tested starting script
```

## Test

```bash
npm test   # runs the template against a small fake of the Figma API
```

MIT © iabhi1610
