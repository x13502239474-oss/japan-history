/* 人物 / 事件索引页（共用） */
(function (JH) {
  "use strict";

  JH.mountChrome();

  var kind = document.body.dataset.kind;
  var isPeople = kind === "people";
  var data = isPeople ? (JH.people || []) : (JH.events || []);
  var eras = ["古代", "中世", "近世", "近代", "现代"];

  document.getElementById("pageIntro").textContent = isPeople
    ? "共 " + data.length + " 位，按时代分组。每条注明身份、生卒与所属章节，可直接回到正文阅读上下文；人物名在正文首次出现处亦有链接。"
    : "共 " + data.length + " 条，按时代分组。每条注明年代与关联章节；凡学界对年代、性质或规模有争议者，在条目中如实说明不同立场。";

  var body = document.getElementById("indexBody");
  var html = "";

  eras.forEach(function (era) {
    var items = data.filter(function (x) { return (x.era || "古代") === era; });
    if (!items.length) return;
    html += '<div class="section__head" style="margin-top:44px">' +
      '<span class="kicker">' + (isPeople ? "People" : "Events") + "</span>" +
      "<h2>" + era + "</h2>" +
      '<span class="count">' + items.length + " 条</span>" +
    "</div>";
    html += '<div class="index-grid">' + items.map(function (x) {
      var meta = JH.chapterMeta(x.ch);
      var chLabel = meta ? "第 " + meta.chapter.num + " 章　" + JH.escape(meta.chapter.title) : "";
      var top = isPeople ? (x.role || "人物") : (x.date || "");
      var mid = isPeople ? (x.dates || "") : (x.era || "");
      var nameLine = isPeople
        ? JH.escape(x.name) + (x.alias ? " <small>" + JH.escape(x.alias) + "</small>" : "")
        : JH.escape(x.name);
      return '<article class="index-item" id="' + JH.escape(x.name) + '">' +
        '<div class="index-item__letter">' + JH.escape(top) + "</div>" +
        '<div class="index-item__name">' + nameLine + "</div>" +
        '<div class="index-item__letter" style="color:var(--ink-3);letter-spacing:.02em">' + JH.escape(mid) + "</div>" +
        '<div class="index-item__desc">' + JH.escape(x.desc) + "</div>" +
        (meta ? '<a class="index-item__link" href="read.html?c=' + x.ch + '">' + chLabel + " →</a>" : "") +
      "</article>";
    }).join("") + "</div>";
  });

  if (!data.length) {
    html = '<p style="padding:40px 0;color:var(--ink-4)">索引正在整理。</p>';
  }
  body.innerHTML = html;

  /* 锚点定位与高亮 */
  function jump() {
    if (!location.hash) return;
    var name = decodeURIComponent(location.hash.slice(1));
    var el = document.getElementById(name);
    if (!el) return;
    el.classList.add("is-target");
    el.scrollIntoView({ block: "center" });
    setTimeout(function () { el.classList.remove("is-target"); }, 2600);
  }
  setTimeout(jump, 60);
  window.addEventListener("hashchange", jump);
})(window.JH);
