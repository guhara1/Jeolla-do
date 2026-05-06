import { readFileSync, writeFileSync } from "node:fs";

const file = "out/index.html";

const script = `<script>(function(){var root=document.querySelector('[data-review-carousel]');if(!root)return;var track=root.querySelector('.review-track');if(!track||!track.children.length)return;var total=track.children.length;var index=0;var timer=null;function move(){index=(index+1)%total;track.style.transform='translateX(-'+(index*100)+'%)';}function start(){if(timer)return;timer=setInterval(move,4000);}function stop(){if(!timer)return;clearInterval(timer);timer=null;}root.addEventListener('mouseenter',stop);root.addEventListener('mouseleave',start);root.addEventListener('touchstart',stop,{passive:true});root.addEventListener('touchend',start,{passive:true});root.addEventListener('touchcancel',start,{passive:true});root.addEventListener('focusin',stop);root.addEventListener('focusout',start);start();})();</script>`;

let html = readFileSync(file, "utf8");
html = html.replace(/<script>\(function\(\)\{var root=document\.querySelector\('\[data-review-carousel\]'\);[\s\S]*?\}\)\(\);<\/script>/g, "");
html = html.replace("</body>", `${script}</body>`);
writeFileSync(file, html, "utf8");
