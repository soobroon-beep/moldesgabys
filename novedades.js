
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
let deck=[],heroTimer=null,heroVersion=0;
function buildDeck(){
  const section=$('#ultimos-modelos'),track=$('#recent-track'),viewport=$('#recent-viewport');
  if(!section||!track)return;
  // Cada recarga usa los datos del catálogo: no rota las fotos automáticamente.
  const groups=seasons.map(([key])=>({key,items:latest(key,10)})).filter(group=>group.items.length>0);
  const picked=[];
  for(let round=0;picked.length<10;round++){
    let added=false;
    for(const group of groups){
      if(group.items[round]&&picked.length<10){picked.push(group.items[round]);added=true;}
    }
    if(!added)break;
  }
  deck=picked;
  track.replaceChildren();
  if(!deck.length){section.hidden=true;return}
  section.hidden=false;
  const tilts=[-5,3,-3,5,-4,4,-2,3,-4,2],rise=[5,16,2,13,4,18,5,14,2,12];
  deck.forEach((p,i)=>{
    const card=document.createElement('button');
    card.type='button';card.className='recent-card';
    card.style.setProperty('--tilt',tilts[i%tilts.length]+'deg');
    card.style.setProperty('--rise',rise[i%rise.length]+'px');
    card.setAttribute('aria-label','Abrir '+label(p));
    const img=document.createElement('img');img.loading=i<4?'eager':'lazy';loadInto(img,p);
    const chip=document.createElement('span');chip.className='recent-chip';chip.textContent=p.numero==null?'S/N':'N.º '+p.numero;
    const cat=document.createElement('span');cat.className='recent-cat';cat.textContent=byName[p.seccion]||p.seccion;
    const name=document.createElement('span');name.className='recent-model';name.textContent=p.nombre;
    const code=document.createElement('span');code.className='recent-code';code.textContent=p.codigo;
    card.append(img,chip,cat,name,code);
    card.addEventListener('click',()=>open(p));
    track.appendChild(card);
  });
  viewport.scrollLeft=0;
  const c=seasons.filter(([key])=>deck.some(p=>p.seccion===key)).map(x=>x[1]);
  $('#recent-count').textContent=deck.length+' modelos destacados de '+c.join(', ');
  const labelEl=$('#recent-current-label');
  if(labelEl)labelEl.textContent='✦ '+deck.length+' fotografías para descubrir · Desliza o usa las flechas';
}
function moveGallery(direction){
  const viewport=$('#recent-viewport');
  if(!viewport||viewport.scrollWidth<=viewport.clientWidth+3)return;
  const card=$('#recent-track .recent-card');
  const step=(card?.getBoundingClientRect().width||330)+1;
  const limit=viewport.scrollWidth-viewport.clientWidth;
  const destination=viewport.scrollLeft+step*direction;
  const behavior=reduced?'auto':'smooth';
  if(direction>0&&viewport.scrollLeft>=limit-10)viewport.scrollTo({left:0,behavior});
  else if(direction<0&&viewport.scrollLeft<=10)viewport.scrollTo({left:limit,behavior});
  else viewport.scrollBy({left:step*direction,behavior});
}
function attachStage(){
  $('#recent-prev')?.addEventListener('click',()=>moveGallery(-1));
  $('#recent-next')?.addEventListener('click',()=>moveGallery(1));
  $('#how-open-cart')?.addEventListener('click',()=>$('#open-cart')?.click());
  const stage=$('#recent-viewport');
  stage?.addEventListener('keydown',e=>{
    if(e.target!==stage)return;
    if(e.key==='ArrowRight'){e.preventDefault();moveGallery(1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();moveGallery(-1);}
  });
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
