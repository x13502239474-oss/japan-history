/* 历史地图页 */
(function (JH) {
  "use strict";

  JH.mountChrome();

  document.getElementById("pageIntro").textContent =
    "本页地图均为为历史叙述绘制的示意图，用于说明区域划分、都城格局与迁移关系；比例与形状经过压缩，不作为地理测量、边界或行政依据。此后补充的每一幅图，都会注明所依据的文献与年代。";

  document.getElementById("mapList").innerHTML = (JH.maps || []).map(function (m) {
    var meta = m.ch ? JH.chapterMeta(m.ch) : null;
    var legend = (m.legend || []).map(function (l) {
      return '<span><i style="background:' + l.color + '"></i>' + JH.escape(l.label) + "</span>";
    }).join("");
    var link = meta && meta.chapter.ready
      ? '<a class="index-item__link" style="display:inline-block;margin-top:16px" href="read.html?c=' + m.ch + '">相关章节 · 第 ' + meta.chapter.num + " 章　" + JH.escape(meta.chapter.title) + " →</a>"
      : "";
    return '<div class="map-card">' +
      "<h2>" + JH.escape(m.title) + "</h2>" +
      "<p>" + JH.escape(m.desc) + "</p>" +
      '<div style="border:1px solid var(--rule-soft);background:#F7F4EC">' + m.svg + "</div>" +
      '<div class="map-legend">' + legend + "</div>" +
      link +
    "</div>";
  }).join("");
})(window.JH);
