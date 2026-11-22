/* 目录页 */
(function (JH) {
  "use strict";

  JH.mountChrome();

  var total = JH.site.parts.reduce(function (a, p) { return a + p.chapters.length; }, 0);
  var done = JH.site.parts.reduce(function (a, p) {
    return a + p.chapters.filter(function (c) { return c.ready; }).length;
  }, 0);

  document.getElementById("tocIntro").textContent =
    "全书七篇共 " + total + " 章，已完成 " + done + " 章正文，其余章节按计划逐篇撰写。" +
    "已完成章节可直接进入阅读；未完成者标注「待撰写」，不设空页面。";

  document.getElementById("tocBody").innerHTML = JH.site.parts.map(function (p) {
    var ready = p.chapters.filter(function (c) { return c.ready; }).length;
    return '<section class="toc-part" id="p' + p.num + '">' +
      '<div class="toc-part__head">' +
        '<span class="toc-part__num">第 ' + p.num + " 篇</span>" +
        '<span class="toc-part__title">' + JH.escape(p.title) + "</span>" +
        '<span class="toc-part__span">' + JH.escape(p.span) + "　·　" + ready + " / " + p.chapters.length + " 章</span>" +
      "</div>" +
      p.chapters.map(function (c) {
        if (c.ready) {
          return '<a class="toc-ch toc-ch--ready" href="read.html?c=' + c.id + '">' +
            '<span class="toc-ch__num">' + c.num + "</span>" +
            '<span class="toc-ch__title">' + JH.escape(c.title) + "</span>" +
            '<span class="toc-ch__state">阅读 →</span>' +
          "</a>";
        }
        return '<div class="toc-ch toc-ch--pending">' +
          '<span class="toc-ch__num">' + c.num + "</span>" +
          '<span class="toc-ch__title">' + JH.escape(c.title) + "</span>" +
          '<span class="toc-ch__state">待撰写</span>' +
        "</div>";
      }).join("") +
    "</section>";
  }).join("");

  /* 专题摘要 */
  var tl = document.getElementById("topicList");
  if (tl && JH.topics && JH.topics.length) {
    tl.innerHTML = JH.topics.map(function (t, i) {
      return '<a class="toc-ch toc-ch--ready" href="topic.html?id=' + t.id + '">' +
        '<span class="toc-ch__num">' + (i + 1) + "</span>" +
        '<span class="toc-ch__title">' + JH.escape(t.title) + "</span>" +
        '<span class="toc-ch__state">' + t.links.length + " 章</span>" +
      "</a>";
    }).join("");
  } else if (tl) {
    tl.innerHTML = '<p style="font-size:14px;color:var(--ink-4)">专题整理中。</p>';
  }

  /* 锚点定位 */
  if (location.hash) {
    var el = document.querySelector(location.hash);
    if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 80);
  }
})(window.JH);
