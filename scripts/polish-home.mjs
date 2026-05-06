import { readFileSync, writeFileSync } from "node:fs";

const file = "out/index.html";
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
@media(max-width:1100px){.hero{grid-template-columns:1fr;min-height:auto}.hero>div:first-child{max-width:none}.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.hero{padding-top:28px;gap:24px}.hero h1{font-size:42px}.panel{padding:18px}.quick-grid{grid-template-columns:1fr}.quick-card{min-height:auto}.quick-action{justify-self:stretch;text-align:center}.hero .lead{font-size:16px}}
`;

let html = readFileSync(file, "utf8");
html = html.replace("</style>", `${css}</style>`);
writeFileSync(file, html, "utf8");
