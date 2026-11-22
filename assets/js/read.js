/* 阅读页逻辑 */
(function (JH) {
  "use strict";

  var articleEl = document.getElementById("article");
  var headEl = document.getElementById("artHead");
  var bodyEl = document.getElementById("artBody");
  var navEl = document.getElementById("chNav");
  var relEl = document.getElementById("related");
  var railEl = document.getElementById("rail");
  var toolsEl = document.getElementById("tools");
  var pbEl = document.getElementById("pb");
  var drawer = document.getElementById("drawer");
  var drawerRail = document.getElementById("drawerRail");
  var drawerTools = document.getElementById("drawerTools");

  var currentId = null;
  var current = null;
  var restoreTarget = 0;

  /* ---------- 目录（左栏 + 抽屉） ---------- */
  function railHTML() {
    var html = '<div class="rail__label">全书目录</div>';
    JH.site.parts.forEach(function (p) {
      html += '<div class="rail__part">第' + p.num + '篇　' + p.title + "</div><ul class=\"rail__list\">";
      p.chapters.forEach(function (c) {
        if (c.ready) {
          html += '<li><a href="read.html?c=' + c.id + '"' + (c.id === currentId ? ' class="is-current"' : "") + ">" +
            c.num + "　" + c.title + "</a></li>";
        } else {
          html += '<li><a class="is-locked" aria-disabled="true">' + c.num + "　" + c.title + "</a></li>";
        }
      });
      html += "</ul>";
    });
    return html;
  }

  function renderRails() {
    railEl.innerHTML = railHTML();
    drawerRail.innerHTML = railHTML();
  }

  /* ---------- 设置面板 ---------- */
  function toolsHTML() {
    var s = JH.settings.get();
    return '' +
      '<div class="tools__group">' +
        '<div class="tools__label">阅读设置</div>' +
        '<div class="tool-row"><span>字号</span><div class="stepper">' +
          '<button type="button" data-set="fs" data-dir="-1" aria-label="减小字号">−</button>' +
          '<span id="val-fs">' + s.fs + "</span>" +
          '<button type="button" data-set="fs" data-dir="1" aria-label="增大字号">+</button>' +
        "</div></div>" +
        '<div class="tool-row"><span>行距</span><div class="stepper">' +
          '<button type="button" data-set="lh" data-dir="-1" aria-label="减小行距">−</button>' +
          '<span id="val-lh">' + s.lh.toFixed(1) + "</span>" +
          '<button type="button" data-set="lh" data-dir="1" aria-label="增大行距">+</button>' +
        "</div></div>" +
        '<div class="tool-row"><span>版心</span><div class="stepper">' +
          '<button type="button" data-set="w" data-dir="-1" aria-label="收窄版心">−</button>' +
          '<span id="val-w">' + s.w + "</span>" +
          '<button type="button" data-set="w" data-dir="1" aria-label="加宽版心">+</button>' +
        "</div></div>" +
      "</div>" +
      '<div class="tools__group">' +
        '<button class="btn-bookmark" type="button" data-act="mark">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg>' +
          '<span id="markLabel">收藏本章</span>' +
        "</button>" +
        '<div class="tools__note" style="margin-top:12px">阅读位置自动保存在本机，刷新或下次打开会回到上次停下的地方。</div>' +
      "</div>";
  }

  function renderTools() {
    toolsEl.innerHTML = toolsHTML();
    drawerTools.innerHTML = toolsHTML();
    syncMark();
  }

  function syncMark() {
    var on = JH.marks.has(currentId);
    document.querySelectorAll('[data-act="mark"]').forEach(function (b) {
      b.classList.toggle("is-on", on);
    });
    var l = document.getElementById("markLabel");
    if (l) l.textContent = on ? "已收藏" : "收藏本章";
  }

  function bindSteppers(root) {
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-set]");
      if (!btn) return;
      var key = btn.getAttribute("data-set");
      var dir = Number(btn.getAttribute("data-dir"));
      var s = JH.settings.get();
      var val = s[key];
      if (key === "fs") val = Math.min(24, Math.max(16, val + dir));
      if (key === "lh") val = Math.min(2.3, Math.max(1.6, Math.round((val + dir * 0.1) * 10) / 10));
      if (key === "w") val = Math.min(46, Math.max(28, val + dir * 2));
      var patch = {}; patch[key] = val;
      JH.settings.set(patch);
      // 同步两处显示
      document.querySelectorAll("#val-" + key).forEach(function (el) {
        el.textContent = key === "lh" ? val.toFixed(1) : val;
      });
    });
  }

  /* ---------- 渲染 ---------- */
  function partOf(id) {
    var m = JH.chapterMeta(id);
    return m ? m.part : null;
  }

  function renderArticle(ch) {
    var meta = JH.chapterMeta(ch.id);
    var part = meta.part;
    var chars = ch.body.replace(/\s/g, "").length;

    headEl.hidden = false;
    headEl.innerHTML =
      '<div class="article__chapter">第' + part.num + "篇　" + part.title + "　·　第" + ch.num + "章</div>" +
      "<h1>" + JH.escape(ch.title) + "</h1>" +
      (ch.sub ? '<p class="article__sub">' + JH.escape(ch.sub) + "</p>" : "") +
      '<div class="article__meta">' +
        "<span>约 " + chars.toLocaleString("en-US") + " 字</span><span class=\"dot\"></span>" +
        "<span>阅读约 " + Math.max(3, Math.round(chars / 400)) + " 分钟</span><span class=\"dot\"></span>" +
        "<span>" + (part.span || "") + "</span>" +
      "</div>";

    bodyEl.innerHTML = JH.render(ch.body) +
      (ch.sources ? '<div class="source"><b>本章依据</b>' + JH.escape(ch.sources) + "</div>" : "");

    // 人物 / 事件首次出现处自动关联
    try { JH.linkify(bodyEl, 36); } catch (e) {}

    // 上下章
    var flat = JH.flatChapters();
    var idx = -1;
    flat.forEach(function (f, i) { if (f.chapter.id === ch.id) idx = i; });
    var prev = idx > 0 ? flat[idx - 1].chapter : null;
    var next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1].chapter : null;

    navEl.innerHTML =
      (prev && prev.ready
        ? '<a href="read.html?c=' + prev.id + '"><span class="cn-label">上一章</span><span class="cn-title">' + prev.num + "　" + JH.escape(prev.title) + "</span></a>"
        : '<div class="cn-empty"><span class="cn-label">上一章</span><span class="cn-title">已是全书开篇</span></div>') +
      (next && next.ready
        ? '<a class="chapter-nav__next" href="read.html?c=' + next.id + '"><span class="cn-label">下一章</span><span class="cn-title">' + next.num + "　" + JH.escape(next.title) + "</span></a>"
        : '<div class="chapter-nav__next cn-empty"><span class="cn-label">下一章</span><span class="cn-title">' +
            (next ? JH.escape(next.title) + "　（待撰写）" : "全书于此结束") + "</span></div>");

    // 关联
    var chips = [];
    (ch.people || []).forEach(function (n) {
      chips.push('<a class="chip" href="people.html#' + encodeURIComponent(n) + '"><span class="chip__kind">人物</span>' + JH.escape(n) + "</a>");
    });
    (ch.events || []).forEach(function (n) {
      chips.push('<a class="chip" href="events.html#' + encodeURIComponent(n) + '"><span class="chip__kind">事件</span>' + JH.escape(n) + "</a>");
    });
    (ch.related || []).forEach(function (rid) {
      var m = JH.chapterMeta(rid);
      if (m && m.chapter.ready) {
        chips.push('<a class="chip" href="read.html?c=' + rid + '"><span class="chip__kind">延伸</span>' + JH.escape(m.chapter.title) + "</a>");
      }
    });
    if (chips.length) {
      relEl.hidden = false;
      relEl.innerHTML = '<div class="related__label">相关条目</div><div class="related__chips">' + chips.join("") + "</div>";
    }

    document.title = ch.title + " · 日本史读本";
  }

  /* ---------- 进度 ---------- */
  function docPercent() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return 100;
    return Math.max(0, Math.min(100, (window.scrollY / h) * 100));
  }

  var saveTick = null;
  function onScroll() {
    var p = docPercent();
    pbEl.style.width = p + "%";
    if (saveTick) return;
    saveTick = setTimeout(function () {
      saveTick = null;
      if (currentId) JH.progress.mark(currentId, p, window.scrollY);
    }, 900);
  }

  /* ---------- 启动 ---------- */
  function boot() {
    JH.mountChrome();
    var id = JH.qs("c") || JH.progress.lastChapter();
    if (!id || !JH.chapterMeta(id)) {
      var first = JH.flatChapters().filter(function (f) { return f.chapter.ready; })[0];
      id = first ? first.chapter.id : null;
    }
    if (!id) {
      bodyEl.innerHTML = "<p>还没有任何一章完成。</p>";
      return;
    }
    if (!JH.isReady(id)) {
      bodyEl.innerHTML = '<p style="text-indent:0">这一章尚未撰写。请回到<a class="xref" href="catalog.html">目录</a>，选择已完成的章节阅读。</p>';
      return;
    }

    currentId = id;
    renderRails();
    renderTools();

    var saved = JH.progress.get(id);
    restoreTarget = saved && saved.p > 3 && saved.p < 97 ? saved.s : 0;

    JH.loadChapter(id).then(function (ch) {
      current = ch;
      renderArticle(ch);
      renderRails();
      syncMark();
      if (restoreTarget > 0) {
        requestAnimationFrame(function () {
          setTimeout(function () {
            window.scrollTo(0, restoreTarget);
            JH.toast("已回到上次阅读位置（" + Math.round(saved.p) + "%）");
          }, 60);
        });
      }
      JH.progress.mark(id, saved ? saved.p : 0, restoreTarget);
    }).catch(function (err) {
      bodyEl.innerHTML = '<p style="text-indent:0">章节载入失败：' + JH.escape(err.message) + "</p>";
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && currentId) JH.progress.mark(currentId, docPercent(), window.scrollY);
    });
  }

  /* ---------- 交互 ---------- */
  document.addEventListener("click", function (e) {
    var act = e.target.closest("[data-act]");
    if (act) {
      var a = act.getAttribute("data-act");
      if (a === "mark") {
        if (!currentId) return;
        var on = JH.marks.toggle(currentId);
        syncMark();
        JH.toast(on ? "已收藏本章" : "已取消收藏");
        return;
      }
      if (a === "toc") { drawer.classList.add("is-open"); return; }
      if (a === "close") { drawer.classList.remove("is-open"); return; }
      if (a === "top") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      if (a === "font") {
        var s = JH.settings.get();
        var next = s.fs >= 22 ? 17 : s.fs + 1;
        JH.settings.set({ fs: next });
        document.querySelectorAll("#val-fs").forEach(function (el) { el.textContent = next; });
        JH.toast("字号 " + next + "px");
        return;
      }
    }
    // 抽屉内点击链接后关闭
    var link = e.target.closest("a[href^='read.html']");
    if (link && drawer.contains(link)) drawer.classList.remove("is-open");
  });

  bindSteppers(toolsEl);
  bindSteppers(drawerTools);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") drawer.classList.remove("is-open");
  });

  boot();
})(window.JH);
