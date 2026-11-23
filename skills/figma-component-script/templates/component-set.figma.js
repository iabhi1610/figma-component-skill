// Component set generator for the Figma Plugin API.
// Paste into Scripter (or another script runner) and run.
// Made by the figma-component-script skill. Edit SPEC, run again.
// Re-running is safe: it draws a fresh section next to the old one.

const SPEC = {
  name: "Button",
  description: "Starts an action.",
  font: { family: "Inter", regular: "Regular", strong: "Semi Bold" },

  // Variants a designer picks. Order = order in the properties panel.
  variants: {
    Size: ["S", "M", "L"],
    Style: ["Primary", "Secondary", "Ghost"],
  },
  // States are a variant too, drawn as columns.
  states: ["Default", "Hover", "Pressed", "Focus", "Disabled", "Loading"],

  // Text property
  label: { prop: "Label", value: "Button" },

  // Optional slots: each gets a boolean toggle AND an instance swap.
  slots: [
    { prop: "Leading icon", show: "Show leading icon", on: false, icon: "Plus", side: "before" },
    { prop: "Trailing icon", show: "Show trailing icon", on: false, icon: "Arrow right", side: "after" },
  ],

  // Icons: "create" draws placeholder icon components.
  // "find" uses existing components on this page with these exact names.
  icons: { source: "create", prefix: "Icon/", names: ["Plus", "Arrow right", "Check", "Close", "Download"] },

  // Size scale (px)
  sizes: {
    S: { h: 32, px: 12, gap: 6, font: 13, icon: 16, radius: 8 },
    M: { h: 40, px: 16, gap: 8, font: 14, icon: 18, radius: 10 },
    L: { h: 48, px: 20, gap: 8, font: 16, icon: 20, radius: 12 },
  },

  // Colours per style and state. Missing states fall back to Default.
  // Values are hex. "token" names are looked up in local colour variables;
  // when a variable with that exact name exists it is bound, else hex is used.
  colors: {
    Primary: {
      Default: { bg: "#1F1F1F", fg: "#FFFFFF", token: { bg: "color/action/primary", fg: "color/text/on-primary" } },
      Hover:   { bg: "#3A3A3A", fg: "#FFFFFF" },
      Pressed: { bg: "#000000", fg: "#FFFFFF" },
      Disabled:{ bg: "#E6E6E6", fg: "#9A9A9A" },
    },
    Secondary: {
      Default: { bg: "#FFFFFF", fg: "#1F1F1F", border: "#D4D4D4" },
      Hover:   { bg: "#F5F5F5", fg: "#1F1F1F", border: "#BDBDBD" },
      Pressed: { bg: "#EBEBEB", fg: "#1F1F1F", border: "#A3A3A3" },
      Disabled:{ bg: "#FFFFFF", fg: "#B0B0B0", border: "#E6E6E6" },
    },
    Ghost: {
      Default: { bg: null, fg: "#1F1F1F" },
      Hover:   { bg: "#F2F2F2", fg: "#1F1F1F" },
      Pressed: { bg: "#E6E6E6", fg: "#1F1F1F" },
      Disabled:{ bg: null, fg: "#B0B0B0" },
    },
  },
  focusRing: { color: "#2F6BFF", width: 2, offset: 2 },
};

// ---------------------------------------------------------------- helpers

function hex(h) {
  const n = h.replace("#", "");
  return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255 };
}
let COLOR_VARS = {};
async function loadColorVariables() {
  if (!figma.variables || !figma.variables.getLocalVariablesAsync) return;
  const vars = await figma.variables.getLocalVariablesAsync("COLOR");
  for (const v of vars) COLOR_VARS[v.name] = v;
}
function paint(h, tokenName) {
  let p = { type: "SOLID", color: hex(h) };
  const v = tokenName && COLOR_VARS[tokenName];
  if (v) p = figma.variables.setBoundVariableForPaint(p, "color", v);
  return p;
}
function colorsFor(style, state) {
  const set = SPEC.colors[style];
  const base = set.Default;
  const own = set[state] || {};
  const c = Object.assign({}, base, own);
  c.token = state === "Default" || !set[state] ? base.token || {} : own.token || {};
  return c;
}
function combos(variants) {
  // every combination of the variant values, as [{Size:"S",Style:"Primary"}, ...]
  let out = [{}];
  for (const key of Object.keys(variants)) {
    const next = [];
    for (const o of out) for (const val of variants[key]) next.push(Object.assign({}, o, { [key]: val }));
    out = next;
  }
  return out;
}
function variantName(props) {
  return Object.keys(props).map((k) => k + "=" + props[k]).join(", ");
}

