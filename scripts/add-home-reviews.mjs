import { readFileSync, writeFileSync } from "node:fs";

const file = "out/index.html";

const reviews = [
  ["광주 상무지구", "퇴근 후 상담했는데 가능 시간과 총 금액을 먼저 알려줘서 결정하기 편했습니다. 도착 시간도 상담 때 안내받은 범위와 크게 다르지 않았습니다."],
  ["전주 완산구", "처음 이용이라 코스 차이를 몰랐는데 기본 시간, 후불 조건, 주의사항을 차례대로 설명해줘서 부담이 적었습니다."],
  ["여수 숙소 이용", "숙소 출입 방식 때문에 걱정했는데 예약 전에 필요한 내용을 확인해줘서 진행이 수월했습니다. 주말이라 시간 확인이 중요했습니다."],
  ["순천 조례동", "요금표만 보고 문의했는데 추가로 확인해야 할 이동 조건을 알려줘서 좋았습니다. 상담 응대가 빠른 편이었습니다."],
  ["군산 수송동", "심야 가능 여부부터 확인했는데 코스 시간과 예상 도착 시간을 같이 안내받았습니다. 후불 안내도 명확했습니다."],
  ["완주 봉동읍", "외곽이라 가능할지 몰랐는데 위치와 시간을 먼저 확인하고 안내해줘서 헷갈리지 않았습니다. 이동 조건 설명이 좋았습니다."],
  ["광양 중마동", "관리사 배정 가능 시간과 코스 범위를 먼저 비교해줘서 선택하기 편했습니다. 과장된 말보다 확인 위주라 신뢰가 갔습니다."],
  ["전주 덕진구", "숙소명과 희망 시간을 말하니 필요한 확인사항을 바로 정리해줬습니다. 처음 이용하는 사람도 이해하기 쉬웠습니다."],
  ["광주 수완지구", "전화 연결 후 지역과 시간대를 전달하니 가능 범위를 빠르게 알려줬습니다. 예약 전에 총 금액을 확인할 수 있어 좋았습니다."],
  ["여수 여천권", "관광지 주변이라 시간이 애매했는데 예상 도착 시간과 코스 조건을 같이 안내해줬습니다. 상담이 깔끔했습니다."],
  ["순천 해룡면", "세부 주소 확인이 필요하다고 먼저 말해줘서 좋았습니다. 가능 시간과 주의사항을 함께 확인하고 예약했습니다."],
  ["군산 나운동", "코스명만 보고 고르기 어려웠는데 실제 제공 범위와 비용 확인 기준을 알려줘서 비교하기 쉬웠습니다."]
];

const slides = [];
for (let i = 0; i < reviews.length; i += 3) {
  slides.push(reviews.slice(i, i + 3));
}

const section = `<section class="section home-reviews" id="reviews"><p class="eyebrow">고객 후기</p><h2>전라도 출장마사지 이용 후기</h2><div class="review-carousel" data-review-carousel><div class="review-track">${slides.map((slide) => `<div class="review-slide">${slide.map(([area, text]) => `<article class="review-card"><div><span>${area}</span><h3>상담 후 확인 후기</h3></div><p>${text}</p></article>`).join("")}</div>`).join("")}</div></div></section>`;

const css = `.home-reviews{padding-top:18px}.review-carousel{overflow:hidden;border:1px solid #2b2b2b;border-radius:14px;background:#0d0d0d}.review-track{display:flex;transition:transform .55s ease}.review-slide{min-width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:16px}.review-card{min-height:220px;border:1px solid #34271f;border-radius:14px;background:linear-gradient(180deg,#151515,#101010);padding:22px;display:flex;flex-direction:column;justify-content:space-between}.review-card span{color:#ff9b3d;font-weight:900;font-size:14px}.review-card h3{color:#fff;font-size:21px;margin:8px 0 0}.review-card p{color:#d8d8d8;line-height:1.75;font-size:16px;margin:20px 0 0}@media(max-width:900px){.review-slide{grid-template-columns:1fr}.review-card{min-height:auto}}`;
const js = `<script>(function(){var root=document.querySelector('[data-review-carousel]');if(!root)return;var track=root.querySelector('.review-track');var total=track.children.length;var index=0;setInterval(function(){index=(index+1)%total;track.style.transform='translateX(-'+(index*100)+'%)';},2000);})();</script>`;

let html = readFileSync(file, "utf8");
html = html.replace(/<section class="section home-reviews"[\s\S]*?<section class="section" id="faq">/, '<section class="section" id="faq">');
html = html.replace('<section class="section" id="faq">', `${section}<section class="section" id="faq">`);
if (!html.includes('.review-carousel')) {
  html = html.replace('</style>', `${css}</style>`);
}
if (!html.includes('[data-review-carousel]')) {
  html = html.replace('</body>', `${js}</body>`);
}
writeFileSync(file, html, "utf8");
