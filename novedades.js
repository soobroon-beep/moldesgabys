
/* Exposición creativa, pila de fotos fluida y cambios de portada sin saltos. */
(()=>{'use strict';
const $=sel=>document.querySelector(sel);
const all=()=>window.GABYS_TIENDA?.obtenerModelos?.()||window.GABYS_CATALOGO||[];
const seasons=[['navidad','Navidad'],['halloween','Halloween'],['patrias','Fiestas Patrias'],['amor','San Valentín'],['bebes','Bebés'],['cocina','Cocina'],['toda-ocasion','Toda ocasión']];
const byName=Object.fromEntries(seasons);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dateOf=p=>{const v=p.fechaPublicacion||p.fechaActualizacion||p.actualizado||p.fecha;const ms=Date.parse(v||'');return Number.isFinite(ms)?ms:0};
const sortLatest=(a,b)=>dateOf(b)-dateOf(a)||Number(b.numero??-1)-Number(a.numero??-1)||String(b.archivo||'').localeCompare(String(a.archivo||''),'es');
const latest=(key,limit=5)=>all().filter(p=>p.seccion===key).sort(sortLatest).slice(0,limit);
const imgSrc=p=>p.id?'images/'+encodeURIComponent(p.codigo)+'.webp':p.imagen;
const urls=p=>[imgSrc(p),p.id?'https://lh3.googleusercontent.com/d/'+encodeURIComponent(p.id)+'=w900':'',p.id?'https://drive.google.com/thumbnail?id='+encodeURIComponent(p.id)+'&sz=w900':''].filter(Boolean);
const label=p=>(byName[p.seccion]||'Modelo')+' · '+p.nombre;
function loadInto(img,p){
  const list=urls(p);let idx=0;
  img.alt=label(p);img.decoding='async';
  img.onerror=()=>{if(++idx<list.length)img.src=list[idx];else{img.onerror=null;img.alt='Vista previa temporalmente no disponible'}};
  img.src=list[idx];
}
function preload(p){
  return new Promise(resolve=>{
    const list=urls(p);let idx=0;
    const probe=new Image();
    probe.onload=()=>resolve(probe.src);
    probe.onerror=()=>{if(++idx<list.length)probe.src=list[idx];else resolve(null)};
    probe.src=list[idx]||'';
  });
}
const open=p=>window.GABYS_TIENDA?.abrirModelo?.(p.codigo);
let deck=[],current=0,paused=false,hovered=false,deckTimer=null,heroTimer=null,heroVersion=0;
function buildDeck(){
  const section=$('#ultimos-modelos'),track=$('#recent-track');
  if(!section||!track)return;
  deck=seasons.flatMap(([key])=>latest(key,5));track.replaceChildren();
  if(!deck.length){section.hidden=true;return}
  section.hidden=false;
  deck.forEach((p,i)=>{
    const card=document.createElement('button');card.type='button';card.className='recent-card';card.setAttribute('aria-label','Abrir '+label(p));
    const img=document.createElement('img');img.loading=i<4?'eager':'lazy';loadInto(img,p);
    const chip=document.createElement('span');chip.className='recent-chip';chip.textContent=p.numero==null?'S/N':'N.º '+p.numero;
    const cat=document.createElement('span');cat.className='recent-cat';cat.textContent=byName[p.seccion]||p.seccion;
    const name=document.createElement('span');name.className='recent-model';name.textContent=p.nombre;
    const code=document.createElement('span');code.className='recent-code';code.textContent=p.codigo;
    card.append(img,chip,cat,name,code);
    card.addEventListener('click',()=>open(p));
    track.appendChild(card);
  });
  current=0;updateDeck();
  const c=seasons.filter(([key])=>deck.some(p=>p.seccion===key)).map(x=>x[1]);
  $('#recent-count').textContent=deck.length+' modelos de '+c.join(' y ');
}
function updateDeck(){
  const cards=Array.from($('#recent-track')?.children||[]),n=cards.length;
  if(!n)return;
  cards.forEach((card,i)=>{
    const pos=(i-current+n)%n;
    let pose='';
    if(pos===0)pose='deck-active';
    else if(pos===1)pose='deck-right';
    else if(pos===2&&n>3)pose='deck-back';
    else if(pos===n-1&&n>2)pose='deck-left';
    card.className='recent-card'+(pose?' '+pose:'');
    card.tabIndex=pose?0:-1;
    card.setAttribute('aria-hidden',pose?'false':'true');
  });
  const p=deck[current],name=byName[p.seccion]||p.seccion;
  const el=$('#recent-current-label');
  if(el)el.textContent='✦ '+name+' · '+p.codigo+' · Toca una foto para abrirla';
}
function move(delta=1){
  if(deck.length<2)return;
  current=(current+delta+deck.length)%deck.length;
  updateDeck();
}
function attachStage(){
  $('#recent-prev')?.addEventListener('click',()=>move(-1));
  $('#recent-next')?.addEventListener('click',()=>move(1));
  const btn=$('#recent-pause');
  btn?.addEventListener('click',()=>{paused=!paused;btn.setAttribute('aria-pressed',String(paused));btn.setAttribute('aria-label',paused?'Reanudar carrusel':'Pausar carrusel');btn.textContent=paused?'▶':'Ⅱ'});
  const stage=$('#recent-viewport');
  stage?.addEventListener('mouseenter',()=>hovered=true);
  stage?.addEventListener('mouseleave',()=>hovered=false);
  stage?.addEventListener('focusin',()=>hovered=true);
  stage?.addEventListener('focusout',e=>{if(!stage.contains(e.relatedTarget))hovered=false});
  stage?.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});
  if(!reduced)deckTimer=setInterval(()=>{if(!document.hidden&&!paused&&!hovered)move(1)},4800);
}
async function crossfadeHero(selector,p,version){
  if(!p)return;
  const old=$(selector);if(!old||old.dataset.code===p.codigo)return;
  const nextUrl=await preload(p);if(version!==heroVersion||!nextUrl)return;
  const currentImage=$(selector);if(!currentImage)return;
  const frame=currentImage.closest('.hero-photo');if(!frame)return;
  const incoming=document.createElement('img');
  incoming.className='hero-image-next';incoming.alt=label(p);incoming.src=nextUrl;
  frame.querySelector('.hero-image-next')?.remove();
  if(reduced){currentImage.src=nextUrl;currentImage.dataset.code=p.codigo;currentImage.alt=label(p);return;}
  frame.appendChild(incoming);
  requestAnimationFrame(()=>requestAnimationFrame(()=>incoming.classList.add('is-visible')));
  setTimeout(()=>{
    if(version!==heroVersion){incoming.remove();return;}
    const before=$(selector);
    if(!before||!incoming.isConnected)return;
    incoming.id=selector.slice(1);incoming.dataset.code=p.codigo;
    incoming.classList.remove('hero-image-next','is-visible');
    incoming.style.opacity='1';incoming.style.transform='none';incoming.style.transition='';
    before.remove();
  },1430);
}
function fillHero(){
  const keys=['navidad','halloween','patrias'].filter(key=>latest(key,1).length);
  if(!keys.length)return;
  let offset=0;
  function frame(){
    const chosen=[],seen=new Set();
    for(const key of keys){
      const group=latest(key,10);
      const p=group[offset%group.length];
      if(p&&!seen.has(p.codigo)){chosen.push(p);seen.add(p.codigo);}
    }
    for(let step=1;chosen.length<3&&step<50;step++){
      const key=keys[step%keys.length],group=latest(key,14),p=group[(offset+step)%group.length];
      if(p&&!seen.has(p.codigo)){chosen.push(p);seen.add(p.codigo);}
    }
    const version=++heroVersion;
    ['#hero-photo','#hero-photo-left','#hero-photo-right'].forEach((selector,i)=>{
      const p=chosen[i];if(!p)return;
      const elem=$(selector),parent=elem?.closest('.hero-photo');
      if(parent){
        parent.setAttribute('role','button');parent.tabIndex=0;
        parent.setAttribute('aria-label','Abrir '+label(p));
        parent.onclick=()=>open(p);
        parent.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(p)}};
      }
      crossfadeHero(selector,p,version);
    });
  }
  frame();
  if(heroTimer)clearInterval(heroTimer);
  if(!reduced)heroTimer=setInterval(()=>{if(!document.hidden){offset++;frame()}},10000);
}
function setup(){
  buildDeck();attachStage();fillHero();
  window.addEventListener('gabys:catalogo-actualizado',()=>{buildDeck();fillHero()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