// Placeholder icons: 24 x 24, 2 px strokes, scale with their frame.
const ICON_SVGS = {
  "Plus": '<path d="M12 5v14M5 12h14"/>',
  "Arrow right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
  "Check": '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  "Close": '<path d="M6 6l12 12M18 6L6 18"/>',
  "Download": '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
};
function iconSvg(name) {
  const body = ICON_SVGS[name] || '<circle cx="12" cy="12" r="7"/>';
  return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + "</g></svg>";
}
async function getIcons(parent) {
  const map = {};
  if (SPEC.icons.source === "find") {
    for (const name of SPEC.icons.names) {
      const found = figma.currentPage.findOne((n) => n.type === "COMPONENT" && n.name === name);
      if (!found) throw new Error('Icon component "' + name + '" not found on this page. Check the exact name.');
      map[name] = found;
    }
    return map;
  }
  let x = 0;
  for (const name of SPEC.icons.names) {
    const frame = figma.createNodeFromSvg(iconSvg(name));
    frame.findAll(() => true).forEach((n) => { if ("constraints" in n) n.constraints = { horizontal: "SCALE", vertical: "SCALE" }; });
    const comp = figma.createComponentFromNode(frame);
    comp.name = SPEC.icons.prefix + name;
    comp.fills = [];
    parent.appendChild(comp);
    comp.x = x; comp.y = 0; x += 40;
    map[name] = comp;
  }
  return map;
}
function recolor(node, p) {
  node.findAll((n) => "strokes" in n && n.strokes.length > 0).forEach((n) => { n.strokes = [p]; });
}

// ---------------------------------------------------------------- drawing

// Draws one variant. Change this when the anatomy is not a button-like row.
function drawVariant(props, state, icons) {
  const s = SPEC.sizes[props.Size];
  const c = colorsFor(props.Style, state);
  const comp = figma.createComponent();
  comp.name = variantName(Object.assign({}, props, { State: state }));

  comp.layoutMode = "HORIZONTAL";
  comp.resize(120, s.h);
  comp.primaryAxisSizingMode = "AUTO";
  comp.counterAxisSizingMode = "FIXED";
  comp.primaryAxisAlignItems = "CENTER";
  comp.counterAxisAlignItems = "CENTER";
  comp.paddingLeft = comp.paddingRight = s.px;
  comp.itemSpacing = s.gap;
  comp.cornerRadius = s.radius;
  comp.clipsContent = false;
  comp.fills = c.bg ? [paint(c.bg, c.token.bg)] : [];
  if (c.border) {
    comp.strokes = [paint(c.border, c.token.border)];
    comp.strokeWeight = 1;
    comp.strokeAlign = "INSIDE";
  }
  if (state === "Focus") {
    const r = SPEC.focusRing;
    comp.effects = [
      { type: "DROP_SHADOW", color: Object.assign({ a: 1 }, hex("#FFFFFF")), offset: { x: 0, y: 0 }, radius: 0, spread: r.offset, visible: true, blendMode: "NORMAL", showShadowBehindNode: false },
      { type: "DROP_SHADOW", color: Object.assign({ a: 1 }, hex(r.color)), offset: { x: 0, y: 0 }, radius: 0, spread: r.offset + r.width, visible: true, blendMode: "NORMAL", showShadowBehindNode: false },
    ];
  }
  const fg = paint(c.fg, c.token.fg);

  const slotNode = (slot) => {
    const inst = icons[slot.icon].createInstance();
    inst.name = slot.prop;
    inst.resize(s.icon, s.icon);
    recolor(inst, fg);
    inst.visible = slot.on;
    return inst;
  };
  for (const slot of SPEC.slots) if (slot.side === "before") comp.appendChild(slotNode(slot));

  const text = figma.createText();
  text.name = SPEC.label.prop;
  text.fontName = { family: SPEC.font.family, style: SPEC.font.strong };
  text.characters = SPEC.label.value;
  text.fontSize = s.font;
  text.fills = [fg];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  comp.appendChild(text);

  for (const slot of SPEC.slots) if (slot.side === "after") comp.appendChild(slotNode(slot));

  if (state === "Loading") {
    text.opacity = 0; // keeps the width, so the button does not jump
    const spin = figma.createEllipse();
    spin.name = "Spinner";
    spin.resize(s.icon, s.icon);
    spin.arcData = { startingAngle: 0, endingAngle: Math.PI * 1.5, innerRadius: 0.78 };
    spin.fills = [fg];
    comp.appendChild(spin);
    spin.layoutPositioning = "ABSOLUTE";
    spin.constraints = { horizontal: "CENTER", vertical: "CENTER" };
  }
  return comp;
}

