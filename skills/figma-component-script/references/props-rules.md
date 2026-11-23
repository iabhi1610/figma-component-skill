# Which kind of property?

| If the thing... | Make it | Example |
|---|---|---|
| changes the look and a designer picks one value | Variant | Size=M, Style=Primary |
| happens to the component (user or system) | Variant called State | State=Hover |
| is on or off and has no look of its own | Boolean | Show leading icon |
| is a nested component that can be replaced | Instance swap | Leading icon → Check |
| is a string someone will change | Text | Label |

Rules
1. Every optional icon or slot gets BOTH a boolean (show) and an instance
   swap (which one). This is how real libraries work: toggle and swap.
2. Give every instance swap preferred values, so the right icons show
   first instead of the whole library.
3. Name booleans as a question a designer answers: "Show leading icon",
   "Has helper text". Name swaps after the slot: "Leading icon".
4. Booleans default to off when the part is optional and rare.
5. Never make a variant for something a boolean can do. Each variant
   axis multiplies the count. Each boolean adds one toggle.
6. Property names match code prop names when possible: Label → label,
   Show leading icon → leadingIcon present or not, Size → size.
7. Order in the panel: variants, then text, then booleans, then swaps.
