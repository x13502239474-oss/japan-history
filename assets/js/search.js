/* 全站检索：懒加载全部已完成章节后本地全文匹配 */
(function (JH) {
  "use strict";

  JH.mountChrome();

  var docs = [];       // {id, num, title, partNum, blockIndex, text}
  var ready = false;
  var qEl = document.getElementById("q");
  var hintEl = document.getElementById("hint");
  var resEl = document.getElementById("results");

  function strip(md) {
    return md
      .replace(/^#{2,3}\s*/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^:::\s*/gm, "")
      .replace(/\*\*/g, "")
      .replace(/\[\[([pe]):([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, k, n, l) { return l || n; });
  }

  function build() {
    var list = JH.flatChapters().filter(function (f) { return f.chapter.ready; });
    return Promise.all(list.map(function (f) {
      return JH.loadChapter(f.chapter.id).then(function (ch) {
        var blocks = String(ch.body).split(/\n\s*\n/);
        blocks.forEach(function (raw, i) {
          var text = strip(raw).replace(/\s+/g, " ").trim();
          if (!text || text.length < 12) return;
          docs.push({
            id: ch.id,
            num: ch.num,
            title: ch.title,
            partNum: f.part.num,
            blockIndex: i,
            text: text
          });
        });
      }).catch(function () {});
    })).then(function () {
      ready = true;
      hintEl.textContent = "索引已建立：" + list.length + " 章，" + docs.length + " 段。输入关键词开始检索。";
    });
  }

  function esc(s) { return JH.escape(s); }

  function highlight(text, tokens) {
    var out = esc(text);
    tokens.forEach(function (t) {
      if (!t) return;
      var re = new RegExp("(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function snippet(text, tokens) {
    var at = -1;
    for (var i = 0; i < tokens.length; i++) {
      var p = text.indexOf(tokens[i]);
      if (p !== -1 && (at === -1 || p < at)) at = p;
    }
    if (at === -1) at = 0;
    var start = Math.max(0, at - 46);
    var end = Math.min(text.length, at + 120);
    return (start > 0 ? "…" : "") + highlight(text.slice(start, end), tokens) + (end < text.length ? "…" : "");
  }

  function run() {
    var q = qEl.value.trim();
    if (!q) { resEl.innerHTML = ""; return; }
    if (!ready) return;
    var tokens = q.split(/\s+/).filter(Boolean);
    var hits = docs.filter(function (d) {
      return tokens.every(function (t) { return d.text.indexOf(t) !== -1; });
    });

    var byChapter = {};
    hits.forEach(function (d) {
      (byChapter[d.id] = byChapter[d.id] || []).push(d);
    });

    var ids = Object.keys(byChapter);
    if (!ids.length) {
      hintEl.textContent = "没有找到与「" + q + "」匹配的段落。";
      resEl.innerHTML = "";
      return;
    }
    hintEl.textContent = "共 " + hits.length + " 处，涉及 " + ids.length + " 章。";
    resEl.innerHTML = ids.map(function (id) {
      var first = byChapter[id][0];
      var meta = JH.chapterMeta(id);
      var items = byChapter[id].slice(0, 3);
      return '<div class="sr">' +
        '<div class="sr__crumb">第' + meta.part.num + "篇　·　第 " + first.num + " 章　·　" + byChapter[id].length + " 处</div>" +
        '<a class="sr__title" href="read.html?c=' + id + '">' + esc(first.title) + " →</a>" +
        items.map(function (d) {
          return '<div class="sr__snippet">' + snippet(d.text, tokens) + "</div>";
        }).join("") +
      "</div>";
    }).join("");
  }

  var timer = null;
  qEl.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(run, 160);
  });
  qEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { clearTimeout(timer); run(); }
  });

  build().then(function () {
    var q = JH.qs("q");
    if (q) { qEl.value = q; run(); }
    else qEl.focus();
  });
})(window.JH);
