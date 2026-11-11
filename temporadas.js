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
/* Bosque con ramas cónicas curvas: volúmenes naturales, no trazos uniformes. */
function gabysTreeSVG(seed,mirror=false){
 const shapes=[];
 const fmt=n=>Number(n).toFixed(1);
 function limb(x,y,length,angle,width,level,k){
   if(level<1||length<5||width<.6)return;
   const dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
   const nx=-Math.sin(angle),ny=Math.cos(angle);
   const bend=(random(seed+k*1.37)-.5)*length*.24;
   const bx=-ny*bend,by=nx*bend;
   const c1x=x+dx*.30+bx,c1y=y+dy*.30+by;
   const c2x=x+dx*.75-bx*.48,c2y=y+dy*.75-by*.48;
   const endX=x+dx,endY=y+dy;
   const tip=Math.max(.5,width*(level<3?.18:.42));
   const coords=(xx,yy)=>fmt(xx)+' '+fmt(yy);
   shapes.push('<path d="M'+coords(x+nx*width*.5,y+ny*width*.5)+
     ' C'+coords(c1x+nx*width*.40,c1y+ny*width*.40)+' '+coords(c2x+nx*tip*.7,c2y+ny*tip*.7)+' '+coords(endX+nx*tip*.5,endY+ny*tip*.5)+
     ' L'+coords(endX-nx*tip*.5,endY-ny*tip*.5)+
     ' C'+coords(c2x-nx*tip*.7,c2y-ny*tip*.7)+' '+coords(c1x-nx*width*.40,c1y-ny*width*.40)+' '+coords(x-nx*width*.5,y-ny*width*.5)+' Z"/>');
   if(level===1)return;
   const variation=random(seed+67+k);
   limb(endX,endY,length*(.67+variation*.12),angle-.34-variation*.24,width*.59,level-1,k*2+1);
   const split=.73+random(seed+k+121)*.14;
   limb(x+dx*split,y+dy*split,length*(.58+random(seed+k+19)*.15),
     angle+.36+random(seed+k+27)*.30,width*.51,level-1,k*2+2);
   if(level>=5){
     const at=.45+random(seed+k+201)*.22;
     limb(x+dx*at,y+dy*at,length*.42,angle-.85,width*.27,level-3,k*3+91);
   }
 }
 limb(15,970,310,-1.31,59,7,1);
 limb(-18,850,210,-.88,25,5,283);
 const flip=mirror?' transform="translate(500 0) scale(-1 1)"':'';
 return '<svg viewBox="0 0 500 1000" preserveAspectRatio="xMinYMax meet" aria-hidden="true"><g'+flip+'>'+
   '<path d="M-60 1000 Q18 926 42 943 Q63 952 90 1000Z"/>'+shapes.join('')+'</g></svg>';
}
const gabysBatShape='<svg viewBox="0 0 130 58" aria-hidden="true">'+
  '<path class="bat-wing bat-wing-left" d="M64 29 C46 8 24 8 0 21 Q13 23 17 37 Q30 25 39 42 Q49 34 64 35Z"/>'+
  '<path class="bat-wing bat-wing-right" d="M66 29 C84 8 106 8 130 21 Q117 23 113 37 Q100 25 91 42 Q81 34 66 35Z"/>'+
  '<path class="bat-body" d="M60 24 L61 16 L65 21 L69 16 L70 25 Q77 41 65 50 Q53 41 60 24Z"/></svg>';
const gabysWitchShape='<svg viewBox="0 0 235 112" aria-hidden="true"><g class="witch-silhouette">'+
  '<path d="M18 81 Q29 68 47 75 L207 66 L214 72 L47 84 Q30 89 18 81Z"/>'+
  '<path d="M18 81 L0 66 L12 81 L2 96 L21 84 L32 94 L26 79Z"/>'+
  '<path d="M88 44 Q98 42 116 47 L140 59 L155 85 L121 78 L101 91 L95 66Z"/>'+
  '<path d="M103 79 L79 94 L69 91 L88 74Z M119 80 L101 100 L89 99 L106 76Z"/>'+
  '<path d="M119 22 Q123 8 134 2 Q141 18 151 22 L167 30 L130 32 L116 31Z"/>'+
  '<path d="M111 31 Q137 26 171 31 Q169 36 150 36 L116 36Z"/>'+
  '<path d="M125 32 Q144 32 151 43 L163 47 L152 52 Q149 59 133 53 Q124 48 125 32Z"/>'+
  '<path d="M126 35 Q113 47 113 58 L105 52 L105 39Z"/>'+
  '<path d="M145 56 Q161 59 169 70 L163 74 L145 66Z"/>'+
  '</g></svg>';