// ---------------------------------------------------------------- main

async function main() {
  await figma.loadFontAsync({ family: SPEC.font.family, style: SPEC.font.regular });
  await figma.loadFontAsync({ family: SPEC.font.family, style: SPEC.font.strong });
  await loadColorVariables();

  const section = figma.createSection();
  section.name = SPEC.name;
  const center = figma.viewport.center;
  section.x = Math.round(center.x);
  section.y = Math.round(center.y);

  const iconRow = figma.createFrame();
  iconRow.name = "Icons";
  iconRow.fills = [];
  section.appendChild(iconRow);
  const icons = await getIcons(SPEC.icons.source === "create" ? iconRow : section);
  if (SPEC.icons.source === "create") {
    iconRow.resizeWithoutConstraints(SPEC.icons.names.length * 40, 24);
  } else {
    iconRow.remove();
  }
  for (const slot of SPEC.slots) {
    if (!icons[slot.icon]) throw new Error('Slot "' + slot.prop + '" uses icon "' + slot.icon + '", which is not in SPEC.icons.names.');
  }

  // 1. One component per variant x state
  const rows = combos(SPEC.variants);
  const comps = [];
  for (const props of rows) for (const state of SPEC.states) comps.push(drawVariant(props, state, icons));

  // 2. Combine into a set
  const set = figma.combineAsVariants(comps, section);
  set.name = SPEC.name;
  set.description = SPEC.description;

  // 3. Properties on the set
  const labelKey = set.addComponentProperty(SPEC.label.prop, "TEXT", SPEC.label.value);
  const iconList = SPEC.icons.names.map((n) => icons[n]);
  const preferred = iconList.map((c) => ({ type: "COMPONENT", key: c.key }));
  const slotKeys = SPEC.slots.map((slot) => ({
    slot: slot,
    show: set.addComponentProperty(slot.show, "BOOLEAN", slot.on),
    swap: set.addComponentProperty(slot.prop, "INSTANCE_SWAP", icons[slot.icon].id, { preferredValues: preferred }),
  }));

  // 4. Wire every variant's layers to the properties
  for (const v of set.children) {
    const t = v.findOne((n) => n.type === "TEXT" && n.name === SPEC.label.prop);
    if (t) t.componentPropertyReferences = { characters: labelKey };
    for (const k of slotKeys) {
      const inst = v.findOne((n) => n.type === "INSTANCE" && n.name === k.slot.prop);
      if (inst) inst.componentPropertyReferences = { visible: k.show, mainComponent: k.swap };
    }
  }

  // 5. Lay out as a grid: one row per variant combo, one column per state
  const pad = 32, colGap = 32, rowGap = 24;
  const colW = Math.max.apply(null, set.children.map((c) => c.width)) + colGap;
  const rowH = Math.max.apply(null, set.children.map((c) => c.height)) + rowGap;
  set.children.forEach((child, i) => {
    const r = Math.floor(i / SPEC.states.length), col = i % SPEC.states.length;
    child.x = pad + col * colW;
    child.y = pad + r * rowH;
  });
  set.resizeWithoutConstraints(pad * 2 + SPEC.states.length * colW - colGap, pad * 2 + rows.length * rowH - rowGap);

  // 6. Column and row labels, so the sheet reads like a spec
  const labelPaint = [{ type: "SOLID", color: hex("#8A8A8A") }];
  const mk = (txt, x, y) => {
    const t = figma.createText();
    t.fontName = { family: SPEC.font.family, style: SPEC.font.regular };
    t.characters = txt; t.fontSize = 12; t.fills = labelPaint;
    section.appendChild(t); t.x = x; t.y = y;
    return t;
  };
  const left = 200, top = 80;
  set.x = left; set.y = top + 24;
  SPEC.states.forEach((st, col) => mk(st, left + pad + col * colW, top));
  rows.forEach((props, r) => mk(Object.keys(props).map((k) => props[k]).join(" · "), 0, top + 24 + pad + r * rowH + 8));
  iconRow.x = left; iconRow.y = 24;
  section.resizeWithoutConstraints(left + set.width + 80, top + 24 + set.height + 80);

  figma.currentPage.selection = [set];
  figma.viewport.scrollAndZoomIntoView([section]);
  const msg = SPEC.name + ": " + set.children.length + " variants, " + (1 + SPEC.slots.length * 2) + " properties.";
  figma.notify(msg);
  return msg;
}

// ---------------------------------------------------------------- run
// Scripter: top-level await works, keep this line.
// Other runners: see references/plugin-runners.md for the right ending.
await main();
