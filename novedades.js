
/* Portada de temporadas y carrusel de últimos modelos. No inventa colecciones vacías. */
(()=>{'use strict';
  const $=sel=>document.querySelector(sel);
  const all=()=>window.GABYS_TIENDA?.obtenerModelos?.()||window.GABYS_CATALOGO||[];
  const seasons=[
    ['navidad','Navidad'],['halloween','Halloween'],['dia-muertos','Día de Muertos'],
    ['patrias','Fiestas Patrias'],['amor','San Valentín'],['bebes','Bebés'],
    ['cocina','Cocina'],['toda-ocasion','Toda ocasión']
  ];
  const byName=Object.fromEntries(seasons);
  const dateOf=p=>{
    const text=p.fechaPublicacion||p.fechaActualizacion||p.actualizado||p.fecha||'';
    const ms=Date.parse(text);
    return Number.isFinite(ms)?ms:0;
  };
  const byNewest=(a,b)=>dateOf(b)-dateOf(a)||(Number(b.numero??-1)-Number(a.numero??-1))||String(b.archivo||'').localeCompare(String(a.archivo||''),'es');
  const latest=(key,limit=5)=>all().filter(p=>p.seccion===key).sort(byNewest).slice(0,limit);
  const photo=p=>p.id?'images/'+encodeURIComponent(p.codigo)+'.webp':(p.imagen||'');
  const photoFallback=(img,p)=>{
    const next=(Number(img.dataset.fallback||0)+1);
    img.dataset.fallback=String(next);
    if(p.id&&next===1)img.src='https://lh3.googleusercontent.com/d/'+encodeURIComponent(p.id)+'=w800';
    else if(p.id&&next===2)img.src='https://drive.google.com/thumbnail?id='+encodeURIComponent(p.id)+'&sz=w800';
    else {img.onerror=null;img.style.opacity='.4';img.alt='Vista previa no disponible';}
  };
  function addPhoto(img,p){img.dataset.fallback='0';img.onerror=()=>photoFallback(img,p);img.alt=(byName[p.seccion]||'Fieltro')+': '+p.nombre;img.src=photo(p);}
  const open=p=>{if(window.GABYS_TIENDA?.abrirModelo)window.GABYS_TIENDA.abrirModelo(p.codigo)};
  let marqueeTimer=null,heroTimer=null,paused=false,hasHover=false;
  function drawRecent(){
    const section=$('#ultimos-modelos'),target=$('#recent-track'),viewport=$('#recent-viewport');
    if(!section||!target||!viewport)return;
    const groups=seasons.map(([key])=>({key,models:latest(key)})).filter(g=>g.models.length);
    if(!groups.length){section.hidden=true;return;}section.hidden=false;target.replaceChildren();
    for(const g of groups)for(const p of g.models){
      const card=document.createElement('button');card.type='button';card.className='recent-card';card.title='Ver '+p.codigo;
      const im=document.createElement('img');im.loading='lazy';im.decoding='async';addPhoto(im,p);
      const chip=document.createElement('span');chip.className='recent-chip';chip.textContent=p.numero==null?'S/N':'#'+p.numero;
      const cat=document.createElement('span');cat.className='recent-cat';cat.textContent=byName[g.key]||g.key;
      const name=document.createElement('span');name.className='recent-model';name.textContent=p.nombre||'Modelo de fieltro';
      const code=document.createElement('span');code.className='recent-code';code.textContent=p.codigo;
      card.append(im,chip,cat,name,code);card.addEventListener('click',()=>open(p));target.append(card);
    }
    $('#recent-count').textContent=groups.length+' colecciones · '+target.children.length+' modelos para descubrir';
    viewport.scrollLeft=0;
  }
  function move(direction=1){
    const viewport=$('#recent-viewport'),card=$('.recent-card');
    if(!viewport||!card)return;
    const step=card.getBoundingClientRect().width+15;
    const max=viewport.scrollWidth-viewport.clientWidth;
    if(max<3)return;
    const next=viewport.scrollLeft+direction*step;
    if(next>=max-5)viewport.scrollTo({left:0,behavior:'smooth'});
    else if(next<0)viewport.scrollTo({left:max,behavior:'smooth'});
    else viewport.scrollBy({left:direction*step,behavior:'smooth'});
  }
  function fillHero(){
    const keys=['navidad','halloween','patrias'].filter(key=>latest(key,1).length);
    if(!keys.length)return;
    let offset=0;
    const frames=()=>{
      const chosen=[],seen=new Set();
      for(const key of keys){
        const p=latest(key,8)[offset%Math.min(latest(key,8).length,8)];
        if(p&&!seen.has(p.codigo)){chosen.push(p);seen.add(p.codigo);}
      }
      let next=0;
      while(chosen.length<3&&next<24){
        const key=keys[next%keys.length],group=latest(key,14);
        const p=group[(offset+Math.floor(next/keys.length)+1)%group.length];next++;
        if(p&&!seen.has(p.codigo)){chosen.push(p);seen.add(p.codigo);}
      }
      const selectors=['#hero-photo','#hero-photo-left','#hero-photo-right'];
      selectors.forEach((selector,i)=>{
        const img=$(selector),p=chosen[i];if(!img||!p)return;
        const frame=img.closest('.hero-photo');
        if(frame){frame.setAttribute('role','button');frame.tabIndex=0;frame.setAttribute('aria-label','Abrir '+(byName[p.seccion]||p.seccion)+' '+p.codigo);frame.onclick=()=>open(p);frame.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(p)}};}
        img.style.opacity='.3';img.style.transition='opacity .55s ease';
        img.onload=()=>{img.style.opacity='1'};
        addPhoto(img,p);
      });
    };
    frames();
    if(heroTimer)clearInterval(heroTimer);
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      heroTimer=setInterval(()=>{if(document.hidden)return;offset++;frames();},9000);
    }
  }
  function setup(){
    drawRecent();fillHero();
    $('#recent-prev')?.addEventListener('click',()=>move(-1));
    $('#recent-next')?.addEventListener('click',()=>move(1));
    const pauseBtn=$('#recent-pause');
    pauseBtn?.addEventListener('click',()=>{paused=!paused;pauseBtn.setAttribute('aria-pressed',String(paused));pauseBtn.setAttribute('aria-label',paused?'Reanudar carrusel':'Pausar carrusel');pauseBtn.textContent=paused?'▶':'Ⅱ'});
    const viewport=$('#recent-viewport');
    viewport?.addEventListener('mouseenter',()=>hasHover=true);
    viewport?.addEventListener('mouseleave',()=>hasHover=false);
    viewport?.addEventListener('focusin',()=>hasHover=true);
    viewport?.addEventListener('focusout',e=>{if(!viewport.contains(e.relatedTarget))hasHover=false});
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      marqueeTimer=setInterval(()=>{if(!paused&&!hasHover&&!document.hidden)move(1)},5000);
    }
    window.addEventListener('gabys:catalogo-actualizado',()=>{drawRecent();fillHero()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
