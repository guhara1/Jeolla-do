import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brand = "마사지킹";
const phone = "0508-202-4683";
const tel = "tel:05082024683";
const root = "out/area";

const cityMemo = {
  "광주": {
    area: "광역시 생활권이라 상권, 주거지, 업무지구 문의가 시간대별로 나뉩니다",
    movement: "상무·첨단·수완·원도심 방향에 따라 도착 예상 시간이 달라질 수 있습니다",
    proof: "건물명, 주차 가능 여부, 출입 방식 확인이 상담 속도를 좌우합니다"
  },
  "전주": {
    area: "완산과 덕진 생활권이 분리되고 숙소·주거지 문의가 함께 들어오는 도시입니다",
    movement: "한옥마을, 객리단길, 혁신도시 방향은 주말과 야간 이동 흐름이 달라집니다",
    proof: "숙소명, 동 이름, 출입 방식, 희망 시간을 먼저 맞추는 것이 좋습니다"
  },
  "완주": {
    area: "읍면 사이 거리가 넓어 위치 확인과 이동 가능 여부가 특히 중요한 지역입니다",
    movement: "산단, 주거지, 외곽 마을 방향에 따라 상담 가능 시간이 다르게 잡힙니다",
    proof: "읍면명, 상세 주소, 차량 진입 여부를 먼저 전달하면 안내가 정확해집니다"
  },
  "군산": {
    area: "수송·나운 생활권과 원도심, 산단 주변 문의가 나뉘는 도시입니다",
    movement: "항만과 산업단지 주변은 야간 이동 조건과 도착 시간이 달라질 수 있습니다",
    proof: "주차, 출입 방식, 숙소 또는 주거지 여부를 상담 초반에 확인해야 합니다"
  },
  "여수": {
    area: "관광지, 숙소, 여천 생활권 문의가 섞여 주말 상담 흐름이 빠르게 바뀝니다",
    movement: "해안 도로와 관광지 주변 혼잡에 따라 도착 안내가 달라질 수 있습니다",
    proof: "숙박지명, 객실 출입 조건, 희망 시간대를 먼저 알려주는 편이 좋습니다"
  },
  "순천": {
    area: "신도심, 원도심, 해룡면 권역이 분리되어 방문 지점 확인이 중요합니다",
    movement: "조례동 생활권과 역 주변, 외곽 면 지역은 상담 기준이 다르게 잡힙니다",
    proof: "아파트·숙소 출입 방식과 연락 가능한 시간을 먼저 정리하면 좋습니다"
  },
  "광양": {
    area: "중마동, 광양읍, 금호권, 산단 주변 문의가 서로 다른 흐름을 보입니다",
    movement: "산단 근무 이후 문의와 외곽 이동 문의는 배정 가능 시간이 다릅니다",
    proof: "권역 구분, 외곽 주소, 이동 추가 조건을 상담 단계에서 확인해야 합니다"
  }
};

const districtMemo = {
  "동구": "원도심·상권·주거지가 가까운 구역이라 정확한 건물 위치가 중요합니다",
  "서구": "상권과 주거 단지가 섞여 있어 시간대별 이동 흐름이 달라집니다",
  "남구": "주거지 비중이 높은 편이라 출입 방식과 연락 가능 시간 확인이 필요합니다",
  "북구": "대학가, 주거지, 원도심 문의가 섞여 코스와 시간을 먼저 맞추는 편이 좋습니다",
  "광산구": "수완·첨단·하남권 등 생활권이 넓어 실제 방문 지점 구분이 중요합니다",
  "완산구": "숙소, 원도심, 주거지 문의가 함께 들어와 출입 방식 확인이 필요합니다",
  "덕진구": "대학가와 주거지, 혁신 생활권이 나뉘어 이동 시간을 먼저 확인해야 합니다",
  "완주군": "읍면 이동 거리가 넓어 예약 전 가능 범위 확인이 우선입니다",
  "군산시": "산단·원도심·숙소 문의가 나뉘어 방문 조건을 먼저 맞춰야 합니다",
  "여수시": "관광지와 주거지, 여천권 생활 흐름이 함께 움직이는 지역입니다",
  "순천시": "신도심과 원도심, 외곽 면 지역 문의가 분리되는 편입니다",
  "광양시": "중마권, 광양읍권, 산단권 이동 조건이 서로 다릅니다"
};

