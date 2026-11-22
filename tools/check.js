/* 开发辅助：在 Node 中校验章节数据与渲染结果
   用法：node tools/check.js  */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const root = path.join(__dirname, "..");

const store = {};
const ctx = {
  console, setTimeout, clearTimeout, Promise, Date, JSON, Math, RegExp,
  localStorage: { getItem: k => store[k] || null, setItem: (k, v) => (store[k] = v) },
  addEventListener: () => {},
  location: { search: "", pathname: "/index.html" },
  document: {
    documentElement: { style: { setProperty: () => {} } },
    createElement: () => ({}),
    getElementById: () => null,
    querySelectorAll: () => [],
    head: { appendChild: () => {} }
  }
};
ctx.window = ctx;
vm.createContext(ctx);

function run(f) {
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
}

run("assets/js/core.js");
run("data/site.js");
["people.js", "events.js", "topics.js"].forEach(f => {
  if (fs.existsSync(path.join(root, "data", f))) run("data/" + f);
});

const JH = ctx.JH;
const ready = [];
JH.site.parts.forEach(p => p.chapters.forEach(c => { if (c.ready) ready.push(c); }));

let fail = 0;
console.log("已完成章节：" + ready.length + " / " +
  JH.site.parts.reduce((a, p) => a + p.chapters.length, 0));

ready.forEach(c => {
  const file = "data/ch-" + c.id.replace(/^c/, "") + ".js";
  if (!fs.existsSync(path.join(root, file))) { console.log("✗ 缺文件 " + file); fail++; return; }
  try { run(file); } catch (e) { console.log("✗ 载入失败 " + file + " :: " + e.message); fail++; return; }
  const ch = JH.chapters[c.id];
  if (!ch) { console.log("✗ 未注册 " + file); fail++; return; }
  const html = JH.render(ch.body);
  const chars = ch.body.replace(/\s/g, "").length;
  const problems = [];
  if (html.includes(":::")) problems.push("残留 :::");
  if (/<p>##/.test(html)) problems.push("未解析标题");
  if (html.includes("[[")) problems.push("未解析交叉引用");
  if (chars < 1800) problems.push("正文偏短(" + chars + ")");
  if (!ch.sources) problems.push("缺 sources");
  if (problems.length) { fail++; console.log("✗ " + c.id + " " + problems.join(" / ")); }
  else console.log("✓ " + c.id + " " + chars + " 字  h2×" + (html.match(/<h2>/g) || []).length +
    "  p×" + (html.match(/<p>/g) || []).length);
});

// 人物 / 事件 的章节引用校验
(JH.people || []).forEach(p => { if (p.ch && !JH.chapterMeta(p.ch)) { console.log("✗ 人物章节无效: " + p.name); fail++; } });
(JH.events || []).forEach(e => { if (e.ch && !JH.chapterMeta(e.ch)) { console.log("✗ 事件章节无效: " + e.name); fail++; } });

console.log(fail ? "\n存在问题：" + fail : "\n全部通过");
process.exit(fail ? 1 : 0);
