import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brand = "마사지킹";
const phone = "0508-202-4683";
const tel = "tel:05082024683";
const root = "out/area";

const cityNotes = {
  "광주": ["상무지구와 수완지구처럼 상권 밀도가 높은 구역은 시간대별 상담 흐름이 빠릅니다", "주거지와 번화가가 가까워 현재 위치 설명이 정확할수록 배정 확인이 수월합니다", "야간에는 이동 동선과 주차 가능 여부를 먼저 확인하는 편이 좋습니다"],
  "전주": ["한옥마을, 객리단길, 혁신도시 생활권이 나뉘어 방문 위치 확인이 중요합니다", "완산과 덕진 생활권은 이동 시간이 달라 상담 단계에서 세부 주소를 먼저 확인합니다", "숙소 이용 문의와 주거지 문의가 섞여 코스 범위 확인이 필요합니다"],
  "완주": ["읍면 간 거리가 넓어 이동 가능 범위와 예상 도착 시간을 먼저 확인해야 합니다", "산단과 주거지 문의가 함께 발생해 주소 전달 방식이 중요합니다", "외곽 이동 조건에 따라 상담 안내가 달라질 수 있습니다"],
  "군산": ["수송동과 나운동, 원도심 생활권 문의가 나뉘는 편입니다", "항만과 산업단지 주변은 이동 동선 확인이 먼저 필요합니다", "숙소 방문 문의는 출입 방식과 주차 조건을 같이 확인해야 합니다"],
  "여수": ["관광지와 숙소, 여천권 생활권에 따라 예약 흐름이 달라집니다", "주말과 휴일에는 숙박지 문의가 몰려 가능 시간을 빨리 확인하는 편이 좋습니다", "해안권 이동은 도로 상황에 따라 도착 시간이 달라질 수 있습니다"],
  "순천": ["신도심과 원도심, 해룡면 권역 수요가 분리되는 편입니다", "정원박람회장 주변과 조례동 생활권은 상담 기준이 다르게 잡힐 수 있습니다", "주거지 방문은 주소와 연락 가능 시간을 먼저 맞추는 것이 좋습니다"],
  "광양": ["중마동, 광양읍, 금호권 이동 조건이 달라 위치 확인이 중요합니다", "산단 주변은 근무 시간 이후 문의가 집중되는 편입니다", "외곽 면 지역은 이동 가능 여부를 전화로 먼저 확인해야 합니다"]
};

const tones = [
  "처음 이용하는 고객이 혼동하기 쉬운 요금, 코스 시간, 이동 조건을 먼저 정리했습니다",
  "실제 상담에서 자주 확인하는 항목을 기준으로 안내 문장을 구성했습니다",
  "과장된 표현보다 예약 전에 확인해야 할 실무 정보를 우선했습니다",
  "지역명만 반복하지 않고 해당 생활권에서 달라질 수 있는 조건을 함께 안내합니다",
  "방문 가능 여부는 시간대와 배정 상황에 따라 달라질 수 있어 사전 확인이 필요합니다"
];
const audiences = ["퇴근 후 피로 관리 문의", "숙소 이용 고객의 당일 상담", "주거지 방문 전 확인", "장시간 이동 후 회복 목적 상담", "초보 이용자의 코스 비교"];
const checks = ["총 금액과 코스 시간을 먼저 확인", "후불 조건과 추가 이동비 여부 확인", "주소 전달 방식과 출입 가능 시간 확인", "관리사 배정 가능 시간 확인", "요청 코스와 실제 제공 범위 비교"];
const managerNotes = ["관리사 경력과 가능한 코스는 업체 배정 상황에 따라 달라집니다", "강한 압보다 편안한 이완을 원하는 경우 상담 단계에서 미리 전달하는 편이 좋습니다", "초보 이용자는 기본 코스부터 안내받은 뒤 시간을 조정하는 방식이 안정적입니다", "장시간 코스는 배정 가능 여부를 먼저 확인해야 합니다", "오일 사용 여부와 관리 스타일은 상담 시 구체적으로 확인하는 것이 좋습니다"];
const cautions = ["불법 또는 부적절한 요청은 안내하지 않습니다", "과도한 음주 상태에서는 이용이 제한될 수 있습니다", "예약 전 안내받은 범위와 다른 요구는 상담이 중단될 수 있습니다", "미성년자 관련 요청은 접수하지 않습니다", "총 금액과 방문 조건을 확인한 뒤 예약을 진행해야 합니다"];
const extras = ["주차가 어려운 건물은 도착 전 동선을 공유하면 안내가 더 빠릅니다", "오피스텔과 숙소는 출입 방식이 달라 사전 전달이 필요합니다", "외곽 주소는 예상 도착 시간이 달라질 수 있습니다", "심야 시간대는 배정 가능한 업체가 줄어들 수 있습니다", "주말에는 상담량이 늘어 예약 가능 시간이 빨리 바뀔 수 있습니다"];

