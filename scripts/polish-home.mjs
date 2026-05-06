import { readFileSync, writeFileSync } from "node:fs";

const file = "out/index.html";
const title = "전라도 마사지킹 출장마사지 | 광주 전주 여수 홈타이 전문";
const description = "전라도 전 지역 마사지킹 출장마사지 & 홈타이. 광주, 전주, 여수, 순천, 완주 실시간 예약. 관리사 30분 내 도착.";
const homeContent = `<section class="section home-eeat"><p class="eyebrow">전라도 출장마사지 이용 전 확인 안내</p><h2>전라도 출장마사지를 알아볼 때 먼저 확인해야 할 기준</h2><div class="home-eeat-box"><p>전라도 출장마사지는 단순히 지역명과 가격만 보고 결정하기보다 현재 위치, 방문 가능 시간, 이동 거리, 코스 범위, 후불 조건을 함께 확인해야 하는 방문형 상담 서비스입니다. 광주처럼 도심 상권과 주거지가 가까운 지역, 전주처럼 숙소와 원도심 문의가 섞이는 지역, 여수처럼 관광지와 숙박지 문의가 많은 지역, 완주처럼 읍면 이동 거리가 넓은 지역은 상담 기준이 서로 다릅니다. 그래서 마사지킹은 전라도 지역을 1차 지역, 2차 지역, 3차 세부 지역으로 나누어 이용자가 자신의 위치와 가까운 안내 페이지를 찾을 수 있도록 구성했습니다.</p><p>출장마사지와 홈타이를 처음 알아보는 고객은 코스명보다 실제 제공 범위와 총 비용을 먼저 확인하는 것이 좋습니다. 같은 90분, 120분 코스라도 이동 조건, 시간대, 관리사 배정 상황, 심야 여부에 따라 최종 안내가 달라질 수 있습니다. 예약 전에는 총 금액, 코스 시간, 후불 가능 여부, 추가 이동비, 방문 주소 전달 방식, 주차 또는 출입 조건을 전화 상담에서 확인해야 합니다. 특히 숙소나 오피스텔, 아파트 단지는 출입 방식에 따라 도착 안내가 달라질 수 있어 상세 위치를 미리 전달하는 편이 안전합니다.</p><p>마사지킹은 특정 업체를 과장해서 소개하기보다 예약 전에 확인해야 할 실무 정보를 정리하는 지역 안내 플랫폼을 지향합니다. 관리사 경력, 가능 코스, 배정 시간은 업체별 상황에 따라 달라질 수 있으므로 상담 단계에서 가능한 범위 안에서 확인하는 것이 좋습니다. 또한 불법적이거나 부적절한 요청은 안내하지 않으며, 건전한 방문 케어 기준 안에서만 상담이 진행됩니다. 이 페이지의 정보는 전라도 출장마사지와 홈타이를 알아보는 이용자가 요금, 지역, 코스, 주의사항을 비교하고 보다 신중하게 예약할 수 있도록 실제 확인 절차 중심으로 작성했습니다.</p></div><div class="home-eeat-points"><article><h3>지역 확인</h3><p>광주, 전주, 여수, 순천, 완주, 군산, 광양은 이동 거리와 생활권이 다르므로 세부 지역 페이지에서 방문 가능 여부를 먼저 확인하세요.</p></article><article><h3>요금 확인</h3><p>표기 요금은 참고 기준입니다. 최종 금액은 코스 시간, 이동 조건, 시간대, 배정 상황에 따라 상담 시점에 확인해야 합니다.</p></article><article><h3>안전 기준</h3><p>건전한 방문 케어 범위를 벗어난 요청은 안내하지 않습니다. 예약 전 코스 범위와 주의사항을 먼저 확인하는 것이 좋습니다.</p></article></div></section>`;
const css = `
body{background:radial-gradient(circle at 18% 14%,rgba(255,122,26,.12),transparent 28%),#050505}
.hero{min-height:calc(100vh - 74px);padding-top:34px;padding-bottom:34px;grid-template-columns:minmax(0,1fr) minmax(430px,520px);gap:44px;align-items:center}
.hero>div:first-child{align-self:center;max-width:660px}
.hero .eyebrow{font-size:16px;letter-spacing:.02em;margin-bottom:14px}
.hero h1{font-size:clamp(50px,5.8vw,82px);line-height:1.02;max-width:720px;text-wrap:balance}
.hero .lead{max-width:680px;font-size:18px;line-height:1.72;color:#dedede;margin-top:22px}
.hero-actions{gap:12px;margin-top:28px}
.panel{padding:24px;border-color:#383838;background:linear-gradient(180deg,rgba(24,24,24,.96),rgba(12,12,12,.96));box-shadow:0 22px 70px rgba(0,0,0,.42)}
.panel h2{font-size:31px;margin-bottom:18px;color:#ff7a1a}
.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.quick-card{grid-template-columns:46px minmax(0,1fr);gap:12px;align-items:start;min-height:162px;padding:15px;border-color:#34271f;background:linear-gradient(180deg,#171717,#0d0d0d)}
.quick-card:hover{border-color:#ff7a1a;transform:translateY(-2px);transition:.18s ease}
.quick-badge{width:42px;height:42px;border-radius:10px;font-size:16px}
.quick-card h3{font-size:18px;line-height:1.25;margin:0 0 8px;color:#ff7a1a}
.quick-card p{font-size:14px;line-height:1.55;color:#d9d9d9;margin:0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.quick-card span{font-size:12px;color:#aaa;margin-top:7px}
.quick-action{grid-column:1/-1;justify-self:start;padding:7px 11px;font-size:13px;color:#fff;border-color:#513019;background:#15100c}
.home-eeat{padding-top:18px}.home-eeat-box{border:1px solid #2b2b2b;border-radius:14px;background:linear-gradient(180deg,#121212,#0d0d0d);padding:28px}.home-eeat-box p{color:#dedede;font-size:18px;line-height:1.85;margin:0 0 18px}.home-eeat-box p:last-child{margin-bottom:0}.home-eeat-points{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:14px}.home-eeat-points article{border:1px solid #34271f;border-radius:14px;background:#101010;padding:20px}.home-eeat-points h3{color:#ff7a1a}.home-eeat-points p{color:#d6d6d6;line-height:1.7;margin:0}
@media(max-width:1100px){.hero{grid-template-columns:1fr;min-height:auto}.hero>div:first-child{max-width:none}.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.home-eeat-points{grid-template-columns:1fr}}
@media(max-width:760px){.hero{padding-top:28px;gap:24px}.hero h1{font-size:42px}.panel{padding:18px}.quick-grid{grid-template-columns:1fr}.quick-card{min-height:auto}.quick-action{justify-self:stretch;text-align:center}.hero .lead{font-size:16px}.home-eeat-box{padding:20px}.home-eeat-box p{font-size:16px}}
`;

let html = readFileSync(file, "utf8");
html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`);
html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${title}">`);
html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${description}">`);
html = html.replace(/"name":"[^"]+","description":"[^"]+"/, `"name":"${title}","description":"${description}"`);
if (!html.includes("home-eeat")) {
  html = html.replace("</main>", `${homeContent}</main>`);
}
html = html.replace("</style>", `${css}</style>`);
writeFileSync(file, html, "utf8");
