import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brand = "마사지킹";
const phone = "0508-202-4683";
const tel = "tel:05082024683";
const root = "out/area";

const cityProfiles = {
  "광주": {
    frame: "광역시 생활권이라 상무, 첨단, 수완, 원도심처럼 문의 흐름이 시간대별로 나뉩니다.",
    route: "상권과 주거지가 가까운 구간은 건물명, 출입 방식, 주차 가능 여부를 먼저 확인하면 상담이 빨라집니다.",
    checks: ["건물명", "주차 가능 여부", "출입 방식", "상무·첨단·수완권 중 실제 방문 지점"]
  },
  "전주": {
    frame: "한옥마을, 객리단길, 혁신도시, 주거지가 함께 움직이는 도시라 숙소와 거주지 문의가 섞입니다.",
    route: "완산권과 덕진권은 야간 이동 흐름이 달라 희망 시간과 세부 주소를 먼저 맞추는 편이 좋습니다.",
    checks: ["숙소명", "동 이름", "출입 방식", "완산권·덕진권 구분"]
  },
  "완주": {
    frame: "읍면 사이 거리가 넓어 실제 방문 가능 범위와 예상 도착 시간을 먼저 확인해야 하는 지역입니다.",
    route: "산단, 주거지, 외곽 마을 방향에 따라 배정 가능 시간이 다르게 잡힐 수 있습니다.",
    checks: ["읍면명", "상세 주소", "차량 진입 여부", "추가 이동 조건"]
  },
  "군산": {
    frame: "수송, 나운, 원도심, 산단 주변 문의가 나뉘며 숙소와 주거지 상담이 함께 들어오는 도시입니다.",
    route: "항만과 산업단지 주변은 야간 이동 조건, 주차, 도착 예상 시간이 달라질 수 있습니다.",
    checks: ["주차 가능 여부", "출입 방식", "숙소·주거지 구분", "심야 이동 가능 시간"]
  },
  "여수": {
    frame: "관광지, 숙소, 여천 생활권 문의가 섞여 주말과 야간에는 상담 확인 순서가 중요합니다.",
    route: "해안 도로와 관광지 주변 혼잡에 따라 도착 안내와 추가 이동 조건이 달라질 수 있습니다.",
    checks: ["숙박지명", "객실 출입 조건", "희망 시간대", "관광지 주변 도로 상황"]
  },
  "순천": {
    frame: "신도심, 원도심, 해룡면 생활권이 분리되어 방문 지점 확인이 중요한 지역입니다.",
    route: "조례동 생활권, 역 주변, 외곽 면 지역은 상담 기준과 이동 시간이 다르게 잡힐 수 있습니다.",
    checks: ["아파트·숙소 출입 방식", "연락 가능한 시간", "조례권·원도심권 구분", "방문 지점"]
  },
  "광양": {
    frame: "중마동, 광양읍, 금호권, 산단 주변 문의가 서로 다른 흐름으로 들어오는 도시입니다.",
    route: "산단 근무 이후 문의와 외곽 이동 문의는 배정 가능 시간과 이동 조건을 따로 확인해야 합니다.",
    checks: ["중마권·광양읍권 구분", "외곽 주소", "산단 주변 이동 가능 시간", "추가 이동 조건"]
  }
};

