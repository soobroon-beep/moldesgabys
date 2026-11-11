/* Ambientaciones de Moldes Gaby's inspiradas en las referencias aportadas.
   Las siluetas vectorizadas provienen de las imágenes que la clienta compartió.
   NO se muestra ninguna figura por delante de las fotos del catálogo. */
(()=>{
'use strict';
const catalog=document.getElementById('catalogo');
if(!catalog)return;
const body=document.body;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const allowed=new Set(['halloween','navidad','patrias','amor','bebes','bano','toda-ocasion']);
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,v));
const random=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v)};
const witchPath="M12,12 L13,14 L21,18 L22,20 L21,22 L23,24 L23,27 L26,27 L28,29 L26,32 L28,32 L27,44 L25,44 L26,46 L22,49 L18,49 L16,51 L9,53 L1,47 L0,48 L8,54 L9,56 L13,57 L15,59 L22,61 L20,64 L21,67 L29,75 L33,83 L37,79 L41,85 L43,89 L42,95 L45,93 L47,87 L52,93 L52,99 L54,98 L55,90 L53,81 L49,83 L47,82 L47,80 L45,79 L43,77 L51,78 L54,76 L62,80 L59,81 L62,82 L59,83 L68,83 L72,89 L78,95 L73,89 L85,98 L85,97 L90,99 L82,93 L89,97 L87,96 L93,98 L90,96 L96,96 L93,95 L95,94 L88,92 L98,93 L94,92 L97,91 L95,90 L98,90 L94,89 L99,88 L94,86 L96,86 L91,85 L99,84 L91,83 L99,81 L90,81 L93,80 L87,80 L87,79 L91,79 L81,78 L85,78 L67,78 L62,73 L63,75 L61,75 L62,76 L61,76 L61,77 L56,75 L62,69 L66,68 L69,69 L64,67 L49,67 L53,63 L55,57 L73,62 L80,61 L84,60 L86,58 L85,52 L89,49 L85,49 L79,53 L77,51 L78,47 L81,42 L86,40 L90,40 L93,43 L91,39 L86,38 L81,38 L56,43 L56,42 L60,41 L51,40 L45,36 L39,31 L42,31 L48,35 L46,34 L51,34 L54,33 L49,33 L48,31 L54,32 L59,29 L55,31 L52,30 L60,27 L56,27 L60,26 L57,25 L51,26 L50,26 L52,25 L49,25 L51,23 L43,25 L47,23 L42,24 L37,22 L45,21 L35,16 L36,12 L34,9 L37,8 L38,3 L41,3 L43,5 L45,4 L39,0 L30,3 L23,12Z";
const batPaths=["M0,5 L18,43 L20,60 L28,64 L33,75 L31,78 L35,77 L32,87 L36,98 L45,97 L49,90 L50,95 L52,88 L60,82 L67,89 L72,83 L83,89 L89,83 L99,83 L97,71 L91,61 L72,43 L72,40 L63,56 L62,40 L56,55 L54,44 L50,36 L48,41 L48,55 L45,56 L37,21 L26,8 L13,0Z","M99,8 L87,0 L75,5 L72,2 L71,12 L60,36 L58,35 L58,21 L54,30 L49,32 L44,26 L45,36 L42,36 L34,17 L32,4 L15,4 L0,21 L4,27 L9,46 L15,50 L22,64 L32,71 L37,83 L36,90 L38,86 L50,98 L57,87 L61,91 L72,65 L79,61 L86,45 L92,39 L93,23Z","M0,33 L6,51 L15,59 L22,74 L33,74 L43,81 L45,87 L47,84 L51,93 L58,98 L67,76 L69,77 L69,72 L78,59 L85,54 L90,37 L96,24 L99,3 L91,0 L80,6 L75,14 L72,12 L73,16 L60,37 L56,31 L57,5 L53,11 L50,24 L47,14 L42,9 L46,33 L45,42 L31,35 L29,28 L7,27Z"];
const stage=document.createElement('div');
stage.id='gabys-season-stage';
stage.setAttribute('aria-hidden','true');
stage.innerHTML='<div class="gabys-stage-sticky">'+
'<div class="gabys-scene gabys-halloween">'+
 '<div class="gabys-h-moon"></div>'+
 '<div class="gabys-h-haze"></div>'+
 '<svg class="gabys-h-trees" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
 '<path class="tree-trunk" d="M-28 941 C80 763 142 616 111 479 C92 379 34 336 -15 295 M111 479 C188 399 219 304 214 206 M111 479 C48 446 22 416 -34 384 M214 206 C275 154 298 119 321 39 M214 206 C188 112 162 86 136 -18 M111 479 C187 490 219 469 271 393 M271 393 C315 345 355 347 392 286 M137 610 C203 573 246 556 292 482 M292 482 C342 467 380 426 401 373"/>'+
 '<path class="tree-trunk" d="M1475 936 C1358 789 1302 625 1353 486 C1379 400 1426 338 1482 280 M1353 486 C1284 434 1251 381 1244 290 M1353 486 C1403 445 1432 422 1489 402 M1244 290 C1175 241 1162 182 1136 121 M1244 290 C1263 196 1290 149 1284 39 M1332 587 C1278 570 1228 524 1217 462 M1217 462 C1162 432 1142 396 1122 335 M1258 721 C1205 666 1164 638 1115 606 M1115 606 C1068 555 1052 517 1010 492"/>'+
 '<path class="tree-twigs" d="M214 206 L163 183 M214 206 L250 148 M292 482 L314 413 M392 286 L404 240 M1244 290 L1204 195 M1136 121 L1091 95 M1115 606 L1099 558 M1010 492 L991 443 M1217 462 L1171 438"/>'+
 '</svg>'+
 '<div class="gabys-h-witch witch-one"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+witchPath+'"/></svg></div>'+
 '<div class="gabys-h-witch witch-two"><svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+witchPath+'"/></svg></div>'+
 '<div class="gabys-h-bats" id="gabys-h-bats"></div>'+
 '</div>'+
 '<div class="gabys-scene gabys-christmas">'+
  '<div class="gabys-xmas-glow"></div>'+
  '<div class="gabys-xmas-wires" id="gabys-xmas-wires"></div>'+
  '<div class="gabys-xmas-snow" id="gabys-xmas-snow"></div>'+
 '</div>'+
 '<div class="gabys-scene gabys-patrias" id="gabys-fireworks"></div>'+
