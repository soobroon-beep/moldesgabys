
/* Escenas vectoriales originales y livianas: brujas y murciélagos, nieve, fuegos artificiales.
   Dibujadas con Canvas 2D, sin emojis, librerías ni imágenes de terceros. */
(()=>{'use strict';
 const supported=new Set(['halloween','navidad','patrias']);
 const body=document.body;
 const canvas=document.createElement('canvas');
 canvas.id='gabys-season-effects';canvas.setAttribute('aria-hidden','true');
 body.appendChild(canvas);
 const ctx=canvas.getContext('2d',{alpha:true});
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let theme='todos',w=0,h=0,dpr=1,elapsed=0,last=0,frame=null;
 // Pseudorandom estable: posiciones uniformes sin saltos entre fotogramas.
 function rand(i){let x=Math.sin(i*127.1+78.233)*43758.5453;return x-Math.floor(x)}
 const snow=Array.from({length:124},(_,i)=>({
   x:rand(i+10),y:rand(i+120),r:1+rand(i+210)*2.9,
   speed:18+rand(i+320)*54,drift:9+rand(i+430)*24,phase:rand(i+540)*Math.PI*2
 }));
 function resize(){
   w=window.innerWidth;h=window.innerHeight;
   dpr=Math.min(window.devicePixelRatio||1,1.75);
   canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));
   canvas.style.width=w+'px';canvas.style.height=h+'px';
   if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 function glow(x,y,r,rgb,alpha){
   const g=ctx.createRadialGradient(x,y,3,x,y,r);
   g.addColorStop(0,'rgba('+rgb+','+alpha+')');g.addColorStop(1,'rgba('+rgb+',0)');
   ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);
 }
 function bat(x,y,s,flap){
   ctx.save();ctx.translate(x,y);ctx.scale(s,s);
   const f=Math.sin(flap)*10;
   ctx.fillStyle='rgba(61,31,77,.63)';
   ctx.beginPath();
   ctx.moveTo(-2,2);
   ctx.bezierCurveTo(-11,-13-f,-22,-15-f,-34,-7-f);
   ctx.quadraticCurveTo(-26,0-f,-22,4-f*.3);
   ctx.quadraticCurveTo(-13,1-f*.3,-5,11);
   ctx.lineTo(0,5);
   ctx.quadraticCurveTo(13,1-f*.3,22,4-f*.3);
   ctx.quadraticCurveTo(26,0-f,34,-7-f);
   ctx.bezierCurveTo(22,-15-f,11,-13-f,2,2);
   ctx.lineTo(0,-4);ctx.closePath();ctx.fill();
   ctx.restore();
 }
 function witch(x,y,s,t){
   ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*.45)*.065);ctx.scale(s,s);
   // Broom, highlighted straw and curled ends
   ctx.lineCap='round';ctx.strokeStyle='rgba(76,44,79,.85)';ctx.lineWidth=5;
   ctx.beginPath();ctx.moveTo(-75,19);ctx.quadraticCurveTo(8,9,76,17);ctx.stroke();
   ctx.strokeStyle='rgba(221,141,80,.82)';ctx.lineWidth=2;
   for(let i=0;i<9;i++){ctx.beginPath();ctx.moveTo(48,16);ctx.quadraticCurveTo(65,9+(i-4)*2.7,83+(i%2)*5,8+(i-4)*4);ctx.stroke()}
   // Hair and body in dark translucent silhouette
   ctx.fillStyle='rgba(67,30,82,.83)';
   ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(-18,8,-22,37);ctx.quadraticCurveTo(2,29,17,24);ctx.quadraticCurveTo(15,3,12,-10);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.arc(7,-18,10,0,Math.PI*2);ctx.fill();
   ctx.beginPath();ctx.moveTo(-11,-27);ctx.lineTo(10,-60);ctx.quadraticCurveTo(19,-46,26,-29);ctx.closePath();ctx.fill();
   ctx.beginPath();ctx.moveTo(-24,-27);ctx.quadraticCurveTo(5,-18,37,-26);ctx.lineTo(36,-18);ctx.quadraticCurveTo(3,-11,-25,-19);ctx.closePath();ctx.fill();
   // Wind-blown cape, long scarf, legs
   ctx.strokeStyle='rgba(68,32,83,.78)';ctx.lineWidth=6;
   ctx.beginPath();ctx.moveTo(7,19);ctx.lineTo(32,31);ctx.lineTo(44,30);ctx.moveTo(1,21);ctx.lineTo(28,40);ctx.lineTo(43,42);ctx.stroke();
   ctx.strokeStyle='rgba(200,118,165,.64)';ctx.lineWidth=3;
   ctx.beginPath();ctx.moveTo(-9,-4);ctx.quadraticCurveTo(-38,-4,-54,-21);ctx.stroke();
   ctx.restore();
 }
 function halloween(t){
   glow(w*.08,h*.23,170,'239,124,51',.11);
   glow(w*.92,h*.68,195,'169,91,203',.13);
   const shift=Math.sin(t*.31);
   witch(w*.11+shift*8,h*.27+Math.sin(t*.6)*13,Math.min(1.1,w/1250),t);
   witch(w*.91-shift*6,h*.70+Math.sin(t*.75+2)*14,Math.min(.87,w/1450),t+2);
   for(let i=0;i<17;i++){
     const side=i%2===0?1:0;
     const x=(side?w*.09:w*.91)+Math.sin(t*.24+i*2.4)*w*.067;
     const y=((i*.17+t*(.018+rand(i+600)*.016))%1.25)*h-35;
     bat(x,y,.32+rand(i+800)*.60,t*2.6+i*.8);
   }
   for(let i=0;i<16;i++){
     const x=(i%2?w*.025:w*.975)+(rand(i+900)-.5)*w*.13;
     const y=(rand(i+920)+t*(.012+rand(i+930)*.011))%1*h;
     ctx.fillStyle='rgba(253,158,103,'+(.12+rand(i+940)*.2)+')';
     ctx.beginPath();ctx.arc(x,y,1+rand(i+950)*2,0,Math.PI*2);ctx.fill();
   }
 }
 function snowflake(x,y,r,alpha){
   ctx.save();ctx.translate(x,y);ctx.globalAlpha=alpha;
   ctx.strokeStyle='#fff';ctx.lineCap='round';ctx.lineWidth=Math.max(.65,r*.32);
   for(let i=0;i<3;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.stroke()}
   ctx.restore();
 }
 function winter(t){
   glow(w*.1,h*.18,220,'188,221,255',.14);
   glow(w*.91,h*.7,255,'222,233,255',.16);
   for(let i=0;i<snow.length;i++){
     const p=snow[i],x=p.x*w+Math.sin(t*.55+p.phase)*p.drift+t*7,
           y=((p.y*h+t*p.speed)%(h+50))-25;
     const center=Math.abs(x-w/2)<w*.27;
     const alpha=(center?.11:.36)*(0.45+rand(i+1200)*.6);
     if(i%13===0)snowflake(x,y,p.r*2.3,alpha*1.7);
     else {
       ctx.fillStyle='rgba(247,252,255,'+alpha+')';
       ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
     }
   }
   for(let i=0;i<12;i++){
     const x=(i%2?w*.085:w*.915)+Math.sin(i*3+t*.4)*28;
     const y=((i*.16+t*.045)%1.12)*h;
     ctx.fillStyle='rgba(237,246,255,.22)';
     ctx.beginPath();ctx.arc(x,y,2+rand(i+1800)*4,0,Math.PI*2);ctx.fill();
   }
 }
 function fireworks(t){
   const coords=[[.09,.19],[.92,.28],[.12,.73],[.90,.80],[.04,.46],[.96,.58]];
   const palette=['#46c887','#f76b70','#f8d596','#f5faf1','#91dcc0','#fca0a0'];
   for(let i=0;i<coords.length;i++){
     const phase=((t/3.4+i*.20)%1),ease=1-Math.pow(1-phase,2.1);
     const [px,py]=coords[i];const x=px*w,y=py*h;
     if(phase<.10){glow(x,y,55,'243,208,125',.08);continue}
     const opacity=Math.min(1,(phase-.1)*8)*Math.pow(1-phase,.8)*.38;
     const n=20,r=15+ease*(40+i%3*15);
     ctx.save();ctx.translate(x,y);ctx.rotate(i*2.43);ctx.globalAlpha=opacity;
     for(let j=0;j<n;j++){
       const a=j/n*Math.PI*2;
       const c=palette[(j+i)%palette.length];
       const x1=Math.cos(a)*r*.72,y1=Math.sin(a)*r*.72;
       const x2=Math.cos(a)*r,y2=Math.sin(a)*r;
       ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.lineCap='round';
       ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
       if(j%3===0){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x2,y2,1.5,0,Math.PI*2);ctx.fill()}
     }
     ctx.restore();
   }
   glow(w*.10,h*.3,160,'55,174,105',.09);
   glow(w*.91,h*.63,180,'239,98,104',.09);
 }
 function paint(ms){
   frame=requestAnimationFrame(paint);
   if(!ctx||theme==='todos'||document.hidden||w===0)return;
   if(ms-last<36)return;last=ms;elapsed=ms/1000;
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   if(theme==='halloween')halloween(elapsed);
   else if(theme==='navidad')winter(elapsed);
   else if(theme==='patrias')fireworks(elapsed);
 }
 function renderStill(){
   if(!ctx)return;
   ctx.clearRect(0,0,w,h);
   if(theme==='halloween')halloween(2);
   else if(theme==='navidad')winter(2);
   else if(theme==='patrias')fireworks(2);
 }
 function setSeason(value){
   theme=supported.has(value)?value:'todos';
   body.dataset.gabysSeason=theme;
   ctx?.clearRect(0,0,w,h);
   if(motion.matches)renderStill();
 }
 window.GABYS_SET_SEASON=setSeason;
 window.addEventListener('gabys:season-change',e=>setSeason(e.detail?.season));
 window.addEventListener('resize',()=>{resize();if(motion.matches)renderStill()},{passive:true});
 window.addEventListener('pagehide',()=>{if(frame)cancelAnimationFrame(frame)});
 motion.addEventListener?.('change',()=>{last=0;if(motion.matches)renderStill()});
 resize();setSeason('todos');
 if(!motion.matches)frame=requestAnimationFrame(paint);
})();
