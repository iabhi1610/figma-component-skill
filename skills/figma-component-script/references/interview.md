# Interview question bank

Ask everything in one message, numbered, with a default in brackets.
The user can reply "defaults" or only the numbers they want to change.
Skip any question their first message already answered.

## A. Where it runs
1. Which plugin runs the script? [Scripter]
   Others: their own development plugin, or another runner (see plugin-runners.md).
2. Figma plan and seat? [Starter or Education]. Only used to explain why we script instead of calling the MCP.
3. Font family, and which styles are installed? [Inter Regular + Semi Bold]
4. Variables or styles in this file? [None, use hex]. If yes: exact names, e.g. `color/action/primary`.
5. Existing icon components? [None, make placeholders]. If yes: exact names on this page.

## B. The component
6. Name and job in one line. [Button: starts an action]
7. Anatomy, in order. Suggest from the table below.

## C. Variants (a designer picks one value)
8. Which variant axes and values? Suggest from the table below.

## D. States (something happens to it)
9. Which states? Suggest the set from states.md.

## E. Properties (a designer toggles, swaps or types)
10. Which parts are optional? Each becomes a boolean + instance swap.
11. Which strings can change? Each becomes a text property.
12. Preferred icons for each swap? [Plus, Arrow right, Check, Close, Download]

## F. Rules
13. Smallest height / touch target? [32 px desktop S, 44 px+ for touch]
14. Radius and padding scale? [8 / 10 / 12, 12 / 16 / 20]
15. Dark mode needed now? [No, add later with variable modes]

## Defaults by component type

| Type | Anatomy | Variants | Optional parts (boolean + swap) | Text |
|---|---|---|---|---|
| Button | container, leading icon, label, trailing icon | Size, Style | leading icon, trailing icon | Label |
| Icon button | container, icon | Size, Style | (icon is required: swap only) | none (add a11y label in code) |
| Input | label, field, leading icon, value, trailing icon, helper | Size | leading icon, trailing icon, helper, label | Label, Placeholder, Helper |
| Checkbox / Radio / Switch | control, label, description | Size | label, description | Label, Description |
| Chip / Tag | container, leading icon, label, close | Size, Style | leading icon, close | Label |
| Badge | container, dot, label | Tone | dot | Label |
| List item | leading slot, title, subtitle, trailing slot | Density | leading, subtitle, trailing | Title, Subtitle |
| Card | media, title, body, actions | Layout | media, actions | Title, Body |
| Tabs item | icon, label, count | Size | icon, count | Label |
| Avatar | image or initials, status dot | Size, Shape | status dot | Initials |

## How to read answers
- "Same as before": reuse the last spec in this conversation.
- A value list like "S M L": split on spaces or commas, keep the user's casing.
- Anything that is on/off and not a visual style is a boolean, not a variant.
- If a user names more than 4 variant axes, push back: suggest booleans.