const useCases = [
  "퇴근 후 짧은 회복을 원하는 경우",
  "숙소에서 당일 가능 여부를 확인하는 경우",
  "처음 이용해 코스 차이를 비교하는 경우",
  "심야 시간대 상담 가능 여부를 묻는 경우",
  "주말 혼잡 시간에 예약 가능 시간을 확인하는 경우",
  "장거리 이동 후 피로 관리 목적의 문의"
];
const feeItems = ["총 금액과 코스 시간", "후불 조건과 추가 이동비", "방문 주소와 출입 가능 시간", "관리사 배정 가능 시간", "요청 코스와 실제 제공 범위", "변경 또는 취소 가능 기준", "주차 또는 차량 진입 가능 여부", "도착 예상 시간"];
const managerItems = ["강한 압보다 편안한 이완을 원하면 상담 단계에서 미리 전달하는 편이 좋습니다", "초보 이용자는 기본 코스 안내를 먼저 받은 뒤 시간을 조정하는 방식이 안정적입니다", "장시간 코스는 사전 상담으로 가능 여부를 먼저 확인해야 합니다", "오일 사용 여부와 관리 스타일은 상담 시 구체적으로 확인하는 것이 좋습니다", "관리사 배정은 실시간 상황에 따라 바뀔 수 있습니다"];
const cautionItems = ["불법 또는 부적절한 요청은 안내하지 않습니다", "과도한 음주 상태에서는 이용이 제한될 수 있습니다", "상담 내용과 다른 현장 요청은 중단될 수 있습니다", "미성년자 관련 요청은 접수하지 않습니다", "총 금액과 방문 조건을 확인한 뒤 예약을 진행해야 합니다"];
const logistics = ["주차가 어려운 건물은 도착 전 동선을 공유하는 편이 좋습니다", "오피스텔과 숙소는 출입 방식이 달라 사전 전달이 필요합니다", "외곽 주소는 예상 도착 시간이 달라질 수 있습니다", "심야 시간대는 배정 가능한 업체가 줄어들 수 있습니다", "주말에는 예약 가능 시간이 빨리 바뀔 수 있습니다", "상가 건물은 출입구 위치를 미리 알려주는 것이 좋습니다"];
const eeatNotes = ["실제 상담에서 자주 확인하는 항목을 기준으로 정리했습니다", "과장된 표현보다 예약 전 확인 절차를 우선해 작성했습니다", "이용자가 오해하기 쉬운 비용과 범위를 먼저 안내합니다", "지역명 반복보다 생활권별 조건 차이를 설명하는 데 초점을 맞췄습니다", "최종 조건은 전화 상담 시점의 배정 상황을 기준으로 확인해야 합니다"];

