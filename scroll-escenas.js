/* Moldes Gaby's · ScrollExpand nativo + apariciones al entrar al viewport.
   Sin bibliotecas externas, sin bloques añadidos ni desplazamientos artificiales. */
(()=>{
'use strict';
const body=document.body;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
if(reduced.matches)return;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const x=clamp(v);return x*x*(3-2*x)};
const gallery=document.querySelector('#ultimos-modelos .recent-gallery');
const recent=document.getElementById('ultimos-modelos');
const collections=document.getElementById('colecciones');
const how=document.getElementById('comprar');
const grid=document.getElementById('product-grid');
let revealObserver=null;
if('IntersectionObserver' in window){
 revealObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(!entry.isIntersecting)continue;
     entry.target.classList.add('gs-visible');
     revealObserver.unobserve(entry.target);
   }
 },{rootMargin:'0px 0px 50px 0px',threshold:.07});
}
const choices=['up','left','right','zoom'];
function register(node,type='up',order=0){
 if(!node||!revealObserver||node.classList.contains('gs-reveal'))return;
 node.dataset.gsMotion=type;
 node.style.setProperty('--gs-delay',Math.min(order,6)*50+'ms');
 node.classList.add('gs-reveal');
 const box=node.getBoundingClientRect(),view=window.innerHeight;
 // Elementos ya visibles no desaparecen cuando empieza el script.
 if(box.top<view*.91&&box.bottom>0)node.classList.add('gs-visible');
 else revealObserver.observe(node);
}
function registerStatic(){
 [
  ['#ultimos-modelos .recent-heading-copy','left'],
  ['#ultimos-modelos .recent-controls','right'],
  ['#ultimos-modelos .recent-foot','up'],
  ['#catalogo .catalog-count','zoom'],
  ['#catalogo .catalog-bar','left'],
  ['#catalogo .catalog-toolbar','right']
 ].forEach(([selector,type])=>register(document.querySelector(selector),type));
 document.querySelectorAll('#comprar .how-grid>article').forEach((el,i)=>register(el,choices[i%choices.length],i));
 document.querySelectorAll('footer .footer-main>.footer-brand,footer .footer-main>.footer-links,footer .footer-main>.footer-contact')
 .forEach((el,i)=>register(el,choices[(i+1)%choices.length],i));
}
function registerProducts(){
 if(!grid)return;
 grid.querySelectorAll('.product-card:not(.gs-reveal)').forEach((node,i)=>{
   register(node,choices[i%choices.length],i%6);
 });
}
registerStatic();
registerProducts();
body.classList.add('gs-motion-ready');
if(grid&&revealObserver&&'MutationObserver'in window){
 const updates=new MutationObserver(records=>{
   if(records.some(r=>r.addedNodes.length))registerProducts();
 });
 updates.observe(grid,{childList:true});
}
let current=0,target=0,animFrame=0,measureFrame=0;
function progressFor(el,start=.94,distance=.66){
 if(!el)return 1;
 const r=el.getBoundingClientRect();
 return clamp((window.innerHeight*start-r.top)/(window.innerHeight*distance));
}
function measure(){
 // Solo se recalcula cuando hay desplazamiento/resize.
 target=progressFor(recent,.93,.66);
 if(!animFrame)animFrame=requestAnimationFrame(tick);
}
function apply(p){
 const e=smooth(p);
 if(gallery){
   gallery.style.setProperty('--gs-expand-inset',(6*(1-e)).toFixed(2)+'%');
   gallery.style.setProperty('--gs-expand-radius',(32*(1-e)).toFixed(1)+'px');
   gallery.style.setProperty('--gs-expand-scale',(.965+.035*e).toFixed(4));
   gallery.style.setProperty('--gs-star-opacity',(.48+.52*e).toFixed(3));
   gallery.style.setProperty('--gs-paint-opacity',(.35+.40*e).toFixed(3));
 }
 if(collections){
   const s=smooth(progressFor(collections,.96,.83));
   const list=collections.querySelector('.collection-grid');
   if(list){
     list.style.setProperty('--gs-collection-lift',((1-s)*15).toFixed(1)+'px');
     list.style.setProperty('--gs-collection-opacity',(.78+.22*s).toFixed(3));
   }
 }
 if(how){
   const s=smooth(progressFor(how,.95,.8));
   const content=how.querySelector('.how-grid');
   if(content)content.style.setProperty('--gs-how-lift',((1-s)*18).toFixed(1)+'px');
 }
}
function tick(){
 animFrame=0;
 current+=(target-current)*.19;
 if(Math.abs(target-current)<.002)current=target;
 apply(current);
 if(current!==target)animFrame=requestAnimationFrame(tick);
}
function schedule(){
 // Una sola lectura de layout por frame; no se pierden eventos al desplazar.
 if(!measureFrame)measureFrame=requestAnimationFrame(()=>{
   measureFrame=0;
   measure();
 });
}
window.addEventListener('scroll',schedule,{passive:true});
window.addEventListener('resize',schedule,{passive:true});
window.addEventListener('pageshow',schedule);
reduced.addEventListener?.('change',()=>{
 if(reduced.matches){
   body.classList.remove('gs-motion-ready');
   document.querySelectorAll('.gs-reveal').forEach(node=>node.classList.add('gs-visible'));
   if(animFrame)cancelAnimationFrame(animFrame);
   if(measureFrame)cancelAnimationFrame(measureFrame);
   animFrame=0;measureFrame=0;
 }else{body.classList.add('gs-motion-ready');measure();}
});
const first=progressFor(recent,.93,.66);
current=target=first;
apply(first);
})();
