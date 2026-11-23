// Runs the template against a small fake of the Figma Plugin API.
// It does not prove the script looks right in Figma. It catches syntax
// errors, missing font loads, wrong enum values and broken property wiring.
// Run: node test/mock-run.test.js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const ENUMS = {
  layoutMode: ["NONE", "HORIZONTAL", "VERTICAL"],
  primaryAxisSizingMode: ["FIXED", "AUTO"],
  counterAxisSizingMode: ["FIXED", "AUTO"],
  primaryAxisAlignItems: ["MIN", "MAX", "CENTER", "SPACE_BETWEEN"],
  counterAxisAlignItems: ["MIN", "MAX", "CENTER", "BASELINE"],
  strokeAlign: ["CENTER", "INSIDE", "OUTSIDE"],
  textAutoResize: ["NONE", "WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE"],
  layoutPositioning: ["AUTO", "ABSOLUTE"],
};
let ids = 0;
const loadedFonts = new Set();

function makeFigma() {
  const pageChildren = [];
  class Node {
    constructor(type) {
      this.type = type; this.id = "1:" + ++ids; this.name = type; this.children = [];
      this.parent = null; this.visible = true; this.x = 0; this.y = 0; this.width = 100; this.height = 100;
      this.fills = []; this.strokes = []; this.effects = []; this.constraints = { horizontal: "MIN", vertical: "MIN" };
      this._refs = null;
      return new Proxy(this, {
        set(t, k, v) {
          if (ENUMS[k]) assert(ENUMS[k].includes(v), k + " = " + v + " is not a valid value");
          if (k === "componentPropertyReferences") {
            const allowed = t.type === "TEXT" ? ["visible", "characters"] : t.type === "INSTANCE" ? ["visible", "mainComponent"] : ["visible"];
            for (const key of Object.keys(v)) assert(allowed.includes(key), key + " reference is not allowed on " + t.type);
            for (const key of Object.values(v)) assert(/#/.test(key) || key === "", "reference must use the key returned by addComponentProperty");
          }
          if (k === "characters") {
            const f = t.fontName;
            assert(f && loadedFonts.has(f.family + "/" + f.style), "font not loaded before setting characters: " + JSON.stringify(f));
          }
          t[k] = v; return true;
        },
      });
    }
    appendChild(n) { if (n.parent) n.parent.children.splice(n.parent.children.indexOf(n), 1); n.parent = this; this.children.push(n); }
    remove() { if (this.parent) this.parent.children.splice(this.parent.children.indexOf(this), 1); this.removed = true; }
    resize(w, h) { assert(w >= 0.01 && h >= 0.01, "bad size"); this.width = w; this.height = h; }
    resizeWithoutConstraints(w, h) { this.resize(w, h); }
    findAll(fn) { const out = []; const walk = (n) => n.children.forEach((c) => { if (!fn || fn(c)) out.push(c); walk(c); }); walk(this); return out; }
    findOne(fn) { return this.findAll(fn)[0] || null; }
  }
  class Component extends Node {
    constructor() { super("COMPONENT"); this.key = "key" + ids; }
    createInstance() { const i = new Node("INSTANCE"); i.mainComponent = this; i.width = this.width; i.height = this.height; this.children.forEach(() => { const v = new Node("VECTOR"); v.strokes = [{}]; i.appendChild(v); }); return i; }
  }
  class ComponentSet extends Node {
    constructor() { super("COMPONENT_SET"); this.props = {}; }
    addComponentProperty(name, type, def, opts) {
      assert(["BOOLEAN", "TEXT", "INSTANCE_SWAP", "VARIANT"].includes(type), "bad property type " + type);
      if (type === "BOOLEAN") assert(typeof def === "boolean");
      if (type === "TEXT") assert(typeof def === "string");
      if (type === "INSTANCE_SWAP") {
        assert(/^1:\d+$/.test(def), "instance swap default must be a component id");
        if (opts && opts.preferredValues) opts.preferredValues.forEach((p) => assert(p.type === "COMPONENT" && p.key, "bad preferred value"));
      }
      const key = name + "#" + ++ids; this.props[key] = { type, def }; return key;
    }
  }
  const page = new Node("PAGE"); page.children = pageChildren;
  page.selection = [];
  return {
    page,
    figma: {
      currentPage: page,
      viewport: { center: { x: 10, y: 20 }, scrollAndZoomIntoView() {} },
      variables: {
        async getLocalVariablesAsync(t) { assert.equal(t, "COLOR"); return [{ name: "color/action/primary", id: "VariableID:1" }]; },
        setBoundVariableForPaint(p, field, v) { assert.equal(field, "color"); return Object.assign({}, p, { boundVariables: { color: { type: "VARIABLE_ALIAS", id: v.id } } }); },
      },
      async loadFontAsync(f) { loadedFonts.add(f.family + "/" + f.style); },
      createSection() { const n = new Node("SECTION"); page.appendChild(n); return n; },
      createFrame() { const n = new Node("FRAME"); page.appendChild(n); return n; },
      createText() { const n = new Node("TEXT"); page.appendChild(n); return n; },
      createEllipse() { const n = new Node("ELLIPSE"); page.appendChild(n); return n; },
      createComponent() { const n = new Component(); page.appendChild(n); return n; },
      createNodeFromSvg(svg) { assert(svg.startsWith("<svg")); const f = new Node("FRAME"); const v = new Node("VECTOR"); v.strokes = [{}]; f.appendChild(v); page.appendChild(f); return f; },
      createComponentFromNode(n) { const c = new Component(); n.children.slice().forEach((ch) => c.appendChild(ch)); (n.parent || page).appendChild(c); n.remove(); return c; },
      combineAsVariants(nodes, parent) {
        assert(nodes.length > 0);
        nodes.forEach((n) => { assert.equal(n.type, "COMPONENT"); assert(/=/.test(n.name), "variant names need Prop=Value: " + n.name); });
        const names = new Set(nodes.map((n) => n.name)); assert.equal(names.size, nodes.length, "duplicate variant names");
        const s = new ComponentSet(); parent.appendChild(s); nodes.forEach((n) => s.appendChild(n)); return s;
      },
      notify(m) { this._msg = m; },
    },
  };
}

(async () => {
  const file = path.join(__dirname, "..", "skills", "figma-component-script", "templates", "component-set.figma.js");
  const code = fs.readFileSync(file, "utf8");
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const { figma } = makeFigma();
  await new AsyncFunction("figma", code)(figma);

  const set = figma.currentPage.findOne((n) => n.type === "COMPONENT_SET");
  assert(set, "no component set");
  assert.equal(set.children.length, 3 * 3 * 6, "variant count");
  const types = Object.values(set.props).map((p) => p.type).sort();
  assert.deepEqual(types, ["BOOLEAN", "BOOLEAN", "INSTANCE_SWAP", "INSTANCE_SWAP", "TEXT"]);
  for (const v of set.children) {
    const insts = v.findAll((n) => n.type === "INSTANCE");
    assert.equal(insts.length, 2, "each variant has two icon slots");
    insts.forEach((i) => assert(i.componentPropertyReferences && i.componentPropertyReferences.visible && i.componentPropertyReferences.mainComponent, "slot not wired"));
    const t = v.findOne((n) => n.type === "TEXT");
    assert(t.componentPropertyReferences.characters, "label not wired");
  }
  const primary = set.children.find((c) => c.name === "Size=M, Style=Primary, State=Default");
  assert(primary.fills[0].boundVariables, "token should bind when the variable exists");
  const focus = set.children.find((c) => c.name.endsWith("State=Focus"));
  assert.equal(focus.effects.length, 2, "focus ring");
  console.log("ok:", figma._msg);
})().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