const sectionStyles = ["현장 메모형", "예약 체크형", "초보 안내형", "운영 기준형", "생활권 설명형", "비교 안내형", "주의 우선형"];
const userCases = ["퇴근 후 짧은 회복을 원하는 경우", "숙소에서 당일 가능 여부를 확인하는 경우", "처음 이용해 코스 차이를 비교하는 경우", "심야 시간대 상담 가능 여부를 묻는 경우", "주말 혼잡 시간에 예약 가능 시간을 확인하는 경우", "장시간 이동 후 피로 관리 목적의 문의", "주거지 방문 전 출입 조건을 확인하는 경우"];
const feeItems = ["총 금액과 코스 시간", "후불 조건과 추가 이동비", "방문 주소와 출입 가능 시간", "관리사 배정 가능 시간", "요청 코스와 실제 제공 범위", "변경 또는 취소 가능 기준", "주차 또는 차량 진입 가능 여부", "심야 상담 가능 시간", "숙소·주거지 구분", "도착 예상 시간"];
const managerItems = ["관리사 경력은 업체 배정 상황에 따라 달라질 수 있습니다", "강한 압보다 편안한 이완을 원하면 미리 전달하는 편이 좋습니다", "초보 이용자는 기본 코스 안내를 먼저 받는 방식이 안정적입니다", "장시간 코스는 가능 여부를 먼저 확인해야 합니다", "오일 사용 여부와 관리 스타일은 상담 시 구체적으로 확인하는 것이 좋습니다", "희망 스타일이 있다면 예약 확정 전에 가능한 범위를 비교해야 합니다", "관리사 배정은 실시간 상황에 따라 바뀔 수 있습니다", "코스명보다 실제 관리 범위를 확인하는 것이 중요합니다"];
const cautionItems = ["불법 또는 부적절한 요청은 안내하지 않습니다", "과도한 음주 상태에서는 이용이 제한될 수 있습니다", "예약 전 안내받은 범위와 다른 요구는 상담이 중단될 수 있습니다", "미성년자 관련 요청은 접수하지 않습니다", "총 금액과 방문 조건을 확인한 뒤 예약을 진행해야 합니다", "상담 내용과 다른 현장 요청은 제한될 수 있습니다", "건전한 방문 케어 범위 안에서만 안내가 진행됩니다", "의심스러운 요청은 확인 과정에서 거절될 수 있습니다"];
const logistics = ["주차가 어려운 건물은 도착 전 동선을 공유하는 편이 좋습니다", "오피스텔과 숙소는 출입 방식이 달라 사전 전달이 필요합니다", "외곽 주소는 예상 도착 시간이 달라질 수 있습니다", "심야 시간대는 배정 가능한 업체가 줄어들 수 있습니다", "주말에는 예약 가능 시간이 빨리 바뀔 수 있습니다", "아파트 단지는 동·호수 전달 방식에 따라 도착 안내가 달라질 수 있습니다", "상가 건물은 출입구 위치를 미리 알려주는 것이 좋습니다", "도로 상황에 따라 안내 시간이 조정될 수 있습니다"];
const eeatNotes = ["과장된 표현보다 예약 전 확인 절차를 우선해 작성했습니다", "실제 상담에서 자주 확인하는 항목을 기준으로 정리했습니다", "이용자가 오해하기 쉬운 비용과 범위를 먼저 안내합니다", "지역명 반복보다 생활권별 조건 차이를 설명하는 데 초점을 맞췄습니다", "최종 조건은 전화 상담 시점의 배정 상황을 기준으로 확인해야 합니다", "건전한 방문 케어 기준 안에서만 안내가 진행됩니다", "요금·코스·주의사항을 한 화면에서 비교하도록 구성했습니다"];

