# Plugin API cheat sheet (only what the template uses)

Docs: https://developers.figma.com/docs/plugins/api/api-reference/

| Need | Call |
|---|---|
| Fonts | `await figma.loadFontAsync({ family, style })` before any text change |
| New component | `figma.createComponent()` |
| Icon from SVG | `figma.createNodeFromSvg(svg)` then `figma.createComponentFromNode(frame)` |
| Variant set | `figma.combineAsVariants(components, parent)`; names like `Size=M, State=Hover` |
| Text property | `set.addComponentProperty("Label", "TEXT", "Button")` returns a key like `Label#12:3` |
| Boolean property | `set.addComponentProperty("Show icon", "BOOLEAN", false)` |
| Instance swap | `set.addComponentProperty("Icon", "INSTANCE_SWAP", iconComponent.id, { preferredValues: [{ type: "COMPONENT", key: c.key }] })` |
| Wire text | `textNode.componentPropertyReferences = { characters: key }` |
| Wire icon | `instance.componentPropertyReferences = { visible: showKey, mainComponent: swapKey }` |
| Auto layout | `layoutMode`, `primaryAxisSizingMode`, `counterAxisSizingMode`, `itemSpacing`, `padding*`, `*AlignItems` |
| Colour variable | `figma.variables.getLocalVariablesAsync("COLOR")`, `figma.variables.setBoundVariableForPaint(paint, "color", variable)` |
| Number variable | `node.setBoundVariable("paddingLeft", variable)` (also itemSpacing, cornerRadius...) |
| Section | `figma.createSection()` |
| Finish | `figma.currentPage.selection = [set]`, `figma.viewport.scrollAndZoomIntoView([...])`, `figma.notify(msg)` |

Gotchas
- Call `resize()` BEFORE setting `primaryAxisSizingMode = "AUTO"`:
  resize switches the axis back to FIXED.
- Properties go on the component SET, not on each variant.
- Always use the key that `addComponentProperty` returns, never the name.
- Only instances can be swapped. Icons must be instances of components.
- Icon vectors need `constraints = SCALE` so resized instances scale.
- Variant names must be unique, or `combineAsVariants` fails.
- `componentPropertyReferences` on a TEXT node allows `visible` and
  `characters`; on an INSTANCE `visible` and `mainComponent`.

Common errors
| Error says | Fix |
|---|---|
| `Cannot write to node with unloaded font` | add `loadFontAsync` for that exact style; check the style name, e.g. "Semi Bold" vs "SemiBold" |
| `in addComponentProperty: ... INSTANCE_SWAP` | default must be a component **id**, preferred values use **key** |
| `Component property ... not found` | you used the name, not the returned key |
| `not a valid variant name` or duplicate | check every variant name is `Prop=Value` and unique |
| `Icon component "X" not found` | icons are looked up on the current page by exact name |