function makeHalloween(){
 const forest=document.getElementById('gabys-h-forest');
 forest.innerHTML=
   '<div class="gabys-h-tree tree-left-back">'+gabysTreeSVG(31)+'</div>'+
   '<div class="gabys-h-tree tree-right-back">'+gabysTreeSVG(47,true)+'</div>'+
   '<div class="gabys-h-tree tree-left">'+gabysTreeSVG(7)+'</div>'+
   '<div class="gabys-h-tree tree-right">'+gabysTreeSVG(18,true)+'</div>';
 const wrap=document.getElementById('gabys-h-flight');
 let out='';
 for(let i=0;i<26;i++){
   const size=(24+random(i+17)*34).toFixed(1);
   const top=(9+random(i+42)*75).toFixed(1);
   const duration=(4.5+random(i+81)*2.9).toFixed(2);
   const delay=(-random(i+128)*9).toFixed(2);
   const sway=((random(i+167)-.5)*90).toFixed(1);
   const opacity=(.60+random(i+193)*.32).toFixed(2);
   const sx=(7+random(i+211)*82).toFixed(1);
   out+='<span class="gabys-h-flyer gabys-h-flying-bat" style="--top:'+top+'%;--size:'+size+'px;--dur:'+duration+'s;--delay:'+delay+'s;--sway:'+sway+'px;--visual-opacity:'+opacity+';--static-x:'+sx+'%">'+gabysBatShape+'</span>';
 }
 for(let i=0;i<5;i++){
   const top=(13+i*14+random(i+270)*5).toFixed(1);
   const size=(104+random(i+285)*42).toFixed(1);
   const duration=(7.0+random(i+303)*2.1).toFixed(2);
   const delay=(-i*1.9-1.1).toFixed(2);
   const sway=((random(i+332)-.5)*75).toFixed(1);
   const sx=(12+i*17).toFixed(1);
   out+='<span class="gabys-h-flyer gabys-h-flying-witch" style="--top:'+top+'%;--size:'+size+'px;--dur:'+duration+'s;--delay:'+delay+'s;--sway:'+sway+'px;--visual-opacity:.87;--static-x:'+sx+'%">'+gabysWitchShape+'</span>';
 }
 wrap.innerHTML=out;
 return {
   bats:Array.from(wrap.querySelectorAll('.gabys-h-flying-bat')),
   witches:Array.from(wrap.querySelectorAll('.gabys-h-flying-witch'))
 };
}
const stage=document.createElement('div');
stage.id='gabys-season-stage';
stage.setAttribute('aria-hidden','true');
stage.innerHTML='<div class="gabys-stage-sticky">'+
'<div class="gabys-scene gabys-halloween">'+
 '<div class="gabys-h-sky-glow"></div>'+
 '<div class="gabys-h-moon"></div>'+
 '<div class="gabys-h-haze"></div>'+
 '<div class="gabys-h-fog fog-far"></div>'+
 '<div class="gabys-h-forest" id="gabys-h-forest"></div>'+
 '<div class="gabys-h-flight" id="gabys-h-flight"></div>'+
 '<div class="gabys-h-fog fog-near"></div>'+
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
 const count=window.innerWidth<780?27:78;
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
const halloween=makeHalloween();makeBulbs();makeSnow();makeFireworks();
let theme='todos', raf=0, previousBats=-1, previousWitches=-1;
function visibility(){
 raf=0;
 const bounds=catalog.getBoundingClientRect(),vh=window.innerHeight;
 // Decoraciones siempre detrás de fotos y textos; suave desvanecimiento en los bordes.
 const enter=clamp((vh*.92-bounds.top)/(vh*.64));
 const exit=clamp((bounds.bottom-vh*.18)/(vh*.72));
 const amount=theme==='todos'?0:Math.min(enter,exit);
 const eased=amount*amount*(3-2*amount);
 stage.style.setProperty('--scene-opacity',eased.toFixed(3));
 stage.style.setProperty('--gs-scene-offset',((1-eased)*18).toFixed(1)+'px');
 if(theme!=='halloween')return;
 // La densidad crece durante los primeros ~1500px de recorrido de Halloween.
 const progress=clamp((vh*.75-bounds.top)/(Math.min(bounds.height,1450)+vh*.35));
 stage.style.setProperty('--h-depth',progress.toFixed(3));
 stage.style.setProperty('--h-shift',(-28*progress).toFixed(1)+'px');
 const batCount=reduced.matches?7:(window.innerWidth<780?Math.round(6+12*progress):Math.round(7+19*progress));
 const witchCount=reduced.matches?2:(window.innerWidth<780?Math.round(1+2*progress):Math.round(2+3*progress));
 if(previousBats!==batCount){
   halloween.bats.forEach((node,i)=>node.classList.toggle('is-active',i<batCount));
   previousBats=batCount;
 }
 if(previousWitches!==witchCount){
   halloween.witches.forEach((node,i)=>node.classList.toggle('is-active',i<witchCount));
   previousWitches=witchCount;
 }
}
function schedule(){if(!raf)raf=requestAnimationFrame(visibility)}
function setSeason(value){
 theme=allowed.has(value)?value:'todos';
 if(theme!=='halloween'){
   halloween.bats.concat(halloween.witches).forEach(node=>node.classList.remove('is-active'));
   previousBats=-1;previousWitches=-1;
 }
 body.dataset.gabysSeason=theme;
 stage.dataset.scene=theme;
 schedule();
}
window.GABYS_SET_SEASON=setSeason;
window.addEventListener('gabys:season-change',event=>setSeason(event.detail?.season));
window.addEventListener('scroll',schedule,{passive:true});
let lastSnowWidth=window.innerWidth;
window.addEventListener('resize',()=>{
 schedule();
 // La barra del navegador cambia la ALTURA al deslizar: no recrear 27 SVG por ello.
 if(Math.abs(window.innerWidth-lastSnowWidth)>24){lastSnowWidth=window.innerWidth;makeSnow()}
},{passive:true});
document.addEventListener('visibilitychange',()=>{stage.classList.toggle('scene-paused',document.hidden)});
const prior=body.dataset.gabysSeason;
setSeason(allowed.has(prior)?prior:'navidad');
if(reduced.matches)stage.classList.add('scene-reduced');
reduced.addEventListener?.('change',()=>{stage.classList.toggle('scene-reduced',reduced.matches);previousBats=-1;previousWitches=-1;schedule()});
})();