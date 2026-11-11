/* Escenas refinadas por temporada.
   - Halloween: brujas vectoriales estilizadas, murciélagos y neblina.
   - Navidad: nieve en capas, copos grandes y destellos fríos.
   - Fiestas patrias: fuegos artificiales suaves.
   - Se desvanecen al bajar por la página. */
(()=>{'use strict';
  const supported = new Set(['halloween','navidad','patrias']);
  const body = document.body;
  let canvas = document.getElementById('gabys-season-effects');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.id = 'gabys-season-effects';
    canvas.setAttribute('aria-hidden','true');
    body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d',{alpha:true});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let theme='todos', w=0, h=0, dpr=1, last=0, raf=0;
  let fadeFactor = 1;
  const snow = [];
  const bats = [];
  const witchTrail = [];
  const fireworks = [];

  function rand(seed){ const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123; return x - Math.floor(x); }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  function resize(){
    w = window.innerWidth; h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    seedParticles();
    updateFade();
  }

  function seedParticles(){
    snow.length=0; bats.length=0; witchTrail.length=0; fireworks.length=0;
    for(let i=0;i<150;i++){
      snow.push({
        x: rand(i+11), y: rand(i+101), r: 1.6 + rand(i+201)*6,
        speed: 10 + rand(i+301)*55, drift: 10 + rand(i+401)*42,
        sway: rand(i+501)*Math.PI*2, layer: i%3
      });
    }
    for(let i=0;i<18;i++){
      bats.push({ side: i%2, phase: rand(i+701)*Math.PI*2, speed: .04 + rand(i+801)*.05, y: .08 + rand(i+901)*.8, s: .48 + rand(i+1001)*.7 });
    }
    for(let i=0;i<16;i++){
      witchTrail.push({ side: i%2, phase: rand(i+1101)*Math.PI*2, y: .1 + rand(i+1201)*.7, scale:.7 + rand(i+1301)*.6 });
    }
    const points = [[.08,.18],[.91,.26],[.10,.71],[.92,.78],[.05,.47],[.96,.58]];
    for(let i=0;i<points.length;i++){
      fireworks.push({x:points[i][0], y:points[i][1], delay:i*.62, hue:i%3});
    }
  }

  function updateFade(){
    // El efecto se mantiene en el catálogo y se apaga al volver a portada,
    // últimos modelos o al llegar a las instrucciones finales.
    const catalog=document.getElementById('catalogo');
    if(!catalog){fadeFactor=0;return;}
    const rect=catalog.getBoundingClientRect();
    const topZone=Math.min(140,h*.19),bottomZone=h*.87;
    const overlap=Math.max(0,Math.min(rect.bottom,bottomZone)-Math.max(rect.top,topZone));
    const towardTop=clamp((bottomZone-rect.top)/(h*.44),0,1);
    const towardBottom=clamp((rect.bottom-topZone)/(h*.44),0,1);
    fadeFactor=clamp(Math.min(towardTop,towardBottom)*Math.min(1,overlap/(h*.24)),0,1);
    body.style.setProperty('--gabys-season-opacity',String((supported.has(theme)?fadeFactor:0).toFixed(3)));
  }

  function clear(){ ctx.clearRect(0,0,w,h); }
  function glow(x,y,r,c,a){
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0, `rgba(${c},${a})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g; ctx.fillRect(x-r,y-r,r*2,r*2);
  }

  function drawBat(x,y,s,flap){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(s,s);
    const wing = 8 + Math.sin(flap) * 7;
    const grad = ctx.createLinearGradient(-34,0,34,0);
    grad.addColorStop(0,'rgba(53,28,67,.78)');
    grad.addColorStop(.5,'rgba(86,40,94,.72)');
    grad.addColorStop(1,'rgba(53,28,67,.78)');
    ctx.fillStyle = grad;
    ctx.strokeStyle = 'rgba(255,196,140,.08)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.bezierCurveTo(-10,-7,-18,-wing,-34,-6);
    ctx.quadraticCurveTo(-24,-1,-21,8);
    ctx.quadraticCurveTo(-12,1,-2,9);
    ctx.quadraticCurveTo(12,1,21,8);
    ctx.quadraticCurveTo(24,-1,34,-6);
    ctx.bezierCurveTo(18,-wing,10,-7,0,0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawWitch(x,y,s,t){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(Math.sin(t*.7)*.06);
    ctx.scale(s,s);

    // broom glow
    ctx.strokeStyle='rgba(255,178,96,.34)';
    ctx.lineWidth=10;
    ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-80,18); ctx.quadraticCurveTo(-12,12,80,18); ctx.stroke();

    // broom wood
    ctx.strokeStyle='rgba(91,56,73,.92)';
    ctx.lineWidth=4.5;
    ctx.beginPath(); ctx.moveTo(-80,18); ctx.quadraticCurveTo(-12,12,79,18); ctx.stroke();

    // straw
    ctx.strokeStyle='rgba(243,169,92,.92)';
    ctx.lineWidth=1.8;
    for(let i=0;i<11;i++){
      ctx.beginPath();
      ctx.moveTo(54,17);
      ctx.quadraticCurveTo(68, 9 + (i-5)*2.5, 90 + (i%3)*2, 4 + (i-5)*3.6);
      ctx.stroke();
    }

    // cape shadow
    const cape = ctx.createLinearGradient(-10,-40,40,45);
    cape.addColorStop(0,'rgba(76,31,82,.86)');
    cape.addColorStop(1,'rgba(110,52,101,.58)');
    ctx.fillStyle = cape;
    ctx.beginPath();
    ctx.moveTo(-20,-2);
    ctx.quadraticCurveTo(-34,20,-24,42);
    ctx.quadraticCurveTo(2,40,20,26);
    ctx.quadraticCurveTo(25,10,12,-12);
    ctx.closePath();
    ctx.fill();

    // head and hat
    ctx.fillStyle='rgba(82,41,84,.88)';
    ctx.beginPath(); ctx.arc(6,-18,9.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-11,-26); ctx.lineTo(7,-57); ctx.quadraticCurveTo(22,-44,28,-28); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-23,-28); ctx.quadraticCurveTo(8,-20,39,-27); ctx.lineTo(36,-19); ctx.quadraticCurveTo(8,-13,-26,-19); ctx.closePath(); ctx.fill();

    // scarf/ribbon
    ctx.strokeStyle='rgba(217,132,176,.62)';
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(-9,-2); ctx.quadraticCurveTo(-35,-4,-58,-23); ctx.stroke();

    // legs + shoes
    ctx.strokeStyle='rgba(82,38,76,.9)'; ctx.lineWidth=4.2;
    ctx.beginPath();
    ctx.moveTo(4,20); ctx.lineTo(31,36); ctx.lineTo(46,35);
    ctx.moveTo(-1,22); ctx.lineTo(24,44); ctx.lineTo(42,45);
    ctx.stroke();

    ctx.restore();
  }

  function drawSnowflake(x,y,r,a,rot){
    ctx.save();
    ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1, r*.14);
    for(let k=0;k<3;k++){
      ctx.rotate(Math.PI/3);
      ctx.beginPath(); ctx.moveTo(-r,0); ctx.lineTo(r,0); ctx.stroke();
      for(const sign of [-1,1]){
        ctx.beginPath();
        ctx.moveTo(sign*r*.42,0);
        ctx.lineTo(sign*r*.60, r*.18);
        ctx.moveTo(sign*r*.42,0);
        ctx.lineTo(sign*r*.60, -r*.18);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function halloween(t){
    glow(w*.12,h*.18,150,'255,155,81',.12*fadeFactor);
    glow(w*.90,h*.26,170,'171,115,255',.12*fadeFactor);
    glow(w*.87,h*.72,200,'120,79,199',.10*fadeFactor);

    for(let i=0;i<witchTrail.length;i++){
      const p = witchTrail[i];
      const progress = (t*.034 + p.phase + i*.031) % 1;
      const side = p.side===0 ? .10 : .90;
      const drift = p.side===0 ? progress * .11 : -progress * .11;
      const x = (side + drift) * w;
      const y = p.y * h + Math.sin(t + i*1.2) * 18;
      const alpha = (.28 + (1-progress)*.3) * fadeFactor;
      ctx.globalAlpha = alpha;
      drawWitch(x,y,p.scale * (1.02 - progress*.24), t + i);
      ctx.globalAlpha = 1;
    }

    for(let i=0;i<bats.length;i++){
      const b = bats[i];
      const progress = (t*b.speed + b.phase) % 1;
      const edge = b.side===0 ? .03 : .97;
      const dir = b.side===0 ? 1 : -1;
      const x = (edge + dir*(.12 + progress*.12) + Math.sin(t*.8+i)*.01) * w;
      const y = b.y*h + Math.sin(t*1.4 + i*2.2) * 22;
      ctx.globalAlpha = (.25 + (1-progress)*.45) * fadeFactor;
      drawBat(x,y,b.s, t*6 + i*1.7);
      ctx.globalAlpha = 1;
    }

    // floating dust
    for(let i=0;i<26;i++){
      const x = ((rand(i+1) + t*.007*(i%2?1:-1)) % 1) * w;
      const y = ((rand(i+31) + t*.011) % 1) * h;
      const r = 1 + rand(i+61)*2.8;
      ctx.fillStyle = `rgba(255,188,118,${(.08 + rand(i+91)*.16) * fadeFactor})`;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
  }

  function navidad(t){
    glow(w*.12,h*.17,180,'195,224,255',.12*fadeFactor);
    glow(w*.88,h*.14,180,'230,242,255',.16*fadeFactor);
    glow(w*.90,h*.68,200,'201,221,255',.12*fadeFactor);

    for(let i=0;i<snow.length;i++){
      const p = snow[i];
      const speedMul = p.layer===0 ? 1.4 : p.layer===1 ? 1 : .76;
      const x = p.x*w + Math.sin(t*.7 + p.sway)*p.drift;
      const y = ((p.y*h + t*p.speed*speedMul) % (h + 70)) - 35;
      const center = Math.abs(x - w/2) < w*.28;
      const a = (center ? .10 : .46) * (p.layer===0 ? .9 : 1.15) * fadeFactor;
      if(i % 9 === 0 || p.r > 5.2){
        drawSnowflake(x,y,p.r*1.55,a, t*.16 + i);
      }else{
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(x,y,p.r,0,Math.PI*2); ctx.fill();
      }
    }

    // crystalline side particles
    for(let i=0;i<15;i++){
      const side = i%2===0 ? .08 : .92;
      const x = side*w + Math.sin(t + i*.7)*18;
      const y = ((rand(i+1700) + t*(.032 + i*.0008)) % 1) * h;
      drawSnowflake(x,y, 5 + rand(i+1800)*10, .24*fadeFactor, t*.14 + i);
    }
  }

  function patrias(t){
    const palettes = [
      ['rgba(60,184,111,','rgba(255,255,255,','rgba(228,84,84,'],
      ['rgba(91,201,135,','rgba(255,244,210,','rgba(255,116,116,'],
      ['rgba(51,170,109,','rgba(255,255,255,','rgba(240,92,92,']
    ];
    for(let i=0;i<fireworks.length;i++){
      const fw = fireworks[i];
      const phase = ((t/3.5) + fw.delay) % 1;
      const boom = clamp((phase - .12)/.88, 0, 1);
      const fade = Math.pow(1 - boom, .75) * fadeFactor;
      const x = fw.x*w, y = fw.y*h;
      if(phase < .12) { glow(x,y,40,'255,232,180',.05*fadeFactor); continue; }
      const palette = palettes[fw.hue % palettes.length];
      const spokes = 18 + (i%4)*3;
      const radius = 18 + boom * (42 + (i%3)*10);
      for(let s=0;s<spokes;s++){
        const ang = (Math.PI*2/spokes)*s + i*.17;
        const c = palette[s%3] + (0.18 + (s%2)*.08)*fade + ')';
        ctx.strokeStyle = c;
        ctx.lineWidth = 1.6;
        const inner = radius*.48;
        const outer = radius*(.9 + (s%4)*.05);
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(ang)*inner, y + Math.sin(ang)*inner);
        ctx.lineTo(x + Math.cos(ang)*outer, y + Math.sin(ang)*outer);
        ctx.stroke();
      }
    }
  }

  function paint(ts){
    raf = requestAnimationFrame(paint);
    if(document.hidden || !supported.has(theme) || !ctx) return;
    if(ts - last < 33) return;
    last = ts;
    updateFade();
    clear();
    const t = ts / 1000;
    if(fadeFactor <= 0.01) return;
    if(theme === 'halloween') halloween(t);
    else if(theme === 'navidad') navidad(t);
    else if(theme === 'patrias') patrias(t);
  }

  function renderStill(){
    updateFade(); clear(); if(fadeFactor <= 0.01) return;
    if(theme==='halloween') halloween(2.8);
    else if(theme==='navidad') navidad(2.2);
    else if(theme==='patrias') patrias(2.5);
  }

  function setSeason(next){
    theme = supported.has(next) ? next : 'todos';
    body.dataset.gabysSeason = theme;
    updateFade();
    if(reduced.matches) renderStill();
  }

  window.GABYS_SET_SEASON = setSeason;
  window.addEventListener('gabys:season-change', e => setSeason(e.detail?.season));
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('scroll', ()=>{ if(reduced.matches) renderStill(); else updateFade(); }, {passive:true});
  document.addEventListener('visibilitychange', ()=>{ if(reduced.matches) renderStill(); });
  reduced.addEventListener?.('change', ()=>{ if(reduced.matches) renderStill(); });

  resize();
  setSeason(body.dataset.gabysSeason || 'todos');
  if(reduced.matches) renderStill(); else raf = requestAnimationFrame(paint);
})();