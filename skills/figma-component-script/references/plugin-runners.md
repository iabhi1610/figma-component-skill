# Plugin runners

The script body is the same everywhere. Only how it starts and ends changes.
Ask which runner first, then use the matching ending.

## Scripter (default)
- Free community plugin by Rasmus Andersson. Open it from
  Plugins → Scripter in a Design file you can edit.
- Runs TypeScript or JavaScript with the Plugin API as `figma`.
- Top-level `await` works. End the script with:
  ```js
  await main();
  ```
- Do NOT call `figma.closePlugin()`: it closes Scripter itself.
- Errors show in Scripter's output under the editor.
- Scripter has not been updated since 2023 but still runs. If it ever
  says `await` is not allowed, end with `main().catch((e) => print(e));`
  instead.

## Your own development plugin
For users who want a button they can run again from Plugins → Development.
1. Figma desktop → Plugins → Development → New plugin → "Figma design" →
   "Run once" template. It makes a folder with `manifest.json` and `code.js`.
2. Paste the script into `code.js` and change the ending to:
   ```js
   main().then((m) => figma.closePlugin(m)).catch((e) => figma.closePlugin("Error: " + e.message));
   ```
3. Remove the top-level `await main();` line.
4. If `manifest.json` has `"documentAccess": "dynamic-page"`, keep using
   `figma.currentPage` only (the template already does).

## Run-Plugin-API (alternative)
Community plugin by ryonakae (MIT): paste Plugin API code, run with
Cmd/Ctrl + Enter. Use the same ending as Scripter. If top-level `await`
fails, use `main().then((m) => figma.notify(m));`.

## Another script runner
Any plugin that runs pasted Plugin API code works if it supports async
code. If unsure, use the development plugin ending above, wrapped so the
plugin closes when done. Ask the user to paste the first error they see.

## Never
- Never ask for a Figma access token. The script runs inside Figma.
- Never fetch from the network inside the script.
