/* Tutoriales oficiales de Moldes Gaby's.
   Para agregar videos en el futuro, añadir una entrada a esta lista. */
(()=>{
'use strict';
const section=document.getElementById('tutoriales');
const player=document.getElementById('tutorial-player');
const poster=document.getElementById('tutorial-play');
const list=document.getElementById('tutorial-video-list');
const currentTitle=document.getElementById('tutorial-current-title');
const currentSubtitle=document.getElementById('tutorial-current-subtitle');
const original=document.getElementById('tutorial-original');
if(!section||!player||!poster||!list||!currentTitle||!original)return;
const videos=[
 {id:'kzHimwiRCeI',title:'Santa en chimenea con pingüino y regalo · Modelo 1107',short:'Santa en chimenea con pingüino y regalo',category:'NAVIDAD · MODELO 1107'},
 {id:'gYDyHi9KcY8',title:'Catrina con vestido de mariposas',short:'Catrina con vestido de mariposas',category:'DÍA DE MUERTOS'},
 {id:'AALeyCAbkF4',title:'Catrina Monarca · Modelo 283',short:'Catrina Monarca',category:'DÍA DE MUERTOS · MODELO 283'}
];
const youtubeIdPattern=/^[A-Za-z0-9_-]{11}$/;
const thumb=id=>'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
const url=id=>'https://www.youtube.com/watch?v='+id;
const reduced=window.matchMedia('(prefers-reduced-motion:reduce)');
const posterImage=poster.querySelector('img');
let selected=videos[0],playing=false,observer=null;
function selectUi(){
 list.querySelectorAll('button[data-video-id]').forEach(button=>{
  const isSelected=button.dataset.videoId===selected.id;
  button.setAttribute('aria-pressed',String(isSelected));
  button.closest('.tutorial-card')?.classList.toggle('is-selected',isSelected);
 });
 currentTitle.textContent=selected.title;
 currentSubtitle.textContent='Tutorial del canal oficial de Moldes Gaby’s';
 original.href=url(selected.id);
 original.setAttribute('aria-label','Ver '+selected.short+' directamente en YouTube');
 poster.setAttribute('aria-label','Reproducir '+selected.short);
 if(posterImage){
  posterImage.src=thumb(selected.id);
  posterImage.alt='Vista previa: '+selected.short;
 }
}
function stopPlayer(){
 player.querySelector('iframe')?.remove();
 poster.hidden=false;
 playing=false;
}
function play(muted=true){
 if(!youtubeIdPattern.test(selected.id))return;
 stopPlayer();
 const frame=document.createElement('iframe');
 frame.title='Tutorial de Gaby’s: '+selected.short;
 frame.loading='eager';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';
 frame.allowFullscreen=true;
 // YouTube y los navegadores deciden si permiten autoplay. Muted es
 // la opción compatible con la mayoría de dispositivos móviles.
 const options=new URLSearchParams({
  autoplay:'1',mute:muted?'1':'0',playsinline:'1',
  rel:'0',controls:'1',modestbranding:'1'
 });
 frame.src='https://www.youtube-nocookie.com/embed/'+selected.id+'?'+options.toString();
 player.appendChild(frame);
 poster.hidden=true;
 playing=true;
}
function selectVideo(video,fromClick){
 if(!video||!youtubeIdPattern.test(video.id))return;
 selected=video;
 selectUi();
 if(fromClick){
  // La selección explícita reemplaza el video actual y lo inicia silencioso.
  play(true);
  player.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'center'});
 }
}
function renderList(){
 const fragment=document.createDocumentFragment();
 videos.forEach(video=>{
  const card=document.createElement('article');
  card.className='tutorial-card'+(video.id===selected.id?' is-selected':'');
  const button=document.createElement('button');
  button.type='button';
  button.className='tutorial-card-select';
  button.dataset.videoId=video.id;
  button.setAttribute('aria-pressed',String(video.id===selected.id));
  button.setAttribute('aria-label','Reproducir '+video.short);
  const imageWrap=document.createElement('span');
  imageWrap.className='tutorial-card-thumb';
  const image=document.createElement('img');
  image.src=thumb(video.id);
  image.alt='Vista previa: '+video.short;
  image.loading='lazy';image.decoding='async';
  const playSymbol=document.createElement('span');
  playSymbol.className='tutorial-thumb-play';
  playSymbol.setAttribute('aria-hidden','true');
  playSymbol.textContent='▶';
  imageWrap.append(image,playSymbol);
  const info=document.createElement('span');
  info.className='tutorial-card-info';
  const category=document.createElement('small');
  category.textContent=video.category;
  const title=document.createElement('strong');
  title.textContent=video.short;
  const caption=document.createElement('span');
  caption.textContent='Ver tutorial en el reproductor ↗';
  info.append(category,title,caption);
  button.append(imageWrap,info);
  button.addEventListener('click',()=>selectVideo(video,true));
  card.appendChild(button);
  fragment.appendChild(card);
 });
 list.appendChild(fragment);
}
renderList();selectUi();
poster.addEventListener('click',()=>play(true));
if('IntersectionObserver' in window){
 observer=new IntersectionObserver(entries=>{
  const active=entries.some(entry=>entry.isIntersecting);
  if(active&&!playing)play(true);
  if(!active&&playing)stopPlayer();
 },{threshold:0,rootMargin:'0px 0px 80px 0px'});
 observer.observe(section);
}
// Abre automáticamente el tutorial al elegir la nueva pestaña,
 // sin cargar YouTube mientras la persona navega por los moldes.
document.querySelectorAll('a[href="#tutoriales"]').forEach(link=>{
 link.addEventListener('click',()=>{if(!playing)play(true)});
});
document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&playing)stopPlayer();
});
})();