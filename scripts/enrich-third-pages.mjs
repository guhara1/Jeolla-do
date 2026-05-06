import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brand = "마사지킹";
const phone = "0508-202-4683";
const tel = "tel:05082024683";
const root = "out/area";

const cityProfiles = {
  "광주": {
    axis: ["상무지구와 수완지구를 오가는 상담 흐름", "원도심과 신도심 생활권이 섞이는 이동 조건", "주거지와 번화가가 가까운 도심형 문의"],
    check: ["건물명과 주차 가능 여부", "희망 시간과 현재 위치", "상무권, 첨단권, 수완권 중 실제 방문 지점"]
  },
  "전주": {
    axis: ["한옥마을과 객리단길, 혁신도시 생활권이 나뉘는 구조", "완산과 덕진 생활권을 오가는 이동 흐름", "숙소 방문과 주거지 방문 문의가 함께 들어오는 지역성"],
    check: ["숙소명 또는 정확한 동 이름", "완산권인지 덕진권인지 구분", "주말 혼잡 시간대와 출입 방식"]
  },
  "완주": {
    axis: ["읍면 사이 이동 거리가 넓은 외곽형 생활권", "산단과 주거지가 떨어져 있는 상담 구조", "도착 예상 시간을 먼저 맞춰야 하는 지역 조건"],
    check: ["읍면명과 상세 주소", "차량 진입 가능 여부", "이동 추가 조건 발생 가능성"]
  },
  "군산": {
    axis: ["수송동, 나운동, 원도심 문의가 나뉘는 생활권", "항만과 산업단지 주변 이동 동선", "숙소와 주거지 방문 조건이 다른 도시 구조"],
    check: ["방문 지점의 출입 방식", "주차 가능 여부", "심야 이동 가능 시간"]
  },
  "여수": {
    axis: ["관광지와 숙소, 여천 생활권이 함께 움직이는 예약 흐름", "주말과 휴일에 숙박지 문의가 늘어나는 지역성", "해안권 도로 상황에 따라 도착 시간이 바뀌는 구조"],
    check: ["숙박지명과 객실 출입 조건", "관광지 주변 도로 상황", "희망 코스와 상담 가능 시간"]
  },
  "순천": {
    axis: ["신도심과 원도심, 해룡면 권역이 구분되는 상담 구조", "조례동 생활권과 역 주변 문의가 나뉘는 흐름", "주거지 방문 전 주소 확인이 중요한 도시 조건"],
    check: ["조례권인지 원도심권인지", "아파트·숙소 출입 방식", "상담 가능한 시간대"]
  },
  "광양": {
    axis: ["중마동, 광양읍, 금호권 이동 조건이 다른 지역성", "산단 근무 이후 문의가 집중되는 흐름", "외곽 면 지역은 이동 가능 여부 확인이 우선인 구조"],
    check: ["중마권·광양읍권 구분", "산단 주변 이동 가능 시간", "외곽 주소의 추가 이동 조건"]
  }
};

