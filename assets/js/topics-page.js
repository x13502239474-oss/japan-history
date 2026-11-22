/* 专题列表页 / 专题详情页 */
(function (JH) {
  "use strict";

  JH.mountChrome();

  var listEl = document.getElementById("topicList");
  var headEl = document.getElementById("topicHead");
  var bodyEl = document.getElementById("topicBody");
  var linksEl = document.getElementById("topicLinks");

  function linkRow(ids, withTitle) {
    return ids.map(function (id) {
      var m = JH.chapterMeta(id);
      if (!m) return "";
      var c = m.chapter;
      if (c.ready) {
        return '<a class="toc-ch toc-ch--ready" href="read.html?c=' + id + '">' +
          '<span class="toc-ch__num">' + c.num + "</span>" +
          '<span class="toc-ch__title">' + JH.escape(c.title) + "</span>" +
          '<span class="toc-ch__state">第 ' + m.part.num + " 篇　阅读 →</span>" +
        "</a>";
      }
      return '<div class="toc-ch toc-ch--pending">' +
        '<span class="toc-ch__num">' + c.num + "</span>" +
        '<span class="toc-ch__title">' + JH.escape(c.title) + "</span>" +
        '<span class="toc-ch__state">待撰写</span>' +
      "</div>";
    }).join("");
  }

  if (listEl) {
    listEl.innerHTML = JH.topics.map(function (t, i) {
      var readyCount = t.links.filter(function (id) { return JH.isReady(id); }).length;
      return '<a class="part-row" href="topic.html?id=' + t.id + '">' +
        '<div class="part-row__num">' + (i + 1 < 10 ? "0" + (i + 1) : i + 1) + "</div>" +
        "<div>" +
          '<div class="part-row__title">' + JH.escape(t.title) + "</div>" +
          '<div class="part-row__desc">' + JH.escape(t.lede) + "</div>" +
        "</div>" +
        '<div class="part-row__meta">' + JH.escape(t.span) + "<br>关联 <b>" + readyCount + "</b> / " + t.links.length + " 章</div>" +
      "</a>";
    }).join("");
    return;
  }

  if (!bodyEl) return;

  var id = JH.qs("id") || JH.topics[0].id;
  var t = null;
  JH.topics.forEach(function (x) { if (x.id === id) t = x; });
  if (!t) {
    bodyEl.innerHTML = "<p>未找到该专题。<a class='xref' href='topics.html'>返回专题列表</a></p>";
    return;
  }

  document.title = t.title + " · 日本史读本";
  headEl.innerHTML =
    '<span class="kicker">Topic　·　' + JH.escape(t.span) + "</span>" +
    "<h1>" + JH.escape(t.title) + "</h1>" +
    '<div class="latin">' + JH.escape(t.en) + "</div>" +
    '<p class="article__sub" style="max-width:34em">' + JH.escape(t.lede) + "</p>";

  bodyEl.innerHTML = JH.render(t.body);
  try { JH.linkify(bodyEl, 30); } catch (e) {}

  linksEl.innerHTML = linkRow(t.links);

  /* 进度条 */
  var pb = document.getElementById("pb");
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (pb && h > 0) pb.style.width = Math.min(100, (window.scrollY / h) * 100) + "%";
  }, { passive: true });
})(window.JH);