function hashText(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 11), 0);
}
function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset * 17) % list.length];
}
function profile(city) {
  return cityMemo[city] || cityMemo["광주"];
}
function districtText(district) {
  return districtMemo[district] || "세부 생활권에 따라 이동 시간과 방문 조건이 달라질 수 있습니다";
}
function dongSignals(dong, district, seed) {
  const signals = [];
  if (dong.endsWith("읍")) signals.push("읍 단위 생활권이라 중심 상권과 외곽 주거지가 함께 묶이는 편입니다");
  if (dong.endsWith("면")) signals.push("면 지역 특성상 이동 가능 범위와 도착 예상 시간을 먼저 맞춰야 합니다");
  if (dong.endsWith("동")) signals.push("동 단위 방문은 건물 위치와 출입 방식 확인이 상담 속도에 영향을 줍니다");
  if (dong.includes("중앙")) signals.push("중앙권은 상권과 관공서 주변 문의가 섞일 수 있습니다");
  if (dong.includes("신") || dong.includes("혁신")) signals.push("신도시·신축 단지 주변은 출입 방식과 주차 조건 확인이 중요합니다");
  if (dong.includes("월") || dong.includes("산") || dong.includes("봉")) signals.push("지형이나 단지 배치에 따라 차량 동선 안내가 달라질 수 있습니다");
  if (dong.includes("해") || dong.includes("돌") || dong.includes("여") || dong.includes("금")) signals.push("관광·숙소·상권 문의가 함께 들어올 수 있어 방문 지점 확인이 필요합니다");
  if (dong.includes("수") || dong.includes("조") || dong.includes("나운")) signals.push("생활 편의시설 주변 문의가 많아 희망 시간대 확인이 먼저 필요합니다");
  signals.push(`${district} 안에서도 ${dong}은 상담 시간대에 따라 배정 흐름이 달라질 수 있습니다`);
  signals.push(`${dong} 문의는 현재 위치와 코스 선택을 함께 확인해야 안내가 정확해집니다`);
  return [pick(signals, seed, 1), pick(signals, seed, 2), pick(signals, seed, 3)];
}
function ul(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
function card(title, body, items) {
  return `<article class="detail-card"><h2>${title}</h2><p>${body}</p>${ul(items)}</article>`;
}
function intro(city, district, dong, seed) {
  const p = profile(city);
  const [sigA, sigB, sigC] = dongSignals(dong, district, seed);
  const place = `${city} ${district} ${dong}`;
  const style = pick(sectionStyles, seed, 4);
  return [
    `${place} 출장마사지는 단순히 지역명만 보고 판단하기보다 현재 위치, 방문 가능한 시간, 이동 거리, 코스 범위를 함께 확인해야 하는 방문형 상담입니다.`,
    `${p.area}. ${districtText(district)}. ${sigA}.`,
    `${dong} 주변에서는 ${pick(userCases, seed, 2)}가 들어오는 경우가 있어 ${pick(feeItems, seed, 3)} 확인이 먼저 필요합니다.`,
    `${brand}은 ${place} 이용자가 예약 전에 요금표, 후불 조건, 관리사 배정 가능 여부, 주의사항을 한 페이지에서 비교할 수 있도록 정리합니다.`,
    `${sigB}. ${pick(eeatNotes, seed, 5)}.`,
    `표기된 정보는 상담 전 참고 기준이며 실제 가능 시간과 최종 금액은 업체 배정, 이동 조건, 선택 코스, 심야 여부에 따라 달라질 수 있습니다.`,
    `예약 전에는 ${pick(feeItems, seed, 6)}, ${pick(feeItems, seed, 7)}, ${pick(profile(city).check, seed, 8)}을 함께 확인하는 것이 좋습니다.`,
    `이 페이지는 ${style} 기준으로 작성했으며, ${dong} 생활권에서 출장마사지와 홈타이 상담을 알아보는 이용자가 과장 광고보다 실제 확인 절차를 먼저 이해하도록 구성했습니다. ${sigC}.`
  ].join(" ");
}
function notice(city, district, dong, seed) {
  const p = profile(city);
  const [sigA] = dongSignals(dong, district, seed);
  const variants = [
    `${dong} 예약 가능 여부는 시간대와 배정 상황에 따라 달라집니다. ${sigA}. 상담 전 ${pick(feeItems, seed, 1)}과 ${pick(feeItems, seed, 2)}을 알려주면 확인이 빠릅니다.`,
    `${district} 안에서도 ${dong}은 방문 지점에 따라 도착 안내가 달라질 수 있습니다. ${pick(logistics, seed, 3)}. ${p.proof}.`,
    `${dong} 상담은 실시간 배정 기준으로 안내됩니다. ${pick(userCases, seed, 4)}라면 ${pick(feeItems, seed, 5)}을 먼저 확인하세요.`
  ];
  return card("공지사항", pick(variants, seed, 1), [`${dong} 현재 위치와 희망 시간 전달`, pick(feeItems, seed, 2), pick(logistics, seed, 3)]);
}
function company(city, district, dong, seed) {
  const place = `${city} ${district} ${dong}`;
  const [sigA, sigB] = dongSignals(dong, district, seed);
  const variants = [
    `${brand}은 ${place} 출장마사지와 홈타이 상담 전 확인해야 할 정보를 세부 생활권 기준으로 정리합니다. ${sigA}. 특정 업체를 과장하기보다 이용자가 비교해야 할 조건을 먼저 보여줍니다.`,
    `${place} 페이지는 업체 배정 가능 여부를 묻기 전 확인할 수 있는 기본 기준을 담고 있습니다. ${pick(eeatNotes, seed, 4)}. ${sigB}.`,
    `${brand}은 ${city} 안에서도 ${district}, ${dong}처럼 상담 조건이 달라지는 지역을 분리해 안내합니다. 요금, 코스, 이동 조건, 주의사항을 상담 전 체크리스트로 정리했습니다.`
  ];
  return card("업체소개", pick(variants, seed, 2), [`${place} 기준 지역 정보 분류`, pick(eeatNotes, seed, 3), "요금·코스·배정 조건 사전 확인"]);
}
function extra(city, district, dong, seed) {
  const p = profile(city);
  const [sigA, sigB] = dongSignals(dong, district, seed);
  const variants = [
    `${dong} 이용 전에는 건물 출입 방식, 연락 가능한 시간, 주차 가능 여부를 미리 정리해 두는 편이 좋습니다. ${pick(logistics, seed, 4)}.`,
    `${p.movement}. 그래서 ${dong} 상담에서는 ${pick(feeItems, seed, 5)}과 ${pick(feeItems, seed, 6)}을 함께 맞추는 과정이 필요합니다.`,
    `${sigA}. 예약 확정 전에는 결제 방식, 변경 가능 기준, 실제 제공 범위를 상담 내용과 비교하세요. ${sigB}.`
  ];
  return card("기타사항", pick(variants, seed, 3), [pick(p.check, seed, 1), pick(feeItems, seed, 4), pick(logistics, seed, 5)]);
}
function manager(city, district, dong, seed) {
  const place = `${city} ${district} ${dong}`;
  const variants = [
    `${pick(managerItems, seed, 1)}. ${dong} 배정은 가능 시간, 코스 종류, 이동 조건에 따라 달라지므로 원하는 관리 스타일은 예약 전 구체적으로 전달하는 것이 좋습니다.`,
    `${place} 관리사 배정은 상담 시점의 업체 상황을 기준으로 확인합니다. ${pick(managerItems, seed, 2)}. 코스명보다 실제 관리 범위를 확인하세요.`,
    `${dong}에서 관리사 정보를 확인할 때는 경력, 가능 코스, 도착 가능 시간을 분리해 묻는 것이 좋습니다. ${pick(managerItems, seed, 3)}.`
  ];
  return card("관리사정보", pick(variants, seed, 4), [pick(managerItems, seed, 4), `${dong} 배정 가능 시간 사전 확인`, "희망 관리 스타일은 상담 단계에서 전달"]);
}
function caution(city, district, dong, seed) {
  const place = `${city} ${district} ${dong}`;
  const variants = [
    `${place} 이용 전에는 총 금액과 코스 범위를 먼저 확인해야 합니다. ${pick(cautionItems, seed, 1)}. 건전한 운영 기준을 벗어난 문의는 상담 범위에서 제외됩니다.`,
    `${dong} 상담은 합법적이고 건전한 방문 케어 기준 안에서만 진행됩니다. ${pick(cautionItems, seed, 2)}. 안내받은 내용과 다른 요청은 제한될 수 있습니다.`,
    `${place} 예약 시에는 ${pick(feeItems, seed, 3)}이 중요합니다. ${pick(cautionItems, seed, 4)}는 기본 운영 기준으로 적용됩니다.`
  ];
  return card("주의사항", pick(variants, seed, 5), [pick(cautionItems, seed, 5), pick(cautionItems, seed, 6), pick(feeItems, seed, 7)]);
}
function callCard(city, district, dong, seed) {
  const p = profile(city);
  const place = `${city} ${district} ${dong}`;
  const variants = [
    `${place} 상담은 전화로 현재 가능 지역과 예상 도착 시간을 가장 빠르게 확인할 수 있습니다. ${pick(p.check, seed, 1)}을 먼저 알려주면 코스별 요금과 후불 조건 안내가 정확해집니다.`,
    `${dong} 예약 문의는 전화 상담 시점의 배정 상황을 기준으로 안내됩니다. 희망 시간, 방문 주소, 원하는 코스를 함께 전달하면 확인이 빠릅니다.`,
    `${place} 가능 여부는 실시간으로 달라질 수 있습니다. 전화로 ${pick(feeItems, seed, 2)} 후 예약을 진행하세요.`
  ];
  return `<article class="detail-card"><h2>전화예약</h2><p>${pick(variants, seed, 6)}</p><p><a class="primary-btn" href="${tel}">${phone}</a></p></article>`;
}
function faq(city, district, dong, seed) {
  const p = profile(city);
  const [sigA, sigB] = dongSignals(dong, district, seed);
  const qs = [
    [`${dong}에서 당일 상담은 어떻게 확인하나요?`, `${sigA}. 현재 위치와 희망 시간을 말하면 배정 가능 범위와 예상 도착 시간을 더 빠르게 안내받을 수 있습니다.`],
    [`${dong} 출장마사지 요금은 왜 달라질 수 있나요?`, `${pick(feeItems, seed, 1)}이 필요하기 때문입니다. 이동 거리, 심야 여부, 코스 시간, 업체 배정 상황에 따라 최종 안내가 달라질 수 있습니다.`],
    [`홈타이와 출장마사지는 어떻게 비교해야 하나요?`, `${dong}에서는 명칭보다 실제 코스 범위와 관리 방식 확인이 중요합니다. ${pick(managerItems, seed, 2)}.`],
    [`관리사 배정 정보는 언제 확인하나요?`, `예약 전 상담 단계에서 가능 시간과 코스 조건을 함께 확인합니다. ${pick(managerItems, seed, 3)}.`],
    [`${dong} 예약 전 주의할 점은 무엇인가요?`, `${pick(cautionItems, seed, 4)}. 또한 ${pick(p.check, seed, 5)}을 미리 전달하면 상담 내용과 실제 방문 안내의 차이를 줄일 수 있습니다.`],
    [`${district} 다른 지역과 ${dong} 안내가 다른 이유는 무엇인가요?`, `${sigB}. 같은 ${district} 안에서도 이동 동선, 주차, 출입 방식이 달라질 수 있어 세부 동 기준으로 안내합니다.`],
    [`예약 전에 코스를 정하지 못해도 되나요?`, `가능합니다. 다만 ${pick(feeItems, seed, 6)}을 먼저 확인해야 하므로 원하는 시간과 관리 목적을 알려주는 것이 좋습니다.`]
  ];
  const start = seed % 3;
  return qs.slice(start, start + 5).map(([q, a], index) => `<div class="faq-item"><h3>${index + 1}. ${q}</h3><p>${a}</p></div>`).join("");
}
function buildContent(city, district, dong) {
  const seed = hashText(`${city}-${district}-${dong}`);
  const place = `${city} ${district} ${dong}`;
  return `<section class="section local-intro"><p class="eyebrow">${place} 지역 안내</p><h2>${dong} 출장마사지 상세 안내</h2><div class="local-intro-box"><p>${intro(city, district, dong, seed)}</p></div></section><section class="section"><div class="detail-grid">${notice(city, district, dong, seed)}${company(city, district, dong, seed)}${extra(city, district, dong, seed)}${manager(city, district, dong, seed)}${caution(city, district, dong, seed)}${callCard(city, district, dong, seed)}</div></section><section class="section"><h2>${dong} 자주 묻는 질문</h2>${faq(city, district, dong, seed)}</section>`;
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

if (existsSync(root) && statSync(root).isDirectory()) {
  walk(root);
}