function hashText(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 13), 0);
}
function pick(list, seed, offset = 0) {
  const source = Array.isArray(list) && list.length ? list : ["상담 전 세부 조건 확인"];
  return source[Math.abs(seed + offset * 19) % source.length];
}
function profile(city) {
  return cityProfiles[city] || cityProfiles["광주"];
}
function dongSignal(dong, district, seed) {
  const signals = [];
  if (dong.endsWith("읍")) signals.push("읍 단위 생활권은 중심 상권과 외곽 주거지가 함께 묶이는 편입니다");
  if (dong.endsWith("면")) signals.push("면 지역은 이동 가능 범위와 도착 예상 시간을 먼저 맞춰야 합니다");
  if (dong.endsWith("동")) signals.push("동 단위 방문은 건물 위치와 출입 방식 확인이 상담 속도에 영향을 줍니다");
  if (dong.includes("중앙")) signals.push("중앙권은 상권과 관공서 주변 문의가 섞일 수 있습니다");
  if (dong.includes("신") || dong.includes("혁신")) signals.push("신도시와 신축 단지는 출입 방식과 주차 조건 확인이 중요합니다");
  if (dong.includes("해") || dong.includes("여") || dong.includes("돌")) signals.push("관광지와 숙소 문의가 함께 들어올 수 있어 방문 지점 확인이 필요합니다");
  signals.push(`${district} 안에서도 ${dong}은 시간대에 따라 배정 흐름이 달라질 수 있습니다`);
  signals.push(`${dong} 문의는 현재 위치와 코스 선택을 함께 확인해야 안내가 정확해집니다`);
  return pick(signals, seed, 1);
}
function ul(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
function card(title, body, items) {
  return `<article class="detail-card"><h2>${title}</h2><p>${body}</p>${ul(items)}</article>`;
}
function intro(city, district, dong, seed) {
  const p = profile(city);
  const place = `${city} ${district} ${dong}`;
  const one = dongSignal(dong, district, seed);
  const two = pick(useCases, seed, 2);
  const three = pick(eeatNotes, seed, 3);
  return `${place} 출장마사지는 단순히 지역명만 보고 결정하기보다 현재 위치, 희망 시간, 이동 거리, 코스 범위를 함께 확인해야 하는 방문형 상담입니다. ${p.frame} ${one}. ${dong} 주변에서는 ${two}가 들어오는 경우가 있어 ${pick(feeItems, seed, 4)} 확인이 먼저 필요합니다. ${brand}은 ${place} 이용자가 예약 전 요금표, 후불 조건, 관리사 배정 가능 여부, 주의사항을 한 페이지에서 비교할 수 있도록 정리합니다. ${p.route} ${three}. 표기된 정보는 상담 전 참고 기준이며 실제 가능 시간과 최종 금액은 이동 조건, 업체 배정, 선택 코스에 따라 달라질 수 있습니다. 예약 전에는 ${pick(feeItems, seed, 5)}, ${pick(feeItems, seed, 6)}, ${pick(p.checks, seed, 7)}을 함께 확인하는 것이 좋습니다.`;
}
function faq(city, district, dong, seed) {
  const p = profile(city);
  const qs = [
    [`${dong}에서 당일 상담은 어떻게 확인하나요?`, `현재 위치와 희망 시간을 알려주면 배정 가능 범위와 예상 도착 시간을 더 빠르게 안내받을 수 있습니다. ${dongSignal(dong, district, seed)}.`],
    [`${dong} 출장마사지 요금은 왜 달라질 수 있나요?`, `${pick(feeItems, seed, 1)}이 필요합니다. 이동 거리, 심야 여부, 코스 시간, 업체 배정 상황에 따라 최종 안내가 달라질 수 있습니다.`],
    [`홈타이와 출장마사지는 어떻게 비교해야 하나요?`, `명칭보다 실제 코스 범위와 관리 방식을 확인하는 것이 중요합니다. ${pick(managerItems, seed, 2)}.`],
    [`관리사 배정 정보는 언제 확인하나요?`, `예약 전 상담 단계에서 가능 시간과 코스 조건을 함께 확인합니다. ${pick(managerItems, seed, 3)}.`],
    [`${dong} 예약 전 주의할 점은 무엇인가요?`, `${pick(cautionItems, seed, 4)}. 또한 ${pick(p.checks, seed, 5)}을 미리 전달하면 상담 내용과 실제 방문 안내의 차이를 줄일 수 있습니다.`],
    [`코스를 정하지 못해도 문의할 수 있나요?`, `가능합니다. 다만 ${pick(feeItems, seed, 6)}을 먼저 확인해야 하므로 원하는 시간과 관리 목적을 알려주는 것이 좋습니다.`]
  ];
  const start = seed % 2;
  return qs.slice(start, start + 5).map(([q, a], index) => `<div class="faq-item"><h3>${index + 1}. ${q}</h3><p>${a}</p></div>`).join("");
}
function buildContent(city, district, dong) {
  const seed = hashText(`${city}-${district}-${dong}`);
  const place = `${city} ${district} ${dong}`;
  const p = profile(city);
  return `<section class="section local-intro"><p class="eyebrow">${place} 지역 안내</p><h2>${dong} 출장마사지 상세 안내</h2><div class="local-intro-box"><p>${intro(city, district, dong, seed)}</p></div></section><section class="section"><div class="detail-grid">${card("공지사항", `${dong} 예약 가능 여부는 시간대와 배정 상황에 따라 달라집니다. ${dongSignal(dong, district, seed)}.`, [`${dong} 현재 위치와 희망 시간 전달`, pick(feeItems, seed, 2), pick(logistics, seed, 3)])}${card("업체소개", `${brand}은 ${place} 출장마사지와 홈타이 상담 전 확인해야 할 정보를 지역 기준으로 정리하는 안내 플랫폼입니다. ${pick(eeatNotes, seed, 4)}.`, [`${place} 기준 지역 정보 분류`, "요금·코스·배정 조건 사전 확인", pick(p.checks, seed, 2)])}${card("기타사항", `${pick(logistics, seed, 1)}. ${p.route} 예약 확정 전 결제 방식과 변경 가능 기준을 함께 확인하세요.`, [pick(p.checks, seed, 1), pick(feeItems, seed, 4), pick(logistics, seed, 5)])}${card("관리사정보", `${pick(managerItems, seed, 1)}. ${dong} 배정은 가능 시간, 코스 종류, 이동 조건에 따라 달라질 수 있습니다.`, [pick(managerItems, seed, 3), `${dong} 배정 가능 시간 사전 확인`, "희망 관리 스타일은 상담 단계에서 전달"])}${card("주의사항", `${place} 이용 전에는 총 금액과 코스 범위를 먼저 확인해야 합니다. ${pick(cautionItems, seed, 2)}.`, [pick(cautionItems, seed, 4), pick(cautionItems, seed, 5), pick(feeItems, seed, 7)])}<article class="detail-card"><h2>전화예약</h2><p>${place} 상담은 전화로 현재 가능 지역, 예상 도착 시간, 코스별 요금, 후불 조건을 확인하는 방식이 가장 빠릅니다.</p><p><a class="primary-btn" href="${tel}">${phone}</a></p></article></div></section><section class="section"><h2>${dong} 자주 묻는 질문</h2>${faq(city, district, dong, seed)}</section>`;
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
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name === "index.html") enrich(full);
  }
}

if (existsSync(root) && statSync(root).isDirectory()) walk(root);
