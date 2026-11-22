/* 历史地图：全部为示意图，用于说明历史地理关系 */
(function (JH) {
  "use strict";

  JH.maps = [
    {
      id: "gokishichido",
      title: "五畿七道：律令国家的地方区分",
      ch: "c07",
      desc: "律令制把全国分为畿内与七道，道下设国，国下设郡。道不是行政机构，而是以畿内为中心、按交通路线划分的地理与军事区域；它的名称在此后一千余年里始终被沿用。",
      legend: [
        { color: "#963429", label: "畿内（山城·大和·河内·和泉·摄津）" },
        { color: "#C9C1AE", label: "七道（东海·东山·北陆·山阴·山阳·南海·西海）" }
      ],
      svg: `
<svg viewBox="0 0 880 540" role="img" aria-label="五畿七道示意图">
  <rect width="880" height="540" fill="#F7F4EC"/>
  <text x="24" y="32" font-family="serif" font-size="13" fill="#963429" letter-spacing="2">示意图 · 五畿七道</text>

  <!-- 列岛轮廓（简化，双描边表示海岸线） -->
  <g fill="none" stroke-linecap="round">
    <path d="M150 474 C 220 430 288 392 348 344 C 406 294 470 246 542 200 C 604 160 660 118 706 82" stroke="#D8D2C4" stroke-width="40"/>
    <path d="M150 474 C 220 430 288 392 348 344 C 406 294 470 246 542 200 C 604 160 660 118 706 82" stroke="#F1EDE1" stroke-width="32"/>
    <path d="M392 402 C 424 420 456 428 486 428" stroke="#D8D2C4" stroke-width="26"/>
    <path d="M392 402 C 424 420 456 428 486 428" stroke="#F1EDE1" stroke-width="18"/>
  </g>

  <!-- 畿内 -->
  <circle cx="404" cy="330" r="52" fill="#F3E9E5" stroke="#963429" stroke-width="1.5"/>
  <text x="404" y="326" text-anchor="middle" font-family="serif" font-size="13" fill="#6B211A">畿内</text>
  <text x="404" y="344" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#963429">五国</text>

  <!-- 七道 放射 -->
  <g stroke="#963429" stroke-width="1.4" fill="none">
    <path d="M400 282 L 392 212"/><path d="M446 300 L 552 214"/>
    <path d="M450 344 L 562 360"/><path d="M352 312 L 288 266"/>
    <path d="M352 350 L 244 384"/><path d="M412 382 L 380 460"/>
    <path d="M366 368 L 250 456"/>
  </g>

  <g font-family="serif" font-size="12.5" fill="#1A1917">
    <text x="340" y="202">北陆道</text>
    <text x="560" y="208">东山道</text>
    <text x="570" y="364">东海道</text>
    <text x="228" y="258">山阴道</text>
    <text x="140" y="384">山阳道</text>
    <text x="326" y="482">南海道</text>
    <text x="112" y="470">西海道</text>
  </g>
  <g font-family="sans-serif" font-size="9.5" fill="#8E8778">
    <text x="316" y="216">越前·越中·越后</text>
    <text x="560" y="224">信浓·上野·陆奥</text>
    <text x="570" y="380">伊势·尾张·武藏</text>
    <text x="176" y="272">丹波·但马·出云</text>
    <text x="92" y="398">播磨·备前·长门</text>
    <text x="300" y="498">纪伊·阿波·土佐</text>
    <text x="60" y="484">筑前·肥前·萨摩</text>
  </g>

  <text x="24" y="522" font-family="serif" font-size="10.5" fill="#9A958A">畿内为天皇与贵族的根据地；七道以驿路相连，是中央向地方派遣国司的通道。此图为概念示意，非地理测量图。</text>
</svg>`
    },
    {
      id: "heiankyo",
      title: "平安京：棋盘上的都城",
      ch: "c09",
      desc: "平安京仿唐长安，以朱雀大路为中轴，左右对称。宫城（大内里）在北端中央，南端为罗城门。实际的城市生活很快溢出了规划的范围，东侧的鸭川沿岸成为新的聚居地。",
      legend: [
        { color: "#963429", label: "宫城与官署" },
        { color: "#C9C1AE", label: "条坊街区" }
      ],
      svg: `
<svg viewBox="0 0 880 560" role="img" aria-label="平安京条坊示意图">
  <rect width="880" height="560" fill="#F7F4EC"/>
  <text x="24" y="32" font-family="serif" font-size="13" fill="#963429" letter-spacing="2">示意图 · 平安京条坊</text>

  <!-- 鸭川 -->
  <path d="M760 60 C 748 180 770 300 742 420 C 730 470 736 500 742 530" fill="none" stroke="#B9C6C9" stroke-width="10" opacity=".7"/>
  <text x="768" y="150" font-family="serif" font-size="11" fill="#6E7C80">鸭川</text>

  <!-- 都城轮廓 -->
  <rect x="150" y="70" width="580" height="430" fill="#FFFFFF" stroke="#8E8778"/>

  <!-- 条坊 竖街 -->
  <g stroke="#E4DFD4" stroke-width="1">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${150 + (i + 1) * 58}" y1="70" x2="${150 + (i + 1) * 58}" y2="500"/>`).join("")}
  </g>
  <!-- 条坊 横街 -->
  <g stroke="#E4DFD4" stroke-width="1">
    ${Array.from({ length: 8 }, (_, i) => `<line x1="150" y1="${70 + (i + 1) * 48}" x2="730" y2="${70 + (i + 1) * 48}"/>`).join("")}
  </g>

  <!-- 朱雀大路 -->
  <rect x="424" y="70" width="32" height="430" fill="#F7F4EC"/>
  <line x1="424" y1="70" x2="424" y2="500" stroke="#C9C1AE"/>
  <line x1="456" y1="70" x2="456" y2="500" stroke="#C9C1AE"/>
  <text x="440" y="250" text-anchor="middle" font-family="serif" font-size="11" fill="#6E6A61" transform="rotate(90 440 250)">朱雀大路</text>

  <!-- 大内里 -->
  <rect x="352" y="70" width="176" height="120" fill="#F3E9E5" stroke="#963429"/>
  <text x="440" y="112" text-anchor="middle" font-family="serif" font-size="13" fill="#6B211A">大内里（宫城）</text>
  <text x="440" y="132" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#963429">内里·大极殿·八省</text>
  <rect x="404" y="146" width="72" height="30" fill="#fff" stroke="#963429" stroke-width=".8"/>
  <text x="440" y="166" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="#6B211A">朝堂院</text>

  <!-- 东西寺 -->
  <rect x="330" y="404" width="52" height="40" fill="#fff" stroke="#8E8778"/>
  <text x="356" y="428" text-anchor="middle" font-family="serif" font-size="10.5" fill="#3B3833">西寺</text>
  <rect x="498" y="404" width="52" height="40" fill="#fff" stroke="#8E8778"/>
  <text x="524" y="428" text-anchor="middle" font-family="serif" font-size="10.5" fill="#3B3833">东寺</text>

  <!-- 罗城门 -->
  <rect x="410" y="486" width="60" height="24" fill="#fff" stroke="#963429"/>
  <text x="440" y="503" text-anchor="middle" font-family="serif" font-size="10.5" fill="#6B211A">罗城门</text>

  <text x="120" y="86" font-family="sans-serif" font-size="10" fill="#8E8778">北</text>
  <text x="150" y="524" font-family="serif" font-size="10.5" fill="#9A958A">都城东西约 4.5 公里，南北约 5.3 公里；此图压缩了实际比例，仅示格局。</text>
</svg>`
    },
    {
      id: "miyako",
      title: "都城的迁移：藤原京到平安京",
      ch: "c08",
      desc: "七世纪至八世纪，日本的都城在近畿一带反复迁移。每一次迁都都伴随着政治斗争与制度调整，而都城的位置，也决定了物资运输的路线与贵族集团的分布。",
      legend: [
        { color: "#963429", label: "都城（年代）" },
        { color: "#B9C6C9", label: "水域" }
      ],
      svg: `
<svg viewBox="0 0 880 520" role="img" aria-label="都城迁移示意图">
  <rect width="880" height="520" fill="#F7F4EC"/>
  <text x="24" y="32" font-family="serif" font-size="13" fill="#963429" letter-spacing="2">示意图 · 近畿的都城</text>

  <!-- 海 与 湖 -->
  <path d="M40 300 C 120 300 150 340 200 360 C 250 380 280 400 300 440 L 40 480 Z" fill="#DDE5E6"/>
  <text x="90" y="420" font-family="serif" font-size="11" fill="#6E7C80">大阪湾</text>
  <ellipse cx="300" cy="200" rx="62" ry="38" fill="#DDE5E6"/>
  <text x="300" y="204" text-anchor="middle" font-family="serif" font-size="11" fill="#6E7C80">琵琶湖</text>

  <!-- 淀川 -->
  <path d="M312 226 C 300 300 250 340 210 372" fill="none" stroke="#B9C6C9" stroke-width="7"/>
  <text x="238" y="312" font-family="sans-serif" font-size="9.5" fill="#6E7C80">淀川</text>

  <!-- 都城点 -->
  <!-- 难波宫 -->
  <circle cx="196" cy="392" r="7" fill="#963429"/>
  <text x="212" y="396" font-family="serif" font-size="11.5" fill="#1A1917">难波宫（645·744）</text>
  <!-- 藤原京 -->
  <circle cx="470" cy="404" r="7" fill="#963429"/>
  <text x="486" y="408" font-family="serif" font-size="11.5" fill="#1A1917">藤原京（694）</text>
  <!-- 平城京 -->
  <circle cx="510" cy="358" r="9" fill="#963429"/>
  <text x="526" y="362" font-family="serif" font-size="11.5" fill="#1A1917">平城京（710）</text>
  <!-- 恭仁京 -->
  <circle cx="566" cy="300" r="6" fill="#963429"/>
  <text x="580" y="304" font-family="serif" font-size="11" fill="#3B3833">恭仁京（740）</text>
  <!-- 长冈京 -->
  <circle cx="612" cy="196" r="7" fill="#963429"/>
  <text x="626" y="200" font-family="serif" font-size="11.5" fill="#1A1917">长冈京（784）</text>
  <!-- 平安京 -->
  <circle cx="672" cy="160" r="10" fill="#963429"/>
  <circle cx="672" cy="160" r="17" fill="none" stroke="#963429" stroke-width="1"/>
  <text x="690" y="158" font-family="serif" font-size="13" fill="#6B211A">平安京（794）</text>
  <text x="690" y="176" font-family="sans-serif" font-size="9.5" fill="#963429">此后一千余年</text>

  <!-- 连 线 -->
  <g stroke="#C9C1AE" stroke-width="1" stroke-dasharray="3 5" fill="none">
    <path d="M196 392 C 300 400 400 410 470 404"/>
    <path d="M470 404 C 490 384 500 372 510 358"/>
    <path d="M510 358 C 530 336 548 318 566 300"/>
    <path d="M566 300 C 580 262 596 228 612 196"/>
    <path d="M612 196 C 630 182 650 170 672 160"/>
  </g>

  <text x="24" y="500" font-family="serif" font-size="10.5" fill="#9A958A">都城的位置受运输、地形与政治斗争共同影响；此图为方位示意，距离与形状均经压缩。</text>
</svg>`
    }
  ];
})(window.JH);