const serviceAngles = [
  "예약 전 확인해야 할 항목을 먼저 보여주는 안내형 페이지",
  "과장된 홍보보다 실제 상담 단계에서 필요한 기준을 정리한 지역 페이지",
  "요금, 코스, 이동 조건을 한 번에 비교하기 위한 실무형 안내",
  "처음 이용하는 고객도 확인 순서를 이해할 수 있도록 구성한 정보 페이지",
  "지역 생활권별로 달라지는 방문 조건을 설명하는 예약 전 체크 페이지",
  "가능 시간과 배정 조건을 먼저 확인하도록 만든 지역 전문 안내"
];
const courseSituations = [
  "퇴근 이후 짧은 회복 코스를 찾는 문의",
  "숙소에서 당일 상담 가능 여부를 묻는 문의",
  "장시간 이동 뒤 피로 관리를 원하는 문의",
  "처음 이용해 기본 코스부터 비교하는 문의",
  "심야 시간대 가능 여부를 먼저 확인하는 문의",
  "주말 예약 가능 시간을 확인하는 문의"
];
const feeChecks = [
  "총 금액과 코스 시간을 먼저 확인", "후불 조건과 추가 이동비 여부 확인", "방문 주소와 출입 가능 시간 전달", "관리사 배정 가능 시간 확인", "요청 코스와 실제 제공 범위 비교", "변경 또는 취소 가능 기준 확인", "주차 또는 차량 진입 가능 여부 확인", "심야 상담 가능 시간 확인"
];
const managerChecks = [
  "관리사 경력은 업체 배정 상황에 따라 달라질 수 있습니다", "강한 압보다 편안한 이완을 원하면 상담 단계에서 미리 말하는 편이 좋습니다", "초보 이용자는 기본 코스 안내를 먼저 받은 뒤 시간을 조정하는 방식이 안정적입니다", "장시간 코스는 배정 가능 여부를 먼저 확인해야 합니다", "오일 사용 여부와 관리 스타일은 상담 시 구체적으로 확인하는 것이 좋습니다", "희망 스타일이 있다면 예약 확정 전에 가능한 범위를 비교해야 합니다"
];
const cautionChecks = [
  "불법 또는 부적절한 요청은 안내하지 않습니다", "과도한 음주 상태에서는 이용이 제한될 수 있습니다", "예약 전 안내받은 범위와 다른 요구는 상담이 중단될 수 있습니다", "미성년자 관련 요청은 접수하지 않습니다", "총 금액과 방문 조건을 확인한 뒤 예약을 진행해야 합니다", "상담 내용과 다른 현장 요청은 제한될 수 있습니다"
];
const buildingNotes = [
  "주차가 어려운 건물은 도착 전 동선을 공유하면 안내가 빨라집니다", "오피스텔과 숙소는 출입 방식이 달라 사전 전달이 필요합니다", "외곽 주소는 예상 도착 시간이 달라질 수 있습니다", "심야 시간대는 배정 가능한 업체가 줄어들 수 있습니다", "주말에는 상담량이 늘어 예약 가능 시간이 빨리 바뀔 수 있습니다", "아파트 단지는 동·호수 전달 방식에 따라 도착 안내가 달라질 수 있습니다"
];
const trustPhrases = [
  "실제 예약 전 확인해야 할 항목을 기준으로 작성했습니다", "이용자가 오해하기 쉬운 비용과 범위부터 정리했습니다", "지역명 반복보다 생활권별 확인 절차를 우선했습니다", "업체를 과장해 소개하지 않고 상담 기준을 먼저 안내합니다", "최종 조건은 전화 상담 시점의 배정 상황을 기준으로 확인해야 합니다", "건전한 방문 케어 범위 안에서만 안내가 진행됩니다"
];

