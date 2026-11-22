/* 首页 */
(function (JH) {
  "use strict";

  JH.mountChrome();

  var site = JH.site;
  var rank = function (n) { return n < 10 ? "0" + n : String(n); };

  /* 导语与统计 */
  document.getElementById("heroLede").textContent = site.lede;

  var total = site.parts.reduce(function (a, p) { return a + p.chapters.length; }, 0);
  var done = site.parts.reduce(function (a, p) {
    return a + p.chapters.filter(function (c) { return c.ready; }).length;
  }, 0);

  document.getElementById("heroStats").innerHTML =
    '<div class="stat"><b>' + done + "</b><span>章已完成</span></div>" +
    '<div class="stat"><b>' + total + "</b><span>章规划</span></div>" +
    '<div class="stat"><b>7</b><span>篇</span></div>';

  /* 继续阅读 */
  var last = JH.progress.lastChapter();
  var slot = document.getElementById("resumeSlot");
  if (last && JH.chapterMeta(last)) {
    var m = JH.chapterMeta(last);
    var pct = JH.progress.chapterPercent(last);
    slot.innerHTML =
      '<a class="resume" href="read.html?c=' + last + '">' +
        '<span class="resume__label">继续阅读</span>' +
        '<span class="resume__body">' +
          '<span class="resume__title">' + m.chapter.num + "　" + JH.escape(m.chapter.title) + "</span>" +
          '<span class="resume__meta">第' + m.part.num + "篇　" + JH.escape(m.part.title) + "　·　已读 " + pct + "%</span>" +
        "</span>" +
        '<span class="btn btn--accent">继续</span>' +
      "</a>";
  } else {
    var firstReady = JH.flatChapters().filter(function (f) { return f.chapter.ready; })[0];
    if (firstReady) {
      slot.innerHTML =
        '<a class="resume" href="read.html?c=' + firstReady.chapter.id + '">' +
          '<span class="resume__label">从这里开始</span>' +
          '<span class="resume__body">' +
            '<span class="resume__title">' + firstReady.chapter.num + "　" + JH.escape(firstReady.chapter.title) + "</span>" +
            '<span class="resume__meta">第' + firstReady.part.num + "篇　" + JH.escape(firstReady.part.title) + "</span>" +
          "</span>" +
          '<span class="btn btn--accent">开始阅读</span>' +
        "</a>";
    }
  }

  /* 时间轴 */
  var tl = document.getElementById("timeline");
  tl.innerHTML = '<div class="timeline__track">' + site.timeline.map(function (n) {
    return '<div class="tl-node">' +
      '<div class="tl-node__date">' + JH.escape(n.date) + "</div>" +
      '<div class="tl-node__name">' + JH.escape(n.name) + "</div>" +
      '<div class="tl-node__note">' + JH.escape(n.note) + "</div>" +
    "</div>";
  }).join("") + "</div>";

  /* 七篇 */
  var parts = document.getElementById("parts");
  parts.innerHTML = site.parts.map(function (p) {
    var ready = p.chapters.filter(function (c) { return c.ready; }).length;
    var pct = Math.round((ready / p.chapters.length) * 100);
    return '<a class="part-row" href="catalog.html#p' + p.num + '">' +
      '<div class="part-row__num">' + rank(p.num) + "</div>" +
      "<div>" +
        '<div class="part-row__title">第' + p.num + "篇　" + JH.escape(p.title) + "</div>" +
        '<div class="part-row__desc">' + JH.escape(p.desc) + "</div>" +
      "</div>" +
      '<div class="part-row__meta">' + JH.escape(p.span) + "<br><b>" + ready + "</b> / " + p.chapters.length + " 章" +
        (pct > 0 ? "　·　" + pct + "%" : "") + "</div>" +
    "</a>";
  }).join("");
  document.getElementById("partCount").textContent = "共 " + total + " 章，已完成 " + done + " 章";

  /* 索引入口 */
  var ppl = (JH.people || []).slice(0, 4);
  var evs = (JH.events || []).slice(0, 4);
  var tps = (JH.topics || []).slice(0, 4);
  var mps = (JH.maps || []).slice(0, 3);

  document.getElementById("entries").innerHTML =
    '<a class="entry" href="people.html">' +
      '<div class="entry__title">历史人物<span>' + (JH.people || []).length + " 位</span></div>" +
      '<div class="entry__list">' + (ppl.map(function (x) { return JH.escape(x.name); }).join("　·　") || "整理中") + "</div>" +
    "</a>" +
    '<a class="entry" href="events.html">' +
      '<div class="entry__title">历史事件<span>' + (JH.events || []).length + " 条</span></div>" +
      '<div class="entry__list">' + (evs.map(function (x) { return JH.escape(x.name); }).join("　·　") || "整理中") + "</div>" +
    "</a>" +
    '<a class="entry" href="maps.html">' +
      '<div class="entry__title">历史地图<span>' + (JH.maps || []).length + " 幅</span></div>" +
      '<div class="entry__list">' + (mps.map(function (x) { return JH.escape(x.title); }).join("　·　") || "整理中") + "</div>" +
    "</a>" +
    '<a class="entry" href="topics.html">' +
      '<div class="entry__title">专题研究<span>' + (tps.length ? "八题" : "整理中") + "</span></div>" +
      '<div class="entry__list">' + (tps.map(function (x) { return JH.escape(x.title); }).slice(0, 3).join("　·　") || "整理中") + "</div>" +
    "</a>";

  /* 最近阅读 */
  var visited = JH.progress.visited();
  if (visited.length) {
    document.getElementById("recentSection").hidden = false;
    document.getElementById("recent").innerHTML = visited.slice(0, 6).map(function (id) {
      var mm = JH.chapterMeta(id);
      if (!mm) return "";
      var p = JH.progress.chapterPercent(id);
      return '<a class="toc-ch toc-ch--ready" href="read.html?c=' + id + '" style="text-decoration:none">' +
        '<span class="toc-ch__num">' + mm.chapter.num + "</span>" +
        '<span class="toc-ch__title">' + JH.escape(mm.chapter.title) + "</span>" +
        '<span class="toc-ch__state">已读 ' + p + "%</span>" +
      "</a>";
    }).join("");
  }
})(window.JH);
