import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "out/area";

const cityContext = {
  "광주": ["광역시 도심권", "상무·첨단·수완권 이동", "상권과 주거지가 가까운 상담 흐름"],
  "전주": ["완산·덕진 생활권", "한옥마을·객리단길·혁신도시 이동", "숙소와 주거지 문의가 섞이는 지역"],
  "완주": ["읍면 간 거리가 넓은 지역", "산단과 주거지가 떨어진 생활권", "이동 가능 범위 확인이 먼저인 지역"],
  "군산": ["수송·나운·원도심 생활권", "산단과 항만 주변 이동", "숙소와 주거지 조건이 다른 지역"],
  "여수": ["관광지와 여천권 생활권", "숙박지 문의가 많은 해안 도시", "주말 이동 흐름이 빠르게 바뀌는 지역"],
  "순천": ["신도심·원도심·해룡권 생활권", "조례동과 역 주변 문의", "주거지 방문 조건 확인이 중요한 지역"],
  "광양": ["중마동·광양읍·금호권 이동", "산단 근무 이후 문의", "외곽 이동 조건 확인이 필요한 지역"]
};
const checklist = ["현재 위치", "희망 시간", "코스 시간", "총 금액", "후불 조건", "주차 가능 여부", "출입 방식", "예상 도착 시간", "관리사 배정 가능 여부", "심야 가능 여부"];
const useCases = ["퇴근 후 짧은 회복 목적", "숙소에서 당일 가능 여부 확인", "초보 이용자의 코스 비교", "심야 시간대 상담", "주말 예약 가능 시간 확인", "장시간 이동 후 피로 관리", "주거지 방문 전 조건 확인", "외곽 이동 가능 여부 확인"];
const trust = ["과장 문구보다 예약 전 확인 절차를 우선했습니다", "실제 상담에서 자주 묻는 항목을 기준으로 정리했습니다", "요금과 코스 범위를 먼저 비교하도록 구성했습니다", "생활권별 이동 조건 차이를 설명하는 데 초점을 맞췄습니다", "최종 조건은 전화 상담 시점의 배정 상황을 기준으로 확인해야 합니다", "건전한 방문 케어 기준 안에서만 안내가 진행됩니다"];
const signals = ["건물 출입 방식에 따라 도착 안내가 달라질 수 있습니다", "주차가 어려운 곳은 도착 전 동선 공유가 필요합니다", "외곽 주소는 예상 시간이 달라질 수 있습니다", "숙소와 주거지는 확인해야 할 조건이 다릅니다", "주말에는 가능 시간이 빠르게 바뀔 수 있습니다", "심야에는 배정 가능한 업체가 줄어들 수 있습니다"];