function hashText(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0);
}
function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset * 13) % list.length];
}
function profile(city) {
  return cityProfiles[city] || cityProfiles["광주"];
}
function list(items) {
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}
function card(title, body, items) {
  return `<article class="detail-card"><h2>${title}</h2><p>${body}</p>${list(items)}</article>`;
}
function paragraph(parts) {
  return parts.filter(Boolean).join(" ");
}
function buildIntro(city, district, dong, seed) {
  const p = profile(city);
  const place = `${city} ${district} ${dong}`;
  return paragraph([
    `${place} 출장마사지는 지역명만 보고 결정하기보다 현재 위치, 희망 시간, 이동 거리, 코스 범위를 함께 확인해야 하는 방문형 상담입니다.`,
    `${pick(p.axis, seed)} 때문에 같은 ${district} 안에서도 안내 순서가 달라질 수 있습니다.`,
    `${dong} 주변에서는 ${pick(courseSituations, seed, 1)}가 들어오는 경우가 있어 ${pick(feeChecks, seed, 2)}이 먼저 필요합니다.`,
    `${brand}은 ${place} 이용자가 예약 전에 요금표, 후불 조건, 관리사 배정 가능 여부, 주의사항을 한 페이지에서 비교할 수 있도록 정리합니다.`,
    `${pick(trustPhrases, seed, 3)}. 표기된 정보는 상담 전 참고 기준이며 실제 가능 시간과 최종 금액은 이동 조건, 업체 배정, 선택 코스에 따라 달라질 수 있습니다.`,
    `예약 전에는 ${pick(p.check, seed, 4)}와 ${pick(feeChecks, seed, 5)}을 함께 확인하는 것이 좋습니다.`,
    `이 페이지는 ${dong} 생활권에서 출장마사지와 홈타이 상담을 알아보는 이용자가 과장 광고보다 실제 확인 절차를 먼저 이해하도록 작성했습니다.`
  ]);
}
function bodyTemplates(section, city, district, dong, seed) {
  const p = profile(city);
  const place = `${city} ${district} ${dong}`;
  const common = {
    notice: [
      `${dong} 예약은 ${pick(p.axis, seed)}의 영향을 받습니다. ${pick(buildingNotes, seed, 1)}. 상담 전 ${pick(p.check, seed, 2)}을 알려주면 가능 여부를 더 빠르게 확인할 수 있습니다.`,
      `${place} 방문 상담은 시간대별 배정 상황이 고정되어 있지 않습니다. 특히 ${pick(courseSituations, seed, 3)}는 ${pick(feeChecks, seed, 4)}이 먼저 필요합니다.`,
      `${dong} 주변은 이동 조건이 단순하지 않을 수 있습니다. ${pick(buildingNotes, seed, 5)}. 예약 확정 전에는 도착 예상 시간과 총 금액을 함께 확인하세요.`
    ],
    company: [
      `${brand}은 ${place} 출장마사지와 홈타이 정보를 지역 생활권 기준으로 정리하는 안내 플랫폼입니다. ${pick(trustPhrases, seed, 6)}. 특정 업체를 과장하기보다 상담 전 비교해야 할 조건을 먼저 보여줍니다.`,
      `${place} 페이지는 이용자가 업체 배정 가능 여부를 묻기 전 확인할 수 있는 기본 정보를 담고 있습니다. ${pick(serviceAngles, seed, 7)}로 운영되며, 요금과 주의사항을 함께 안내합니다.`,
      `${brand}은 ${city} ${district} 안에서도 ${dong}처럼 세부 생활권별로 달라지는 방문 조건을 분리해 안내합니다. ${pick(p.axis, seed, 8)}을 반영해 상담 전 체크 항목을 구성했습니다.`
    ],
    extra: [
      `${dong} 이용 전에는 건물 출입 방식, 주차 가능 여부, 연락 가능한 시간을 미리 정리해 두는 편이 좋습니다. ${pick(buildingNotes, seed, 9)}.`,
      `${place} 상담에서는 결제 방식과 코스 범위를 먼저 맞춘 뒤 예약을 진행하는 것이 안정적입니다. ${pick(feeChecks, seed, 10)}이 누락되면 최종 안내가 달라질 수 있습니다.`,
      `${dong} 주변은 같은 지역 안에서도 숙소, 주거지, 상권 방문 조건이 다를 수 있습니다. ${pick(p.check, seed, 11)}을 기준으로 상담하면 불필요한 대기 시간을 줄일 수 있습니다.`
    ],
    manager: [
      `${pick(managerChecks, seed, 12)}. ${dong} 배정은 가능한 시간, 코스 종류, 이동 조건에 따라 달라지므로 원하는 스타일은 예약 전 구체적으로 전달하는 것이 좋습니다.`,
      `${place} 관리사 배정은 상담 시점의 업체 상황을 기준으로 확인합니다. ${pick(managerChecks, seed, 13)}. 초보 이용자는 코스 범위를 먼저 안내받는 것이 안전합니다.`,
      `${dong}에서 관리사 정보를 확인할 때는 경력, 가능 코스, 도착 가능 시간을 분리해 묻는 것이 좋습니다. ${pick(managerChecks, seed, 14)}.`
    ],
    caution: [
      `${place} 이용 전에는 총 금액과 코스 범위를 먼저 확인해야 합니다. ${pick(cautionChecks, seed, 15)}. 건전한 운영 기준을 벗어난 문의는 상담 범위에서 제외됩니다.`,
      `${dong} 상담은 합법적이고 건전한 방문 케어 기준 안에서만 진행됩니다. ${pick(cautionChecks, seed, 16)}. 안내받은 내용과 다른 요청은 제한될 수 있습니다.`,
      `${place} 예약 시에는 ${pick(feeChecks, seed, 17)}이 중요합니다. ${pick(cautionChecks, seed, 18)}는 기본 운영 기준으로 적용됩니다.`
    ],
    call: [
      `${place} 상담은 전화로 현재 가능 지역과 예상 도착 시간을 가장 빠르게 확인할 수 있습니다. ${pick(p.check, seed, 19)}을 먼저 알려주면 코스별 요금과 후불 조건 안내가 정확해집니다.`,
      `${dong} 예약 문의는 전화 상담 시점의 배정 상황을 기준으로 안내됩니다. 희망 시간, 방문 주소, 원하는 코스를 함께 전달하면 확인이 빠릅니다.`,
      `${place} 가능 여부는 실시간으로 달라질 수 있습니다. 전화로 ${pick(feeChecks, seed, 20)} 후 예약을 진행하세요.`
    ]
  };
  return pick(common[section], seed, section.length);
}
function buildCards(city, district, dong, seed) {
  const p = profile(city);
  const place = `${city} ${district} ${dong}`;
  const cards = [
    card("공지사항", bodyTemplates("notice", city, district, dong, seed), [`${dong} 현재 위치와 희망 시간 전달`, pick(feeChecks, seed, 1), pick(buildingNotes, seed, 2)]),
    card("업체소개", bodyTemplates("company", city, district, dong, seed), [`${place} 기준 지역 정보 분류`, pick(serviceAngles, seed, 3), "상담 전 요금·코스·주의사항 확인"]),
    card("기타사항", bodyTemplates("extra", city, district, dong, seed), [pick(p.check, seed, 4), pick(feeChecks, seed, 5), pick(buildingNotes, seed, 6)]),
    card("관리사정보", bodyTemplates("manager", city, district, dong, seed), [pick(managerChecks, seed, 7), `${dong} 배정 가능 시간 사전 확인`, "희망 관리 스타일은 상담 단계에서 전달"]),
    card("주의사항", bodyTemplates("caution", city, district, dong, seed), [pick(cautionChecks, seed, 8), pick(cautionChecks, seed, 9), pick(feeChecks, seed, 10)]),
    `<article class="detail-card"><h2>전화예약</h2><p>${bodyTemplates("call", city, district, dong, seed)}</p><p><a class="primary-btn" href="${tel}">${phone}</a></p></article>`
  ];
  return cards.join("");
}
function buildFaq(city, district, dong, seed) {
  const p = profile(city);
  const faqs = [
    [`${dong}에서 당일 상담은 어떻게 확인하나요?`, `${pick(p.axis, seed)}이 있어 상담 시점의 배정 상황을 확인해야 합니다. 현재 위치와 희망 시간을 말하면 가능 범위를 더 빠르게 안내받을 수 있습니다.`],
    [`${dong} 출장마사지 요금은 왜 달라질 수 있나요?`, `${pick(feeChecks, seed, 1)}이 필요합니다. 이동 거리, 심야 여부, 코스 시간, 업체 배정 상황에 따라 최종 안내가 달라질 수 있습니다.`],
    [`홈타이와 출장마사지는 어떻게 비교해야 하나요?`, `${dong}에서는 명칭보다 실제 코스 범위와 관리 방식 확인이 중요합니다. ${pick(managerChecks, seed, 2)}.`],
    [`관리사 배정 정보는 언제 확인하나요?`, `예약 전 상담 단계에서 가능 시간과 코스 조건을 함께 확인합니다. ${pick(managerChecks, seed, 3)}.`],
    [`${dong} 예약 전 주의할 점은 무엇인가요?`, `${pick(cautionChecks, seed, 4)}. 또한 ${pick(p.check, seed, 5)}을 미리 전달하면 상담 내용과 실제 방문 안내의 차이를 줄일 수 있습니다.`]
  ];
  return faqs.map(([q, a], index) => `<div class="faq-item"><h3>${index + 1}. ${q}</h3><p>${a}</p></div>`).join("");
}
function buildContent(city, district, dong) {
  const seed = hashText(`${city}-${district}-${dong}`);
  const place = `${city} ${district} ${dong}`;
  return `<section class="section local-intro"><p class="eyebrow">${place} 지역 안내</p><h2>${dong} 출장마사지 상세 안내</h2><div class="local-intro-box"><p>${buildIntro(city, district, dong, seed)}</p></div></section><section class="section"><div class="detail-grid">${buildCards(city, district, dong, seed)}</div></section><section class="section"><h2>${dong} 자주 묻는 질문</h2>${buildFaq(city, district, dong, seed)}</section>`;
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
