
/* Menú flotante con efecto parallax suave y tamaños adaptativos. */
(()=>{
'use strict';
const header=document.querySelector('.site-header');
if(!header)return;
const hero=document.querySelector('.hero');
const collections=document.querySelector('.collections-section');
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
const clamp=x=>Math.min(1,Math.max(0,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const val=(x)=>Math.round(x)+'px';
let queued=false;
let lastMobileMode=-1,lastMobileCompact=-1;
header.classList.add('gabys-parallax');
function paint(){
 queued=false;
 const y=Math.max(0,window.scrollY||document.documentElement.scrollTop||0);
 const isMobile=window.innerWidth<=780;
 // En móvil se compacta en un solo cambio animado, en lugar de recalcular 20 propiedades en cada pixel.
 const p=isMobile?(y>=120?1:0):(reduced.matches?(y>180?1:0):clamp(y/240));
 const small=window.innerWidth<=480;
 const tablet=window.innerWidth<=780&&!small;
 const sizes=small?
   {height:81,compact:66,bird:56,birdCompact:46,letter:74,letterCompact:59,gap:3}:
   tablet?{height:89,compact:72,bird:67,birdCompact:53,letter:89,letterCompact:69,gap:5}:
   {height:108,compact:79,bird:90,birdCompact:66,letter:104,letterCompact:78,gap:9};
 const set=(name,value)=>header.style.setProperty(name,value);
 set('--gp-height',val(lerp(sizes.height,sizes.compact,p)));
 set('--gp-bird',val(lerp(sizes.bird,sizes.birdCompact,p)));
 set('--gp-letter',val(lerp(sizes.letter,sizes.letterCompact,p)));
 set('--gp-brand-gap',val(lerp(sizes.gap,Math.max(2,sizes.gap-3),p)));
 set('--gp-padding',val(lerp(0,small?6:tablet?10:20,p)));
 set('--gp-radius',val(lerp(0,small?17:21,p)));
 set('--gp-shift',val(lerp(0,small?5:8,p)));
 set('--gp-blur',isMobile?'0px':val(lerp(0,22,p)));
 set('--gp-head-bg','rgba(250,248,246,'+(0.86*(1-p)).toFixed(3)+')');
 set('--gp-head-border','rgba(231,219,228,'+(0.7*(1-p)).toFixed(3)+')');
 set('--gp-panel-bg','rgba(255,251,254,'+(0.93*p).toFixed(3)+')');
 set('--gp-panel-border','rgba(235,201,222,'+(0.65*p).toFixed(3)+')');
 set('--gp-shadow','0 '+val(lerp(0,15,p))+' '+val(lerp(0,48,p))+' rgba(42,24,46,'+(0.15*p).toFixed(3)+')');
 set('--gp-glow',(p*.73).toFixed(3));
 set('--gp-links-shift',val(-1.5*p));
 set('--gp-links-alpha',(1-.055*p).toFixed(3));
 set('--gp-action-shift',val(-p));
 if(hero&&!reduced.matches&&!isMobile){
   hero.style.setProperty('--gp-hero-shift',val(Math.min(730,y)*.075));
 }
}
function schedule(){
 const width=window.innerWidth;
 const mobileMode=width<=480?0:width<=780?1:2;
 const compact=window.scrollY>=120?1:0;
 if(mobileMode!==2&&lastMobileMode===mobileMode&&lastMobileCompact===compact)return;
 lastMobileMode=mobileMode;lastMobileCompact=compact;
 if(!queued){queued=true;window.requestAnimationFrame(paint)}
}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
reduced.addEventListener?.('change',schedule);
schedule();
if(collections&&!reduced.matches&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){
   collections.querySelectorAll('.collection').forEach((card,i)=>{
    card.style.setProperty('--gp-stagger',Math.min(i,7)*55+'ms');
   });
   collections.classList.add('gp-arrived');
   observer.disconnect();
  }
 },{threshold:.1,rootMargin:'0px 0px -55px 0px'});
 observer.observe(collections);
}
})();
