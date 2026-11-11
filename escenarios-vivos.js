/* Moldes Gaby's — escenarios estacionales vectoriales animados. */
(()=>{
'use strict';
const stage=document.getElementById('gabys-season-stage');
const holder=stage?.querySelector('.gabys-stage-sticky');
const patrias=holder?.querySelector('.gabys-patrias');
const catalog=document.getElementById('catalogo');
if(!holder||!patrias||!catalog)return;
const small=window.matchMedia('(max-width:780px)');
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
const rand=n=>{const x=Math.sin(n*127.13+63.37)*47832.393;return x-Math.floor(x)};
const clamp=n=>Math.max(0,Math.min(1,n));
const style=o=>' style="'+Object.entries(o).map(([k,v])=>'--'+k+':'+v).join(';')+'"';
const heart='<svg viewBox="0 0 100 95" aria-hidden="true"><path d="M50 88 C32 71 5 55 5 30 C5 7 34 -3 50 20 C66 -3 95 7 95 30 C95 55 68 71 50 88Z" fill="currentColor"/><path d="M21 30 Q25 15 39 17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/></svg>';
const star='<svg viewBox="0 0 56 56" aria-hidden="true"><path d="M28 0 L34 20 L56 28 L34 35 L28 56 L21 35 L0 28 L21 20Z" fill="currentColor"/><circle cx="28" cy="28" r="5" fill="#fff" opacity=".65"/></svg>';
const cupid='<svg viewBox="0 0 192 136" aria-hidden="true">'+
'<g fill="#fee7cf" stroke="#dc9e9f" stroke-width="1.4" stroke-linejoin="round">'+
'<path d="M83 70 C54 38 32 17 16 31 C6 43 20 62 41 73 C12 66 2 81 17 92 C35 104 65 99 87 80Z" fill="#f9e5ef" stroke="#eeafca" stroke-width="2.5"/>'+
'<path d="M83 70 C50 49 35 47 26 54 M75 79 C47 84 30 86 22 82" fill="none" stroke="#e6b5d3" stroke-width="2.3"/>'+
'<path d="M96 64 C75 42 70 24 81 19 C99 11 120 39 112 67 C125 42 137 35 145 48 C153 66 130 91 106 80Z" fill="#ffecf4" stroke="#e5b3d3" stroke-width="2"/>'+
'<ellipse cx="97" cy="75" rx="24" ry="20"/>'+
'<path d="M85 90 Q68 106 63 114 L75 119 L97 100Z"/>'+
'<path d="M104 91 Q105 113 124 118 L131 111 L120 92Z"/>'+
'<path d="M116 71 Q137 69 145 60 L150 66 Q136 83 121 83Z"/>'+
'<path d="M79 73 Q62 70 55 58 L49 62 Q54 81 76 88Z"/>'+
'<circle cx="97" cy="43" r="22"/>'+
'<path d="M78 41 C72 18 92 12 109 20 Q126 22 119 44 Q111 34 105 31 Q95 39 88 33 Q85 44 78 41Z" fill="#c88659" stroke="#a56852"/>'+
'<circle cx="84" cy="24" r="8" fill="#c88659"/><circle cx="96" cy="19" r="8" fill="#ca8d5f"/><circle cx="109" cy="22" r="8" fill="#c88659"/></g>'+
'<circle cx="107" cy="44" r="1.4" fill="#795052"/><circle cx="116" cy="44" r="1.4" fill="#795052"/>'+
'<path d="M112 54 Q118 58 123 52" fill="none" stroke="#b87e81" stroke-width="1.8" stroke-linecap="round"/>'+
'<path d="M139 41 Q164 64 137 93 M139 41 L139 93" stroke="#e7b46e" stroke-width="3.2" fill="none"/>'+
'<path d="M151 65 L189 65 M176 60 L185 65 L176 70" stroke="#ffdfb4" stroke-width="3.3" fill="none" stroke-linecap="round"/>'+
'<path d="M179 62 C171 52 178 47 184 54 C192 45 202 53 194 64 L184 75Z" fill="#ed6496"/></svg>';
const arrow='<svg viewBox="0 0 150 40" aria-hidden="true"><path d="M3 20 H127" fill="none" stroke="#ffe0ac" stroke-width="3" stroke-linecap="round"/><path d="M9 20 L3 12 M9 20 L3 28" fill="none" stroke="#ffe0ac" stroke-width="3"/><path d="M127 20 C115 10 121 3 128 9 C136 0 146 9 140 18 L128 33Z" fill="#ed6a9c"/></svg>';
const cloud='<svg viewBox="0 0 210 108" aria-hidden="true"><path d="M30 94 C7 94 2 63 25 54 C30 51 36 51 42 52 C40 30 57 13 80 17 C93 0 128 8 133 30 C154 20 181 36 179 58 C211 57 212 92 187 94Z" fill="#fff8ff" fill-opacity=".85" stroke="#fff" stroke-opacity=".68" stroke-width="3"/><path d="M31 81 H179" stroke="#ffe7fb" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></svg>';
const moon='<svg viewBox="0 0 135 140" aria-hidden="true"><path d="M87 10 A59 59 0 1 0 126 112 Q77 121 57 80 Q41 45 87 10Z" fill="#ffedc9"/><circle cx="41" cy="76" r="2.7" fill="#a88b92"/><circle cx="63" cy="76" r="2.7" fill="#a88b92"/><path d="M42 87 Q52 95 62 87" fill="none" stroke="#c7a7aa" stroke-width="2.5" stroke-linecap="round"/></svg>';
const bottle='<svg viewBox="0 0 75 116" aria-hidden="true"><path d="M28 16 Q29 3 37 3 Q46 3 47 16 L47 24 H28Z" fill="#fbd6ba" stroke="#f9b9a3" stroke-width="2"/><rect x="24" y="22" width="27" height="15" rx="5" fill="#c5e9f1"/><rect x="16" y="35" width="43" height="73" rx="13" fill="#fff8ef" fill-opacity=".87" stroke="#e9d9ed" stroke-width="3"/><path d="M17 68 H58" stroke="#e7c6e0" stroke-width="3" stroke-dasharray="6 7"/><path d="M27 83 H48" stroke="#e9c0d3" stroke-width="3"/><path d="M37 56 C27 46 23 61 37 69 C52 61 47 46 37 56Z" fill="#f4b4ca"/></svg>';
const rattle='<svg viewBox="0 0 110 115" aria-hidden="true"><circle cx="54" cy="40" r="31" fill="#e6c5ef" stroke="#fdf2ff" stroke-width="5"/><circle cx="40" cy="28" r="8" fill="#fff" fill-opacity=".48"/><rect x="45" y="68" width="18" height="35" rx="9" fill="#fbe4b6"/><rect x="30" y="94" width="49" height="14" rx="7" fill="#eec2d0"/><path d="M41 46 Q54 57 67 46" stroke="#fff7ff" stroke-width="3" fill="none"/></svg>';
const pacifier='<svg viewBox="0 0 105 110" aria-hidden="true"><circle cx="52" cy="48" r="32" fill="#bee9e4" stroke="#eafffc" stroke-width="5"/><ellipse cx="52" cy="40" rx="12" ry="17" fill="#f8d6bd"/><path d="M36 70 Q30 92 52 96 Q74 92 68 70" fill="none" stroke="#f6cad4" stroke-width="8" stroke-linecap="round"/></svg>';
function fireSvg(seed){
 const palettes=[['#52df8d','#f7f3e2','#ff666f'],['#f6d994','#ff8d97','#66dd9c'],['#ed5367','#f4eddb','#47cf8c']];
 const colors=palettes[seed%3];let rays='',dots='',smallRays='';
 for(let i=0;i<34;i++){
  const a=i*360/34+(rand(seed*38+i)*4-2),r=28+rand(seed*62+i)*17,len=28+rand(seed*77+i)*21;
  const col=colors[i%3],w=(1.7+rand(seed*97+i)*1.9).toFixed(2),cur=(rand(seed*100+i)-.5)*7;
  rays+='<path d="M0 -'+r.toFixed(1)+' Q'+cur.toFixed(1)+' -'+(r+len*.62).toFixed(1)+' 0 -'+(r+len).toFixed(1)+'" stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" fill="none" transform="rotate('+a.toFixed(1)+')"/>';
  dots+='<circle cx="0" cy="-'+(r+len+4+rand(seed*123+i)*15).toFixed(1)+'" r="'+(1.1+rand(seed*41+i)*1.9).toFixed(1)+'" fill="'+col+'" transform="rotate('+a.toFixed(1)+')"/>';
 }
 for(let i=0;i<18;i++){
  const a=i*20+rand(seed*79+i)*6,r=57+rand(seed*17+i)*15;
  smallRays+='<path d="M0 -'+r.toFixed(1)+' l'+((rand(seed+i)*4)-2).toFixed(1)+' -'+(9+rand(seed*11+i)*14).toFixed(1)+'" stroke="'+colors[(i+1)%3]+'" stroke-width="1.7" stroke-linecap="round" transform="rotate('+a.toFixed(1)+')"/>';
 }
 return '<svg viewBox="-112 -112 224 224" aria-hidden="true"><g class="gx-fire-ring-a">'+rays+'</g><g class="gx-fire-ring-b">'+smallRays+dots+'</g><circle class="gx-fire-core" r="12" fill="#fff7cc"/></svg>';
}
function newScene(cls,inside){
 const node=document.createElement('div');node.className='gabys-scene gx-scene '+cls;
 node.setAttribute('aria-hidden','true');node.innerHTML=inside;
 holder.appendChild(node);return node;
}
function create(){
 const fireworks=document.createElement('div');fireworks.className='gx-patrias-sky';
 fireworks.innerHTML='<div class="gx-patrias-glow"></div>';
 const pts=[[16,26],[82,20],[12,70],[87,66],[48,15],[55,72],[31,52],[70,42],[38,82]];
 pts.slice(0,small.matches?7:pts.length).forEach(([x,y],i)=>{
  const size=(small.matches?116:151)+rand(i+49)*(small.matches?45:105);
  fireworks.insertAdjacentHTML('beforeend','<span class="gx-firework-burst '+(i>=4?'gx-late':'')+'"'+style({fx:x+'%',fy:y+'%',fs:size.toFixed(0)+'px',fd:(-i*1.21).toFixed(2)+'s',fperiod:(4.6+rand(i+10)*1.7).toFixed(2)+'s'})+'><i class="gx-fire-launch"></i>'+fireSvg(i)+'</span>');
 });
 for(let i=0;i<(small.matches?15:36);i++){
  fireworks.insertAdjacentHTML('beforeend','<span class="gx-fire-glitter '+(i>19?'gx-late':'')+'"'+style({x:(rand(i+220)*100).toFixed(1)+'%',y:(rand(i+283)*100).toFixed(1)+'%',size:(2+rand(i+321)*5).toFixed(1)+'px',delay:(-rand(i+360)*7).toFixed(2)+'s',dur:(2.4+rand(i+390)*3).toFixed(2)+'s'})+'></span>');
 }
 patrias.appendChild(fireworks);
 const love=newScene('gx-amor','<div class="gx-love-glow"></div><div class="gx-love-ribbon"></div>');
 for(let i=0;i<(small.matches?17:40);i++)
  love.insertAdjacentHTML('beforeend','<span class="gx-heart '+(i>=12?'gx-late':'')+'"'+style({x:(rand(i+31)*100).toFixed(1)+'%',size:(16+rand(i+71)*(small.matches?45:64)).toFixed(1)+'px',duration:(7+rand(i+110)*8).toFixed(2)+'s',delay:(-rand(i+141)*16).toFixed(2)+'s',sway:((rand(i+217)-.5)*130).toFixed(1)+'px',hue:['#ff87b3','#ffb2cb','#ef618f','#f7acc0','#eac7ef'][i%5]})+'>'+heart+'</span>');
 for(let i=0;i<(small.matches?2:3);i++)
  love.insertAdjacentHTML('beforeend','<span class="gx-cupid '+(i===2?'gx-late':'')+'"'+style({top:(14+i*26)+'%',size:(small.matches?105:155+17*rand(i+7)).toFixed(0)+'px',duration:(11+i*3.8)+'s',delay:(-i*4.3-1)+'s',wave:((i%2?1:-1)*39)+'px'})+'>'+cupid+'</span>');
 for(let i=0;i<(small.matches?5:9);i++)
  love.insertAdjacentHTML('beforeend','<span class="gx-heart-arrow '+(i>4?'gx-late':'')+'"'+style({top:(8+rand(i+18)*82).toFixed(1)+'%',duration:(5.8+rand(i+12)*3.8).toFixed(2)+'s',delay:(-i*1.7).toFixed(2)+'s',size:(small.matches?68:104)+'px'})+'>'+arrow+'</span>');
 const babies=newScene('gx-bebes','<div class="gx-baby-glow"></div><div class="gx-baby-moon">'+moon+'</div>');
 for(let i=0;i<(small.matches?5:10);i++)
  babies.insertAdjacentHTML('beforeend','<span class="gx-baby-cloud '+(i>5?'gx-late':'')+'"'+style({top:(3+rand(i+40)*76).toFixed(1)+'%',size:(small.matches?105+rand(i+17)*70:135+rand(i+17)*145).toFixed(1)+'px',duration:(13+rand(i+77)*12).toFixed(2)+'s',delay:(-rand(i+83)*24).toFixed(2)+'s'})+'>'+cloud+'</span>');
 for(let i=0;i<(small.matches?20:58);i++)
  babies.insertAdjacentHTML('beforeend','<span class="gx-baby-twinkle '+(i>19?'gx-late':'')+'"'+style({x:(rand(i+221)*100).toFixed(1)+'%',y:(rand(i+282)*94).toFixed(1)+'%',size:(8+rand(i+251)*15).toFixed(1)+'px',delay:(-rand(i+307)*5).toFixed(2)+'s',duration:(3+rand(i+392)*4).toFixed(2)+'s',color:i%2?'#ffefba':'#ffc7e2'})+'>'+star+'</span>');
 const ornaments=[bottle,rattle,pacifier];
 for(let i=0;i<(small.matches?5:7);i++)
  babies.insertAdjacentHTML('beforeend','<span class="gx-baby-ornament '+(i>3?'gx-late':'')+'"'+style({x:(8+rand(i+111)*84).toFixed(1)+'%',top:(20+rand(i+121)*66).toFixed(1)+'%',size:(small.matches?39+rand(i+10)*21:56+rand(i+10)*34).toFixed(0)+'px',duration:(5+rand(i+191)*4).toFixed(2)+'s',delay:(-i*1.7).toFixed(2)+'s'})+'>'+ornaments[i%3]+'</span>');
 const bath=newScene('gx-bano','<div class="gx-bath-caustic"></div><div class="gx-bath-light"></div>');
 for(let i=0;i<(small.matches?23:63);i++)
  bath.insertAdjacentHTML('beforeend','<span class="gx-bubble '+(i>23?'gx-late':'')+'"'+style({x:(rand(i+123)*100).toFixed(1)+'%',size:(12+rand(i+172)*(small.matches?54:78)).toFixed(1)+'px',dur:(5.5+rand(i+230)*8).toFixed(2)+'s',delay:(-rand(i+293)*13).toFixed(2)+'s',drift:((rand(i+340)-.5)*175).toFixed(1)+'px',opacity:(.42+rand(i+360)*.40).toFixed(2)})+'><i></i></span>');
 const party=newScene('gx-todo','<div class="gx-party-glow"></div><div class="gx-party-ribbon ribbon-a"></div><div class="gx-party-ribbon ribbon-b"></div>');
 const colors=['#ffc4dd','#ffd87a','#91dfd8','#f9a5a7','#c4afea','#a6dbaa','#f3bd83'];
 const classes=['gx-confetti-dot','gx-confetti-petal','gx-confetti-spark','gx-confetti-ribbon','gx-confetti-diamond'];
 for(let i=0;i<(small.matches?37:100);i++){
  const kind=classes[i%classes.length];
  party.insertAdjacentHTML('beforeend','<span class="gx-confetti '+kind+' '+(i>34?'gx-late':'')+'"'+style({x:(rand(i+13)*100).toFixed(1)+'%',size:(7+rand(i+74)*21).toFixed(1)+'px',dur:(6+rand(i+93)*10).toFixed(2)+'s',delay:(-rand(i+116)*16).toFixed(2)+'s',drift:((rand(i+192)-.5)*240).toFixed(1)+'px',color:colors[i%colors.length]})+'>'+(kind==='gx-confetti-spark'?star:'')+'</span>');
 }
}
create();
stage.classList.add('gx-enhanced');
// Animaciones suspendidas cuando el catálogo está lejos del área visible.
if(small.matches&&'IntersectionObserver' in window){
  const sceneWatch=new IntersectionObserver(entries=>{
    stage.classList.toggle('gx-offscreen',!entries[0].isIntersecting);
  },{rootMargin:'250px 0px 250px 0px',threshold:0});
  sceneWatch.observe(catalog);
}

let scheduled=0,last=-1;
function update(){
 scheduled=0;
 const rect=catalog.getBoundingClientRect(),vh=window.innerHeight||800;
 const step=Math.round(clamp((vh*.75-rect.top)/Math.max(500,Math.min(rect.height,1550)))*8);
 if(step!==last){
  last=step;holder.style.setProperty('--gx-depth',(step/8).toFixed(3));
  holder.querySelectorAll('.gx-late').forEach((node,i)=>node.classList.toggle('gx-on',i%9<=step));
 }
}
function schedule(){if(!scheduled)scheduled=requestAnimationFrame(update)}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
if(reduced.matches)holder.classList.add('gx-static');
reduced.addEventListener?.('change',()=>holder.classList.toggle('gx-static',reduced.matches));
schedule();
})();