function hashText(text) {
  return [...text].reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 5), 0);
}
function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset * 19) % list.length];
}
function items(list) {
  return `<ul>${list.map((x) => `<li>${x}</li>`).join("")}</ul>`;
}
function memo(city, seed, offset = 0) {
  return pick(cityContext[city] || cityContext["광주"], seed, offset);
}
function dongType(dong) {
  if (dong.endsWith("읍")) return "읍 중심 상권과 외곽 주거지가 함께 묶이는 생활권";
  if (dong.endsWith("면")) return "면 단위 이동 거리와 도착 가능 시간 확인이 중요한 생활권";
  if (dong.includes("중앙")) return "중앙 상권과 관공서 주변 문의가 섞이는 생활권";
  if (dong.includes("신") || dong.includes("혁신")) return "신축 단지와 새 상권 주변 출입 조건 확인이 필요한 생활권";
  if (dong.includes("해") || dong.includes("돌") || dong.includes("여")) return "숙소와 관광 동선이 함께 고려되는 생활권";
  if (dong.includes("산") || dong.includes("봉") || dong.includes("월")) return "지형과 단지 배치에 따라 차량 동선이 달라질 수 있는 생활권";
  return "동 단위 방문 위치와 건물 출입 방식 확인이 중요한 생활권";
}
function titleFor(dong, seed) {
  return pick([
    `${dong} 출장마사지 예약 전 확인사항`,
    `${dong} 홈타이 상담 기준`,
    `${dong} 방문 가능 지역 안내`,
    `${dong} 출장마사지 이용 가이드`,
    `${dong} 지역 상담 메모`,
    `${dong} 예약 체크포인트`
  ], seed, 1);
}
function variantA(city, district, dong, seed) {
  return `<section class="section local-intro"><p class="eyebrow">${city} ${district} ${dong} 지역 브리핑</p><h2>${titleFor(dong, seed)}</h2><div class="local-intro-box"><p><strong>${dong}</strong>은 ${dongType(dong)}입니다. ${memo(city, seed)} 특성이 있어 같은 ${district} 안에서도 방문 시간과 이동 조건이 달라질 수 있습니다.</p><p>${pick(useCases, seed, 2)} 문의라면 ${pick(checklist, seed, 3)}, ${pick(checklist, seed, 4)}, ${pick(checklist, seed, 5)}을 먼저 확인하는 편이 좋습니다. ${pick(trust, seed, 6)}.</p>${items([pick(checklist, seed, 7), pick(checklist, seed, 8), pick(signals, seed, 9)])}</div></section>`;
}
function variantB(city, district, dong, seed) {
  return `<section class="section local-intro"><p class="eyebrow">예약 전 체크</p><h2>${city} ${district} ${dong} 출장마사지 확인 순서</h2><div class="detail-grid"><article class="detail-card"><h2>지역 조건</h2><p>${memo(city, seed, 1)} 기준으로 ${dong}은 ${dongType(dong)}입니다. ${pick(signals, seed, 2)}.</p></article><article class="detail-card"><h2>상담 순서</h2><p>처음 문의할 때는 ${pick(checklist, seed, 3)}와 ${pick(checklist, seed, 4)}을 먼저 말하면 배정 가능 여부를 빠르게 확인할 수 있습니다.</p></article></div><div class="local-intro-box"><p>${brandText()} ${city} ${district} ${dong} 페이지는 요금, 코스, 관리사 배정, 주의사항을 예약 전 확인 기준으로 정리했습니다. ${pick(trust, seed, 5)}.</p></div></section>`;
}
function variantC(city, district, dong, seed) {
  return `<section class="section local-intro"><p class="eyebrow">생활권 메모</p><h2>${dong} 홈타이·출장마사지 안내</h2><div class="local-intro-box"><p>${city} ${district} ${dong} 상담은 <strong>${memo(city, seed, 2)}</strong>을 함께 고려해야 합니다. ${dongType(dong)}이라 ${pick(signals, seed, 3)}.</p>${items([`${pick(useCases, seed, 4)}: ${pick(checklist, seed, 5)} 확인`, `요금 확인: ${pick(checklist, seed, 6)}과 ${pick(checklist, seed, 7)} 비교`, `예약 기준: ${pick(trust, seed, 8)}`])}<p>최종 가능 여부는 전화 상담 시점의 배정 상황과 이동 조건에 따라 달라질 수 있습니다.</p></div></section>`;
}
function variantD(city, district, dong, seed) {
  return `<section class="section local-intro"><p class="eyebrow">처음 이용자를 위한 안내</p><h2>${titleFor(dong, seed)}</h2><div class="local-intro-box"><p>${dong}에서 출장마사지나 홈타이를 알아볼 때는 코스명보다 실제 제공 범위와 총 비용을 먼저 확인해야 합니다. ${memo(city, seed)} 흐름과 ${district} 지역 특성 때문에 상담 순서가 달라질 수 있습니다.</p><p>${pick(useCases, seed, 1)}라면 예약 전에 ${pick(checklist, seed, 2)}, ${pick(checklist, seed, 3)}, ${pick(checklist, seed, 4)}을 함께 확인하세요. ${pick(trust, seed, 5)}.</p></div><div class="detail-grid"><article class="detail-card"><h2>먼저 말할 것</h2>${items([pick(checklist, seed, 6), pick(checklist, seed, 7), pick(checklist, seed, 8)])}</article><article class="detail-card"><h2>주의할 것</h2><p>${pick(signals, seed, 9)}. 안내받은 범위와 다른 요청은 제한될 수 있습니다.</p></article></div></section>`;
}
function variantE(city, district, dong, seed) {
  return `<section class="section local-intro"><p class="eyebrow">지역별 상담 기준</p><h2>${city} ${district} ${dong} 방문 상담 요약</h2><div class="local-intro-box"><p>${dong}은 ${dongType(dong)}으로 분류해 안내합니다. ${memo(city, seed, 1)} 특성이 있어 실제 도착 시간은 주소와 이동 조건에 따라 달라질 수 있습니다.</p></div><div class="detail-grid"><article class="detail-card"><h2>예약 판단</h2><p>${pick(useCases, seed, 2)} 문의는 ${pick(checklist, seed, 3)} 확인이 먼저입니다.</p></article><article class="detail-card"><h2>신뢰 기준</h2><p>${pick(trust, seed, 4)}. 가능 시간과 비용은 상담 시점 기준으로 확인합니다.</p></article></div></section>`;
}
function brandText() {
  return "마사지킹은";
}
function buildIntro(city, district, dong) {
  const seed = hashText(`${city}-${district}-${dong}`);
  const variants = [variantA, variantB, variantC, variantD, variantE];
  return variants[seed % variants.length](city, district, dong, seed);
}
function addCss(html) {
  const css = `.local-intro-box strong{color:#ff9b3d}.local-intro .detail-grid{margin-top:14px}.local-intro .detail-card h2{font-size:20px}`;
  if (html.includes(".local-intro-box strong")) return html;
  return html.replace("</style>", `${css}</style>`);
}
function enrich(file) {
  const parts = file.replaceAll("\\", "/").split("/");
  const areaIndex = parts.indexOf("area");
  const relative = parts.slice(areaIndex + 1, -1);
  if (relative.length !== 3) return;
  const [city, district, dong] = relative;
  let html = readFileSync(file, "utf8");
  const start = html.indexOf('<section class="section local-intro">');
  if (start === -1) return;
  const end = html.indexOf('<section class="section"><div class="detail-grid">', start);
  if (end === -1) return;
  html = `${html.slice(0, start)}${buildIntro(city, district, dong)}${html.slice(end)}`;
  writeFileSync(file, addCss(html), "utf8");
}
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name === "index.html") enrich(full);
  }
}

if (existsSync(root) && statSync(root).isDirectory()) {
  walk(root);
}