function hashText(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
}
function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}
function card(title, body, items) {
  return `<article class="detail-card"><h2>${title}</h2><p>${body}</p><ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul></article>`;
}
function buildIntro(city, district, dong, seed) {
  const noteA = pick(cityNotes[city] || cityNotes["광주"], seed);
  const noteB = pick(cityNotes[city] || cityNotes["광주"], seed, 1);
  const tone = pick(tones, seed, 2);
  const audience = pick(audiences, seed, 3);
  const checkA = pick(checks, seed, 4);
  const checkB = pick(checks, seed, 5);
  return `${city} ${district} ${dong} 출장마사지는 단순히 지역명만 보고 선택하기보다 현재 위치, 방문 가능 시간, 이동 거리, 코스 범위를 함께 확인해야 합니다. ${noteA}. 특히 ${dong} 주변은 ${audience}가 들어오는 경우가 있어 상담 단계에서 ${checkA}하는 것이 좋습니다. ${brand}은 ${city} ${district} ${dong} 이용자가 예약 전에 확인해야 할 요금표, 후불 조건, 관리사 배정 가능 여부, 주의사항을 한 페이지에서 살펴볼 수 있도록 정리합니다. ${noteB}. ${tone}. 표기된 정보는 상담 전 참고용이며 실제 가능 시간과 최종 비용은 업체 배정 상황, 이동 조건, 선택 코스에 따라 달라질 수 있습니다. 예약 전에는 ${checkB}하고, 부적절한 요청은 안내 대상에서 제외된다는 점을 확인해 주세요. 이 페이지는 ${dong} 생활권에서 출장마사지와 홈타이 상담을 알아보는 이용자가 과장 광고보다 실제 확인 절차를 먼저 이해할 수 있도록 운영 기준과 확인 항목을 중심으로 작성했습니다.`;
}
function buildContent(city, district, dong) {
  const seed = hashText(`${city}-${district}-${dong}`);
  const place = `${city} ${district} ${dong}`;
  const intro = buildIntro(city, district, dong, seed);
  const cards = [
    card("공지사항", `${dong} 예약 가능 여부는 시간대와 업체 배정 상황에 따라 달라집니다. ${pick(extras, seed)}. 상담 전 현재 위치와 희망 시간을 알려주면 안내가 더 정확합니다.`, [pick(checks, seed), pick(checks, seed, 1), pick(extras, seed, 2)]),
    card("업체소개", `${brand}은 ${place} 출장마사지와 홈타이 상담 전 확인해야 할 정보를 지역 기준으로 정리하는 안내 플랫폼입니다. 특정 업체를 과장해 노출하기보다 이용자가 비교해야 할 조건을 먼저 보여줍니다.`, [`${city} ${district} ${dong} 기준 지역 분류`, "요금, 시간, 코스 범위 사전 확인", "건전한 방문 케어 기준 안내"]),
    card("기타사항", `${dong} 주변은 건물 형태와 이동 동선에 따라 방문 안내가 달라질 수 있습니다. ${pick(extras, seed, 3)}. 예약 확정 전 결제 방식과 변경 가능 기준도 함께 확인하세요.`, ["주소 전달 방식 확인", "변경 또는 취소 가능 기준 확인", "상담 내용과 실제 제공 범위 비교"]),
    card("관리사정보", `${pick(managerNotes, seed)}. ${dong} 배정은 가능한 시간, 코스, 이동 조건에 따라 달라지므로 원하는 관리 스타일이 있다면 예약 전에 구체적으로 전달하는 것이 좋습니다.`, [pick(managerNotes, seed, 1), pick(managerNotes, seed, 2), "장시간 코스는 사전 상담 권장"]),
    card("주의사항", `${place} 이용 전에는 코스 범위와 총 금액을 먼저 확인해야 합니다. ${pick(cautions, seed)}. 건전한 운영 기준을 벗어난 문의는 상담 범위에서 제외됩니다.`, [pick(cautions, seed, 1), pick(cautions, seed, 2), pick(checks, seed, 3)]),
    `<article class="detail-card"><h2>전화예약</h2><p>${place} 상담은 전화로 가장 빠르게 확인할 수 있습니다. 현재 가능 지역, 예상 도착 시간, 코스별 요금, 후불 조건을 상담 시점 기준으로 확인하세요.</p><p><a class="primary-btn" href="${tel}">${phone}</a></p></article>`
  ].join("");

  const faqs = [
    [`${dong}에서 당일 출장마사지 상담이 가능한가요?`, `${pick(cityNotes[city] || cityNotes["광주"], seed)}. 다만 실제 가능 여부는 시간대와 배정 상황에 따라 달라져 전화로 확인하는 것이 가장 빠릅니다.`],
    [`${dong} 홈타이 요금은 고정인가요?`, `기본 요금표는 참고 기준입니다. ${pick(checks, seed, 1)}한 뒤 이동 거리, 코스 시간, 심야 여부에 따라 최종 안내가 달라질 수 있습니다.`],
    [`관리사 정보는 어디까지 확인할 수 있나요?`, `${pick(managerNotes, seed, 3)}. 성별, 경력, 가능 코스처럼 상담 가능한 범위 안에서 확인하고 예약하는 것이 좋습니다.`],
    [`예약 전에 무엇을 먼저 말해야 하나요?`, `현재 위치, 희망 시간, 원하는 코스, 주차 또는 출입 조건을 먼저 알려주세요. ${pick(extras, seed, 4)}.`],
    [`주의해야 할 요청이 있나요?`, `${pick(cautions, seed, 4)}. 합법적이고 건전한 방문 케어 기준 안에서만 상담이 진행됩니다.`]
  ];

  return `<section class="section local-intro"><p class="eyebrow">${place} 지역 안내</p><h2>${dong} 출장마사지 상세 안내</h2><div class="local-intro-box"><p>${intro}</p></div></section><section class="section"><div class="detail-grid">${cards}</div></section><section class="section"><h2>${dong} 자주 묻는 질문</h2>${faqs.map(([q, a], index) => `<div class="faq-item"><h3>${index + 1}. ${q}</h3><p>${a}</p></div>`).join("")}</section>`;
}
function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name === "index.html") enrich(full);
  }
}
function enrich(file) {
  const parts = file.replaceAll("\\", "/").split("/");
  const areaIndex = parts.indexOf("area");
  const relative = parts.slice(areaIndex + 1, -1);
  if (relative.length !== 3) return;
  const [city, district, dong] = relative;
  let html = readFileSync(file, "utf8");
  const start = html.indexOf('<section class="section local-intro">');
  const end = html.indexOf("</main>", start);
  if (start === -1 || end === -1) return;
  html = `${html.slice(0, start)}${buildContent(city, district, dong)}${html.slice(end)}`;
  writeFileSync(file, html, "utf8");
}

if (existsSync(root) && statSync(root).isDirectory()) {
  walk(root);
}
