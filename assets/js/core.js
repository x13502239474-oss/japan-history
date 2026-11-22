/* ============================================================
   日本史读本 · 核心运行时
   - 本地存储（进度 / 收藏 / 设置）
   - 站点骨架渲染
   - 章节懒加载
   - 极简文本解析器（Markdown-lite）
   ============================================================ */
(function (global) {
  "use strict";

  var JH = global.JH || (global.JH = {});

  /* ---------- 数据容器 ---------- */
  JH.chapters = JH.chapters || {};   // id -> chapter object
  JH.diagrams = JH.diagrams || {};   // name -> svg string
  JH.site = JH.site || null;
  JH.people = JH.people || [];
  JH.events = JH.events || [];
  JH.topics = JH.topics || [];
  JH.maps = JH.maps || [];

  JH.add = function (chapter) {
    JH.chapters[chapter.id] = chapter;
    return chapter;
  };
  JH.addDiagram = function (name, svg) { JH.diagrams[name] = svg; };

  /* ---------- 存储 ---------- */
  var KEY = "nihonshi:v1";
  var DEFAULTS = {
    progress: {},     // chId -> {p, s, t}
    last: null,
    marks: [],        // 收藏的 chId
    settings: { fs: 19, lh: 1.95, w: 36 },
    visited: []
  };

  function readStore() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      var obj = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(DEFAULTS)), obj);
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  var store = readStore();
  var saveTimer = null;

  JH.store = {
    get: function (k) { return store[k]; },
    set: function (k, v) {
      store[k] = v;
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
      }, 120);
    },
    flush: function () {
      clearTimeout(saveTimer);
      try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
    }
  };

  JH.progress = {
    get: function (id) { return store.progress[id] || null; },
    all: function () { return store.progress || {}; },
    mark: function (id, percent, scroll) {
      store.progress[id] = { p: Math.max(0, Math.min(100, percent)), s: scroll || 0, t: Date.now() };
      store.last = id;
      if (store.visited.indexOf(id) === -1) store.visited.unshift(id);
      store.visited = store.visited.slice(0, 12);
      JH.store.set("progress", store.progress);
    },
    lastChapter: function () { return store.last; },
    visited: function () { return store.visited; },
    chapterPercent: function (id) {
      var p = store.progress[id];
      return p ? Math.round(p.p) : 0;
    }
  };

  JH.marks = {
    has: function (id) { return store.marks.indexOf(id) !== -1; },
    toggle: function (id) {
      var i = store.marks.indexOf(id);
      if (i === -1) store.marks.push(id); else store.marks.splice(i, 1);
      JH.store.set("marks", store.marks);
      return i === -1;
    },
    list: function () { return store.marks.slice(); }
  };

  JH.settings = {
    get: function () { return store.settings; },
    set: function (patch) {
      store.settings = Object.assign({}, store.settings, patch);
      JH.store.set("settings", store.settings);
      JH.applySettings();
    }
  };

  JH.applySettings = function () {
    var s = store.settings || DEFAULTS.settings;
    var r = document.documentElement;
    r.style.setProperty("--read-fs", s.fs + "px");
    r.style.setProperty("--read-lh", s.lh);
    r.style.setProperty("--read-w", s.w + "em");
  };

  /* ---------- 章节清单 ---------- */
  JH.chapterMeta = function (id) {
    if (!JH.site) return null;
    for (var i = 0; i < JH.site.parts.length; i++) {
      var list = JH.site.parts[i].chapters;
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === id) {
          return { part: JH.site.parts[i], chapter: list[j], index: j };
        }
      }
    }
    return null;
  };

  JH.flatChapters = function () {
    var out = [];
    if (!JH.site) return out;
    JH.site.parts.forEach(function (p) {
      p.chapters.forEach(function (c) {
        out.push({ part: p, chapter: c });
      });
    });
    return out;
  };

  JH.isReady = function (id) {
    var m = JH.chapterMeta(id);
    return !!(m && m.chapter.ready);
  };

  JH.fileFor = function (id) {
    return "data/ch-" + String(id).replace(/^c/, "") + ".js";
  };

  /* ---------- 章节懒加载 ---------- */
  var pending = {};

  JH.loadChapter = function (id) {
    if (JH.chapters[id]) return Promise.resolve(JH.chapters[id]);
    if (pending[id]) return pending[id];
    pending[id] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = JH.fileFor(id);
      s.async = true;
      s.onload = function () {
        if (JH.chapters[id]) resolve(JH.chapters[id]);
        else reject(new Error("chapter registry miss: " + id));
      };
      s.onerror = function () { reject(new Error("failed to load " + id)); };
      document.head.appendChild(s);
    });
    return pending[id];
  };

  /* ---------- 文本解析器 ---------- */
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inline(text) {
    var out = esc(text);
    // 人物 / 事件 关联
    out = out.replace(/\[\[p:([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, name, label) {
      return '<a class="xref" href="people.html#' + encodeURIComponent(name) + '" data-kind="人物">' + (label || name) + "</a>";
    });
    out = out.replace(/\[\[e:([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, name, label) {
      return '<a class="xref" href="events.html#' + encodeURIComponent(name) + '" data-kind="事件">' + (label || name) + "</a>";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return out;
  }

  /**
   * 支持的轻量语法：
   *   ## 二级标题 / ### 三级标题
   *   > 引文段落  （末行以 | 出处 结尾）
   *   - 列表项
   *   :::note 标题 ... :::
   *   :::source 标题 ... :::
   *   :::figure 图注 ... （内容为 svg 名称，取自 JH.diagrams）
   *   空行分段；段内换行直接拼接
   */
  JH.render = function (body) {
    if (!body) return "";
    var lines = String(body).replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var buf = [];
    var mode = null;     // null | 'quote' | 'list' | 'box'
    var boxLabel = "";
    var boxLines = [];
    var listTag = "ul";

    function flushPara() {
      if (!buf.length) return;
      var text = buf.join("");
      if (text.trim()) html.push("<p>" + inline(text.trim()) + "</p>");
      buf = [];
    }

    function flushMode() {
      if (mode === "quote") {
        var raw = buf.join("").trim();
        var cite = "";
        var cut = raw.lastIndexOf("|");
        if (cut > 0 && raw.slice(cut + 1).length < 40) {
          cite = raw.slice(cut + 1).trim();
          raw = raw.slice(0, cut).trim();
        }
        html.push("<blockquote><p>" + inline(raw) + "</p>" + (cite ? "<cite>" + esc(cite) + "</cite>" : "") + "</blockquote>");
        buf = [];
      } else if (mode === "list") {
        html.push("<" + listTag + ">" + buf.map(function (t) {
          return "<li>" + inline(t) + "</li>";
        }).join("") + "</" + listTag + ">");
        buf = [];
      } else if (mode === "box") {
        var cls = boxLabel.indexOf("source") === 0 ? "source" : "note";
        var title = boxLabel.replace(/^(note|source)\s*/, "");
        var inner = boxLines.join("\n");
        var bodyHtml = JH.render(inner);
        if (cls === "note") {
          html.push('<div class="note">' + (title ? '<span class="note__label">' + esc(title) + "</span>" : "") + bodyHtml + "</div>");
        } else {
          html.push('<div class="source">' + (title ? "<b>" + esc(title) + "</b>　" : "") + bodyHtml.replace(/<\/?p>/g, "") + "</div>");
        }
        boxLines = [];
      }
      mode = null;
    }

    function closeAll() { flushPara(); if (mode) flushMode(); }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var t = line.trim();

      if (mode === "box") {
        if (t === ":::") { flushMode(); continue; }
        boxLines.push(line);
        continue;
      }

      if (t === "") { closeAll(); continue; }

      if (t.indexOf(":::") === 0) {
        closeAll();
        var spec = t.slice(3).trim();
        if (spec.indexOf("figure") === 0) {
          var cap = spec.slice(6).trim();
          var parts = cap.split("|");
          var svgName = parts[0].trim();
          var caption = parts[1] ? parts[1].trim() : "";
          var svg = JH.diagrams[svgName] || "";
          html.push('<figure class="figure">' + svg + (caption ? "<figcaption>" + esc(caption) + "</figcaption>" : "") + "</figure>");
          continue;
        }
        mode = "box";
        boxLabel = spec;
        boxLines = [];
        continue;
      }

      if (t.indexOf("## ") === 0) { closeAll(); html.push("<h2>" + inline(t.slice(3)) + "</h2>"); continue; }
      if (t.indexOf("### ") === 0) { closeAll(); html.push("<h3>" + inline(t.slice(4)) + "</h3>"); continue; }
      if (t.indexOf("> ") === 0) {
        if (mode !== "quote") { closeAll(); mode = "quote"; }
        buf.push(t.slice(2));
        continue;
      }
      if (/^[-*]\s/.test(t)) {
        if (mode !== "list") { closeAll(); mode = "list"; listTag = "ul"; }
        buf.push(t.replace(/^[-*]\s+/, ""));
        continue;
      }
      if (/^\d+\.\s/.test(t)) {
        if (mode !== "list") { closeAll(); mode = "list"; listTag = "ol"; }
        buf.push(t.replace(/^\d+\.\s+/, ""));
        continue;
      }

      flushPara();
      buf.push(t);
    }
    closeAll();
    return html.join("\n");
  };

  /* ---------- 正文内联关联（人物 / 事件首次出现处自动加链） ---------- */
  JH.linkify = function (root, limit) {
    if (!root || typeof document.createTreeWalker !== "function") return;
    var names = [];
    (JH.people || []).forEach(function (p) { names.push({ n: p.name, k: "p" }); });
    (JH.events || []).forEach(function (e) { names.push({ n: e.name, k: "e" }); });
    names = names.filter(function (x) { return x.n && x.n.length >= 2; });
    names.sort(function (a, b) { return b.n.length - a.n.length; });
    if (!names.length) return;

    var used = {};
    var count = 0;
    var max = limit || 40;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("a, h1, h2, h3, cite, .note__label, .source, figure")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      if (count >= max) return;
      var text = node.nodeValue;
      var frag = document.createDocumentFragment();
      var pos = 0, changed = false;

      while (pos < text.length && count < max) {
        var best = null;
        for (var i = 0; i < names.length; i++) {
          var nm = names[i];
          if (used[nm.n]) continue;
          var at = text.indexOf(nm.n, pos);
          if (at === -1) continue;
          if (!best || at < best.at || (at === best.at && nm.n.length > best.nm.n.length)) {
            best = { at: at, nm: nm };
          }
        }
        if (!best) break;
        if (best.at > pos) frag.appendChild(document.createTextNode(text.slice(pos, best.at)));
        var a = document.createElement("a");
        a.className = "xref";
        a.setAttribute("data-kind", best.nm.k === "p" ? "人物" : "事件");
        a.href = (best.nm.k === "p" ? "people.html#" : "events.html#") + encodeURIComponent(best.nm.n);
        a.textContent = best.nm.n;
        frag.appendChild(a);
        used[best.nm.n] = true;
        count++;
        changed = true;
        pos = best.at + best.nm.n.length;
      }

      if (changed) {
        if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
        node.parentNode.replaceChild(frag, node);
      }
    });
  };

  /* ---------- 站点骨架 ---------- */
  var NAV = [
    { href: "index.html", label: "首页" },
    { href: "catalog.html", label: "目录" },
    { href: "topics.html", label: "专题" },
    { href: "people.html", label: "人物" },
    { href: "events.html", label: "事件" },
    { href: "maps.html", label: "地图" },
    { href: "search.html", label: "检索" }
  ];

  JH.mountChrome = function () {
    var here = location.pathname.split("/").pop() || "index.html";
    var head = document.getElementById("site-header");
    if (head) {
      head.className = "masthead";
      head.innerHTML =
        '<div class="wrap masthead__inner">' +
          '<a class="brand" href="index.html"><span class="brand__mark"></span>日本史读本<span class="brand__sub">Nihon Shi</span></a>' +
          '<nav class="nav">' +
            NAV.map(function (n) {
              return '<a href="' + n.href + '"' + (n.href === here ? ' aria-current="page"' : "") + ">" + n.label + "</a>";
            }).join("") +
          "</nav>" +
        "</div>";
    }

    var foot = document.getElementById("site-footer");
    if (foot) {
      var total = JH.site ? JH.site.parts.reduce(function (a, p) { return a + p.chapters.length; }, 0) : 0;
      var done = JH.site ? JH.site.parts.reduce(function (a, p) {
        return a + p.chapters.filter(function (c) { return c.ready; }).length;
      }, 0) : 0;
      foot.className = "footer";
      foot.innerHTML =
        '<div class="wrap footer__grid">' +
          "<div style='max-width:34em'>" +
            "<strong>日本史读本</strong>　一个以阅读为核心的个人日本史数字读物。<br>" +
            "主线依据康拉德·托特曼《日本史》（第二版），政治制度与权力结构参考升味准之辅《日本政治史》，" +
            "战败与占领时期参考约翰·W·道尔《拥抱战败》。" +
          "</div>" +
          "<div>" +
            "已完成 <strong>" + done + "</strong> / " + total + " 章<br>" +
            "阅读记录保存在本机浏览器中<br>" +
            "<a href='catalog.html'>全部目录</a>" +
          "</div>" +
        "</div>";
    }

    JH.applySettings();
  };

  /* ---------- 小工具 ---------- */
  JH.toast = function (msg, ms) {
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-on"); });
    setTimeout(function () {
      el.classList.remove("is-on");
      setTimeout(function () { el.remove(); }, 260);
    }, ms || 2000);
  };

  JH.qs = function (name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  };

  JH.escape = esc;
  JH.readTime = function (body) {
    var chars = String(body || "").replace(/\s/g, "").length;
    return Math.max(1, Math.round(chars / 420));
  };

  global.addEventListener("beforeunload", JH.store.flush);
})(window);
