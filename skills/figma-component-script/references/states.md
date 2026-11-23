# States by component type

States change because of the user or the system, not because a designer
picks a look. Draw them as columns. Name them exactly like this.

| Type | Core states | Add when needed |
|---|---|---|
| Button, Icon button, Chip | Default, Hover, Pressed, Focus, Disabled | Loading, Selected (toggle buttons) |
| Input, Select, Textarea | Default, Hover, Focus, Filled, Disabled | Error, Read only, Success |
| Checkbox | Unchecked, Checked, Indeterminate × Default, Hover, Focus, Disabled | Error |
| Radio, Switch | Off, On × Default, Hover, Focus, Disabled | |
| List item, Menu item, Tab | Default, Hover, Pressed, Selected, Focus | Disabled |
| Card (clickable) | Default, Hover, Pressed, Focus | Selected, Skeleton |
| Avatar, Badge | (none: decorative) | Online, Away |

Rules
- Mobile only? Hover can go: touch has no hover.
- Focus must be visible without colour alone: ring, outline or thickness.
- Disabled must still be readable, but must not look tappable.
- Loading keeps the same width, so layouts do not jump.
- Checked and Selected are values a user sets: keep them as a variant
  (Checked=True) next to State, not mixed into State.
- Error is a state of the field, and also needs text: add a Helper text
  property and a boolean to show it.
