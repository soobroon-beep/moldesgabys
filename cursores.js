
/* Cursores ilustrados por temporada; solo dispositivos con ratón. */
(()=>{
'use strict';
if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
const emojis={halloween:'🕷️',navidad:'❄️',amor:'💗',bebes:'🍼',bano:'🛁','toda-ocasion':'✂️'};
const cache={};
function drawSombrero(ctx){
 ctx.save();ctx.lineWidth=2;ctx.strokeStyle='#3c251b';
 ctx.fillStyle='#9e622c';ctx.beginPath();ctx.ellipse(32,43,28,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.moveTo(19,39);ctx.quadraticCurveTo(24,34,24,25);ctx.lineTo(25,18);ctx.quadraticCurveTo(31,10,38,17);ctx.lineTo(43,31);ctx.quadraticCurveTo(40,36,46,39);ctx.closePath();ctx.fillStyle='#b97a38';ctx.fill();ctx.stroke();
 ctx.fillStyle='#3e2723';ctx.fillRect(23,33,22,6);ctx.fillStyle='#da4350';ctx.beginPath();ctx.arc(34,36,3,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#f4c878';ctx.beginPath();ctx.moveTo(11,43);ctx.quadraticCurveTo(32,49,53,43);ctx.stroke();ctx.restore();
}
function png(key){
 if(cache[key])return cache[key];
 const c=document.createElement('canvas');c.width=64;c.height=64;
 const x=c.getContext('2d');if(!x)return '';
 if(key==='patrias')drawSombrero(x);
 else{ x.font='44px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  x.textAlign='center';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.3)';x.shadowBlur=3;x.fillText(emojis[key],32,33); }
 return cache[key]=c.toDataURL('image/png');
}
function update(){
 const key=document.body.dataset.gabysSeason;
 const active=key==='patrias'||Boolean(emojis[key]);
 document.body.classList.toggle('gabys-cursor-active',active);
 if(!active){document.body.style.removeProperty('--gabys-season-cursor');return;}
 const url=png(key);if(url)document.body.style.setProperty('--gabys-season-cursor','url("'+url+'") 30 30, auto');
}
new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-gabys-season']});
update();
})();