'</div>';
catalog.insertBefore(stage,catalog.firstChild);
// Compatibility: remove the obsolete floating canvas from the previous design.
document.getElementById('gabys-season-effects')?.remove();
function makeBats(){
 const wrap=document.getElementById('gabys-h-bats');let out='';
 const spots=[[7,12,42,0],[17,27,55,1],[5,60,46,2],[12,79,33,0],
  [92,17,49,2],[83,32,37,1],[95,56,56,0],[85,80,43,2],[4,41,28,1]];
 spots.forEach(([x,y,size,n],i)=>{
   const delay=-(i*.91).toFixed(2);
   out+='<span class="gabys-h-bat" style="--x:'+x+'%;--y:'+y+'%;--size:'+size+'px;--delay:'+delay+'s;--duration:'+(3.3+i%3*.9)+'s">'+
   '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+batPaths[n]+'"/></svg></span>';
 });
 wrap.innerHTML=out;
}
function makeBulbs(){
 const wrap=document.getElementById('gabys-xmas-wires');
 const colors=['#fc4e61','#29cb75','#53a4ff','#ffcd50','#b574f8','#3df1e3','#ff8b37'];
 const rows=[{y:91,a:31,b:18,phase:.1,step:70},{y:235,a:43,b:18,phase:1.5,step:83},{y:418,a:33,b:15,phase:2.6,step:108}];
 let content='<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
 rows.forEach((row,j)=>{
   function yy(x){return row.y+row.a*Math.sin(x*.012+row.phase)+row.b*Math.sin(x*.027+row.phase*.7)}
   let d='M -35 '+yy(-35).toFixed(1);
   for(let x=-20;x<=1470;x+=19)d+=' L '+x+' '+yy(x).toFixed(1);
   content+='<path class="gabys-light-wire" d="'+d+'"/>';
   let count=0;
   for(let x=20+j*32;x<1460;x+=row.step){
     const y=yy(x);const color=colors[(count*3+j)%colors.length];
     const delay=-(.7*count+1.6*j).toFixed(2),duration=(2.4+(count%5)*.51).toFixed(2);
     content+='<g class="gabys-light" style="--light:'+color+';--light-delay:'+delay+'s;--light-duration:'+duration+'s" transform="translate('+x+' '+y.toFixed(2)+')">'+
       '<path class="gabys-light-stem" d="M0 0 L0 13"/>'+
       '<rect x="-5" y="10" width="10" height="6" rx="2" fill="#251a32"/>'+
       '<circle class="gabys-light-aura" cx="0" cy="24" r="19"/>'+
       '<ellipse class="gabys-light-bulb" cx="0" cy="22" rx="6.8" ry="10.2"/>'+
       '<ellipse cx="-2.5" cy="18.5" rx="2.2" ry="4.1" fill="#fff" opacity=".85"/>'+
       '</g>';
     count++;
   }
 });
 content+='</svg>';wrap.innerHTML=content;
}
function makeSnow(){
 const wrap=document.getElementById('gabys-xmas-snow');
 let out='';
 const count=window.innerWidth<650?45:78;
 const shape='<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.6">'+
   '<path d="M24 2 V46 M2 24 H46 M8.5 8.5 L39.5 39.5 M39.5 8.5 L8.5 39.5"/>'+
   '<path d="M18 8 L24 14 L30 8 M18 40 L24 34 L30 40 M8 18 L14 24 L8 30 M40 18 L34 24 L40 30"/>'+
   '</g></svg>';
 for(let i=0;i<count;i++){
   const x=(random(i+20)*100).toFixed(1);
   const size=(9+random(i+100)*34).toFixed(1);
   const dur=(7.5+random(i+180)*12).toFixed(2);
   const delay=(-random(i+220)*18).toFixed(2);
   const drift=((random(i+290)-.5)*180).toFixed(1);
   const opacity=(.38+random(i+360)*.56).toFixed(2);
   out+='<span class="gabys-snowflake" style="--sx:'+x+'%;--ss:'+size+'px;--sd:'+dur+'s;--sl:'+delay+'s;--sw:'+drift+'px;--so:'+opacity+'">'+shape+'</span>';
 }
 wrap.innerHTML=out;
}
function makeFireworks(){
 const wrap=document.getElementById('gabys-fireworks');
 const places=[[8,24],[90,16],[10,72],[93,74],[4,49],[96,52]];
 let out='';
 places.forEach(([x,y],i)=>{
   let rays='';
   for(let j=0;j<24;j++){
     const a=j*15;
     const color=['#47c677','#f9e7c0','#f17c87'][j%3];
     rays+='<path d="M0 -34 L0 -61" stroke="'+color+'" stroke-width="2.6" stroke-linecap="round" transform="rotate('+a+')"/>';
   }
   out+='<div class="gabys-firework" style="--fx:'+x+'%;--fy:'+y+'%;--fd:'+(i*.58)+'s">'+
       '<svg viewBox="-85 -85 170 170" aria-hidden="true">'+rays+'</svg></div>';
 });
 wrap.innerHTML=out;
}
makeBats();makeBulbs();makeSnow();makeFireworks();
let theme='todos', raf=0;
function visibility(){
 raf=0;
 const bounds=catalog.getBoundingClientRect(),vh=window.innerHeight;
 // Fade smoothly in and out when crossing the catalog boundaries.
 const enter=clamp((vh*.92-bounds.top)/(vh*.64));
 const exit=clamp((bounds.bottom-vh*.18)/(vh*.72));
 const amount=theme==='todos'?0:Math.min(enter,exit);
 stage.style.setProperty('--scene-opacity',amount.toFixed(3));
}
function schedule(){if(!raf)raf=requestAnimationFrame(visibility)}
function setSeason(value){
 theme=allowed.has(value)?value:'todos';
 body.dataset.gabysSeason=theme;
 stage.dataset.scene=theme;
 schedule();
}
window.GABYS_SET_SEASON=setSeason;
window.addEventListener('gabys:season-change',event=>setSeason(event.detail?.season));
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',()=>{schedule();makeSnow()},{passive:true});
document.addEventListener('visibilitychange',()=>{stage.classList.toggle('scene-paused',document.hidden)});
const prior=body.dataset.gabysSeason;
setSeason(allowed.has(prior)?prior:'navidad');
if(reduced.matches)stage.classList.add('scene-reduced');
reduced.addEventListener?.('change',()=>stage.classList.toggle('scene-reduced',reduced.matches));
})();