# From Figma component to code

Do this only when the user asks for code. Ask first: React or another
framework? Tailwind, CSS modules or plain CSS? Storybook, Fumadocs, or both?
Defaults: React + TypeScript, Tailwind, Storybook.

## 1. Map props one to one

| Figma | Code (React) |
|---|---|
| Variant `Size=S/M/L` | `size?: "sm" \| "md" \| "lg"` (default md) |
| Variant `Style=Primary/...` | `variant?: "primary" \| "secondary" \| "ghost"` |
| Variant `State=Hover/Pressed/Focus` | not a prop: CSS `:hover`, `:active`, `:focus-visible` |
| Variant `State=Disabled` | `disabled?: boolean` |
| Variant `State=Loading` | `loading?: boolean` (sets `aria-busy`, keeps width) |
| Text `Label` | `children` |
| Boolean + swap `Leading icon` | `leadingIcon?: ReactNode` (present = shown) |
| Colour variables | CSS variables with the same names (`--color-action-primary`) |

Write this table into the component file as a comment, so design and
code stay in sync.

## 2. Component
- One file, typed props, forwards ref, spreads the rest onto the element.
- Uses tokens (CSS variables), never raw hex.
- Real `<button>`; icon-only buttons need `aria-label`.
- Minimum hit area 44 × 44 on touch, even when the visual is smaller.

## 3. Storybook story (`Button.stories.tsx`)
- `title: "Components/Button"`, `component`, `tags: ["autodocs"]`.
- `argTypes` for every prop, with `control: "select"` for variants.
- One story per variant value, plus `AllStates` that renders the grid,
  plus `WithIcons`.
- Add the Figma link with the designs addon if the user has it.

## 4. Docs page
Storybook MDX (`Button.mdx`) or Fumadocs (`content/docs/components/button.mdx`):
1. One line: what it is for.
2. Live preview.
3. When to use / when not to.
4. Props table (generated, or hand written from the mapping table).
5. Accessibility notes.
6. Do and don't, two pairs.
7. Link to the Figma component.

## 5. Check
- Every Figma property has a prop, and every prop has a Figma property.
- Story controls can reach every variant in the Figma set.
