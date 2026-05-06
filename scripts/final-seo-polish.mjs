import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "out";
const oldDomains = ["https://jeolla-do.netlify.app", "http://jeolla-do.netlify.app"];
const siteUrl = "https://jeolla-do.vercel.app";
const today = new Date().toISOString().slice(0, 10);
const qualityCss = `.quality-note .trust-card{border-color:#34271f;background:linear-gradient(180deg,#121212,#0c0c0c)}.quality-note ul{margin:16px 0 0;color:#d8d8d8;line-height:1.8}`;

const cityNotes = {
  "광주": "광주는 상무지구, 첨단, 수완, 충장로처럼 상권과 주거지가 분리되어 같은 광주 안에서도 상담 가능 시간과 이동 동선이 달라집니다.",
  "전주": "전주는 한옥마을과 객리단길, 혁신도시, 덕진 생활권 문의가 섞여 숙소명과 세부 주소 확인이 특히 중요합니다.",
  "완주": "완주는 읍면 간 거리가 넓어 봉동, 삼례, 이서, 고산권 등 실제 방문 지점에 따라 도착 예상 시간이 크게 달라질 수 있습니다.",
  "군산": "군산은 수송동과 나운동, 원도심, 산단 주변 상담 흐름이 달라 주차와 출입 방식 확인이 먼저 필요합니다.",
  "여수": "여수는 관광지와 숙박지, 여천 생활권 문의가 함께 들어와 주말과 야간에는 가능 시간 확인이 가장 중요합니다.",
  "순천": "순천은 조례권, 원도심, 해룡면, 역 주변 생활권이 나뉘어 방문 주소와 이동 조건을 분리해 확인해야 합니다.",
  "광양": "광양은 중마동, 광양읍, 금호권, 산단 주변의 이동 조건이 달라 상담 전 실제 위치 확인이 우선입니다."
};

const districtAngles = [
  "예약 전에는 총 금액, 코스 시간, 후불 조건, 추가 이동비 여부를 한 번에 확인하는 편이 안전합니다.",
  "처음 이용하는 고객은 코스명보다 실제 제공 범위와 관리 시간, 주의사항을 먼저 비교하는 것이 좋습니다.",
  "숙소나 오피스텔 이용 시에는 출입 방식과 연락 가능한 시간을 미리 전달하면 현장 안내 차이를 줄일 수 있습니다.",
  "심야 문의는 업체 배정 상황이 빠르게 바뀔 수 있어 희망 시간과 현재 위치를 함께 전달해야 합니다.",
  "표기 정보는 상담 전 참고 기준이며 최종 조건은 전화 상담 시점의 배정 상황에 따라 달라질 수 있습니다."
];

function hashText(text) {
  return [...text].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 7), 0);
}
function pick(list, seed, offset = 0) {
  return list[Math.abs(seed + offset * 11) % list.length];
}
function decodePathPart(part) {
  try { return decodeURIComponent(part); } catch { return part; }
}
function replaceAllDomains(text) {
  let next = text;
  for (const domain of oldDomains) next = next.split(domain).join(siteUrl);
  return next;
}
function ensureHeadMeta(html) {
  if (!html.includes('property="og:locale"')) html = html.replace("</head>", '<meta property="og:locale" content="ko_KR"></head>');
  if (!html.includes('name="format-detection"')) html = html.replace("</head>", '<meta name="format-detection" content="telephone=no"></head>');
  if (!html.includes('name="last-modified"')) html = html.replace("</head>", `<meta name="last-modified" content="${today}"></head>`);
  return html;
}
function ensureQualityStyle(html) {
  if (html.includes("quality-note") && !html.includes("quality-note .trust-card") && html.includes("</style>")) {
    return html.replace("</style>", `${qualityCss}</style>`);
  }
  return html;
}
function qualitySection(parts) {
  const city = parts[0] || "전라도";
  const district = parts[1] || "";
  const dong = parts[2] || "";
  const seed = hashText(parts.join("-"));
  const note = cityNotes[city] || "전라도 지역은 도시별 생활권과 이동 조건이 달라 상담 전 세부 주소와 희망 시간을 함께 확인해야 합니다.";
  const title = dong ? `${dong} 상담 전 확인 기준` : district ? `${district} 지역 상담 기준` : `${city} 지역 상담 기준`;
  const body = dong
    ? `${city} ${district} ${dong} 페이지는 지역명 반복보다 실제 상담에서 확인해야 하는 항목을 중심으로 구성했습니다. ${note} ${pick(districtAngles, seed, 1)}`
    : district
      ? `${city} ${district} 안내는 3차 세부 지역으로 이동하기 전, 생활권과 방문 조건을 먼저 비교할 수 있도록 정리했습니다. ${note} ${pick(districtAngles, seed, 2)}`
      : `${city} 안내는 2차 지역을 선택하기 전 도시 전체의 이동 흐름과 상담 기준을 이해할 수 있도록 구성했습니다. ${note} ${pick(districtAngles, seed, 3)}`;
  return `<section class="section quality-note"><p class="eyebrow">운영 기준</p><h2>${title}</h2><div class="trust-card"><p>${body}</p><ul><li>지역별 이동 가능 시간과 세부 주소 확인</li><li>코스 범위, 총 금액, 후불 조건 사전 확인</li><li>불법·부적절한 요청은 상담 범위에서 제외</li></ul></div></section>`;
}
function polishHtml(file) {
  let html = readFileSync(file, "utf8");
  html = replaceAllDomains(html);
  html = ensureHeadMeta(html);

  const normalized = file.replaceAll("\\", "/");
  const areaIndex = normalized.split("/").indexOf("area");
  if (areaIndex !== -1 && !html.includes("quality-note")) {
    const parts = normalized.split("/").slice(areaIndex + 1, -1).map(decodePathPart);
    if (parts.length === 1 || parts.length === 2) html = html.replace("</main>", `${qualitySection(parts)}</main>`);
  }

  html = ensureQualityStyle(html);
  writeFileSync(file, html, "utf8");
}
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile()) {
      if (entry.name.endsWith(".html")) polishHtml(full);
      if (["sitemap.xml", "robots.txt", "rss.xml"].includes(entry.name)) {
        writeFileSync(full, replaceAllDomains(readFileSync(full, "utf8")), "utf8");
      }
    }
  }
}

if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error("Missing out directory");
walk(root);
