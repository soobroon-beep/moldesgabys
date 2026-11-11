/* ═══════════════════════════════════════════════════════════════════════
   Colibrí de Gaby's — asistente de atención a clientes con IA GRATUITA.
   - IA abierta y gratuita de Pollinations (sin cuentas ni claves del cliente).
   - Busca modelos en el catálogo y los muestra con foto para abrirlos y comprarlos.
   - Explica cómo comprar, precios, datos de contacto y pasos a seguir.
   - Voz: toca el micrófono, habla todo lo que quieras y toca enviar cuando termines.
   - Si la IA no responde, sigue ayudando con su guía local (nunca se queda callado).
   ═══════════════════════════════════════════════════════════════════════ */
(()=>{'use strict';
const T=window.GABYS_TIENDA;if(!T)return;
const AI_URL='https://gen.pollinations.ai/v1/chat/completions';
const AI_KEY='sk_1XvEYtOmiFixsgMve0FAqQz5ghhy7FFT'; // clave del producto gratuito de Pollinations (pública a propósito)
const AI_MODELS=['openai','deepseek','mistral'];
const NAME='Colibrí';
const BIZ={
 nombre:"Moldes y Diseños Gaby's",
 whatsapp:'272 130 08 18',
 whatsappLink:'https://wa.me/522721300818',
 direccion:'Venustiano Carranza #150, planta alta, local 138, entre Cruces y Jesús María, Centro Histórico, Ciudad de México',
 mapa:'https://maps.app.goo.gl/8dvFUe5max9YMt6i6',
 youtube:'https://www.youtube.com/@moldesgabys',
 facebook:'https://www.facebook.com/moldesenfieltrogabys/'
};
const $=(s,r=document)=>r.querySelector(s);
const norm=s=>String(s??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>matchMedia('(max-width:640px)').matches;
const SEC={todos:'Todas',halloween:'Halloween',navidad:'Navidad',patrias:'Fiestas patrias',amor:'San Valentín',bebes:'Bebés',bano:'Juegos de baño','toda-ocasion':'Toda ocasión'};
const SEC_ICON={halloween:'🎃',navidad:'🎄',patrias:'🇲🇽',amor:'💗',bebes:'🧸',bano:'🛁','toda-ocasion':'✂️'};

/* ════════ Descripciones de las fotos (las hace una IA de visión en GitHub Actions) ════════ */
let DESC=window.GABYS_DESCRIPCIONES||null;
function loadDescriptions(){
 if(DESC&&Object.keys(DESC).length)return Promise.resolve(DESC);
 if(loadDescriptions.p)return loadDescriptions.p;
 return loadDescriptions.p=new Promise(res=>{const s=document.createElement('script');s.src='descripciones-ia.js?v='+Math.floor(Date.now()/36e5);s.async=true;s.onload=()=>{DESC=window.GABYS_DESCRIPCIONES||{};res(DESC)};s.onerror=()=>{DESC=DESC||{};res(DESC)};document.head.appendChild(s)});
}
setTimeout(()=>{if(window.requestIdleCallback)requestIdleCallback(()=>loadDescriptions(),{timeout:5000});else loadDescriptions()},2500);

/* ════════ Buscador inteligente del catálogo ════════ */
const GROUPS=[
 ['santa claus','santa','santas','santa claus','papa noel','san nicolas','santaclos','santoclos','noel'],
 ['mamá noel','mama noel','senora claus','mrs claus','mama claus','esposa de santa'],
 ['muñeco de nieve','muneco de nieve','munecos de nieve','monito de nieve','monitos de nieve','snowman','hombre de nieve','hombres de nieve','nieve'],
 ['reno','reno','renos','renito','renitos','rodolfo','reindeer','venado'],
 ['duende','duende','duendes','elfo','elfos','duendecillo'],
 ['pingüino','pinguino','pinguinos','pinguinito'],
 ['oso','oso','osos','osito','ositos','peluche'],
 ['ángel','angel','angeles','angelito','angelitos','querubin'],
 ['árbol de navidad','arbol','arboles','pino','pinito','arbolito'],
 ['galleta de jengibre','galleta','galletas','jengibre','gingerbread'],
 ['esfera','esfera','esferas','bola navidena','esferita'],
 ['estrella','estrella','estrellas'],
 ['campana','campana','campanas','campanita'],
 ['corona','corona','coronas','guirnalda','guirnaldas'],
 ['bota navideña','bota','botas','calcetin','calcetines','botita'],
 ['nacimiento','nacimiento','pesebre','belen','nino dios','jesus','virgen','jose','reyes magos'],
 ['nochebuena','nochebuena','flor de pascua','poinsettia'],
 ['trineo','trineo'],
 ['regalo','regalo','regalos','caja de regalo'],
 ['cascanueces','cascanueces','soldadito','soldaditos'],
 ['grinch','grinch'],
 ['bruja','bruja','brujas','brujita','brujitas'],
 ['calabaza','calabaza','calabazas','calabacita'],
 ['fantasma','fantasma','fantasmas','fantasmita'],
 ['catrina','catrina','catrinas','catrin','dia de muertos'],
 ['calavera','calavera','calaveras','calaverita','esqueleto'],
 ['murciélago','murcielago','murcielagos'],
 ['gato','gato','gatos','gatito','gata'],
 ['vampiro','vampiro','vampiros','dracula'],
 ['corazón','corazon','corazones'],
 ['cupido','cupido','cupidos'],
 ['bebé','bebe','bebes','baby'],
 ['cigüeña','ciguena','ciguenas'],
 ['charro','charro','charros','mariachi','china poblana','sombrero'],
 ['bandera','bandera','banderas','aguila'],
 ['flor','flor','flores','rosa','rosas'],
 ['búho','buho','buhos','tecolote'],
 ['perro','perro','perros','perrito','perrita'],
 ['conejo','conejo','conejos','conejito'],
 ['muñeca','muneca','munecas','nina','ninas'],
 ['payaso','payaso','payasos'],
 ['juego de baño','juego de bano','juegos de bano','bano','tapa de bano','tapete'],
 ['cojín','cojin','cojines','almohada'],
 ['letrero','letrero','letreros','bienvenida','bienvenidos','welcome','cartel'],
 ['centro de mesa','centro de mesa','centros de mesa'],
 ['pie de árbol','pie de arbol','faldon','falda de arbol'],
 ['dulcero','dulcero','dulceros','bolo','bolos']
];
const SEC_WORDS={navidad:['navidad','navideno','navidena','navidenos','navidenas','decembrino'],halloween:['halloween','jalogüin','jalowin','noche de brujas','muertos'],patrias:['patrias','septiembre','independencia','mexicano','mexicana','15 de septiembre'],amor:['san valentin','amor','14 de febrero','enamorados','valentin'],bebes:['bebes','baby shower','nacimiento de bebe','recien nacido'],bano:['juego de bano','juegos de bano'],'toda-ocasion':['toda ocasion','cumpleanos','todo el ano']};
const STOP=new Set('quiero queria querria busco buscar busca necesito ver mostrar muestrame ensename dame tienes tienen tengan hay algun alguna algunos algunas figura figuras modelo modelos molde moldes foto fotos imagen imagenes que sean con en de del para por favor donde estan los las unas unos uno una un me el la y o todos todas disenos diseño diseno tipo como cual cuales mas otro otros otra otras tambien asi ese esa esos esas este esta estos estas lo le les mi mis tu tus su sus al a hola gracias porfa pls'.split(' '));
function plural(w){return w.length>4?w.replace(/(es|s)$/,''):w}
function concepts(q){
 const t=' '+norm(q).replace(/[^a-z0-9ñ ]/g,' ').replace(/\s+/g,' ')+' ';
 const found=[];let rest=t;
 for(const g of GROUPS){const hit=g.slice(1).filter(w=>rest.includes(' '+w+' ')).sort((a,b)=>b.length-a.length)[0];if(hit){found.push({label:g[0],words:g.slice(1)});rest=rest.replace(' '+hit+' ',' ')}}
 let section=null;for(const[k,ws]of Object.entries(SEC_WORDS)){if(ws.some(w=>t.includes(' '+norm(w)+' ')||t.includes(' '+norm(w)))){section=k;ws.forEach(w=>rest=rest.replace(norm(w),' '));break}}
 const extra=rest.split(' ').filter(w=>w.length>2&&!STOP.has(w)&&!/^\d+$/.test(w)).map(plural);
 return {found,section,extra};
}
function docOf(p){
 const d=(DESC&&DESC[p.codigo])||{};const tags=(window.GABYS_ETIQUETAS||{})[p.codigo]||[];
 return {fig:norm((d.f||[]).concat(tags).join(' | ')),tipo:norm(d.t||''),col:norm((d.c||[]).join(' ')),desc:norm(d.d||''),base:norm([p.nombre,p.album,p.busqueda,SEC[p.seccion]].join(' ')),has:!!(d.f&&d.f.length)};
}
function searchCatalog(query,opts={}){
 const all=T.obtenerModelos();const c=concepts(query);
 const section=opts.seccion&&SEC[opts.seccion]&&opts.seccion!=='todos'?opts.seccion:c.section;
 const pool=section?all.filter(p=>p.seccion===section):all;
 if(!c.found.length&&!c.extra.length)return {hits:[],c,section,onlySection:!!section,pool};
 const scored=[];
 for(const p of pool){
  const d=docOf(p);let score=0,ok=true;
  for(const k of c.found){let s=0;for(const w of k.words){const W=norm(w);if(d.fig.includes(W))s=Math.max(s,6);else if(d.tipo.includes(W))s=Math.max(s,4);else if(d.desc.includes(W))s=Math.max(s,3);else if(d.base.includes(W))s=Math.max(s,1)}if(!s){ok=false;break}score+=s}
  if(!ok)continue;
  for(const w of c.extra){if(d.fig.includes(w))score+=3;else if(d.desc.includes(w)||d.col.includes(w)||d.tipo.includes(w))score+=2;else if(d.base.includes(w))score+=.5;else if(!c.found.length){ok=false;break}}
  if(ok&&score>0)scored.push([score,p]);
 }
 scored.sort((a,b)=>b[0]-a[0]||(a[1].numero??1e9)-(b[1].numero??1e9));
 return {hits:scored.map(x=>x[1]),c,section,pool};
}
function byNumber(q){
 const t=norm(q);
 const code=t.match(/\b([a-z]{3})26-?(\d{1,4})(?:-([a-z]))?\b/);if(code){const k=code[1].toUpperCase()+'26-'+code[2].padStart(4,'0')+(code[3]?'-'+code[3].toUpperCase():'');return T.obtenerModelos().filter(p=>p.codigo===k)}
 const n=t.match(/(?:numero|modelo|no\.?|num|#|n\.?º|foto)\s*[:#.-]?\s*(\d{1,4})\b/)||(/^\s*#?\d{1,4}\s*$/.test(t)?[t,t.replace(/\D/g,'')]:null);
 if(!n)return null;const c=concepts(q);const num=Number(n[1]);
 return T.obtenerModelos().filter(p=>(p.numero===num||String(p.numeroEtiqueta||'')===String(num))&&(!c.section||p.seccion===c.section));
}
function coverage(){const all=T.obtenerModelos();if(!DESC)return 0;let n=0;for(const p of all)if(DESC[p.codigo])n++;return all.length?n/all.length:0}

/* ════════ Interfaz ════════ */
const ICON={
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
 send:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z"/></svg>',
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
 stop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
 trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
 cart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>'
};
const sprite=()=>`<div class="cb-sprite"><div class="cb-flip"><div class="cb-hover"><span class="cb-ring"></span><img class="cb-body" src="assets/colibri-ia-cuerpo.webp" alt=""><img class="cb-wing" src="assets/colibri-ia-ala.webp" alt=""></div></div></div>`;
const root=document.createElement('div');root.className='cb-root';
root.innerHTML=`
<button class="cb-bird" type="button" aria-label="Abrir a ${NAME}, tu asistente de Moldes Gaby's">${sprite()}<span class="cb-shadow"></span></button>
<div class="cb-tip" role="status" hidden><button class="cb-tip-x" type="button" aria-label="Cerrar">×</button><p></p><div class="cb-tip-chips"></div></div>
<section class="cb-panel" role="dialog" aria-label="Chat con ${NAME}" hidden>
 <header class="cb-head">${sprite()}<div class="cb-title"><strong>${NAME} de Gaby's</strong><small><i></i><span class="cb-status">IA gratuita · en línea</span></small></div>
  <button type="button" class="cb-cart" aria-label="Ver mi selección" title="Mi selección">${ICON.cart}</button>
  <button type="button" class="cb-clear" aria-label="Nueva conversación" title="Nueva conversación">${ICON.trash}</button>
  <button type="button" class="cb-close" aria-label="Cerrar chat">${ICON.close}</button></header>
 <div class="cb-msgs" aria-live="polite"></div>
 <div class="cb-chips"></div>
 <div class="cb-recbar" hidden><i></i><span>Te escucho… habla con calma y toca ✓ para enviar</span><div class="cb-wave">${'<b></b>'.repeat(7)}</div><time>0:00</time></div>
 <form class="cb-form" autocomplete="off">
  <button type="button" class="cb-cancel" aria-label="Cancelar grabación" hidden>${ICON.close}</button>
  <button type="button" class="cb-mic" aria-label="Hablar por voz">${ICON.mic}</button>
  <textarea rows="1" maxlength="600" placeholder="Pregúntame o describe un molde…" aria-label="Escribe tu mensaje"></textarea>
  <button type="submit" class="cb-send" aria-label="Enviar">${ICON.send}</button>
 </form>
 <p class="cb-note">Asistente con IA gratuita · Confirma precios y entregas por WhatsApp</p>
</section>`;
document.body.appendChild(root);
const bird=$('.cb-bird',root),tip=$('.cb-tip',root),panel=$('.cb-panel',root),msgs=$('.cb-msgs',root),chipsBox=$('.cb-chips',root),form=$('.cb-form',root),input=$('textarea',form),micBtn=$('.cb-mic',form),cancelBtn=$('.cb-cancel',form),recbar=$('.cb-recbar',root),statusEl=$('.cb-status',root);

let hist=[],busy=false,lastResults=[],started=false;
function status(t){statusEl.textContent=t||'IA gratuita · en línea'}
function thinking(on){root.classList.toggle('cb-thinking',on);panel.classList.toggle('cb-thinking',on);status(on?`${NAME} está pensando…`:'')}
function scrollDown(){requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight})}
function linkify(t){return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')}
function say(text,role='bot'){const d=document.createElement('div');d.className='cb-msg '+role;d.innerHTML=linkify(text);msgs.appendChild(d);scrollDown();return d}
function typing(){const d=document.createElement('div');d.className='cb-msg bot';d.innerHTML='<span class="cb-typing"><i></i><i></i><i></i></span>';msgs.appendChild(d);scrollDown();return d}
function setChips(list){chipsBox.replaceChildren();for(const c of list){const b=document.createElement('button');b.type='button';b.textContent=c;b.addEventListener('click',()=>ask(c.replace(/^[^\wáéíóúñ¿¡#]+/i,'').trim()||c));chipsBox.appendChild(b)}}
function seasonNow(){const d=new Date(),m=d.getMonth();if(m===9||(m===10&&d.getDate()<=2))return 'halloween';if(m===1)return 'amor';if(m===8)return 'patrias';return 'navidad'}
function defaultChips(){
 const s=seasonNow();
 const byS={navidad:['🎅 Santa Claus','⛄ Muñecos de nieve','🦌 Renos','🐧 Pingüinos'],halloween:['🎃 Calabazas','🧙 Brujas','💀 Catrinas','👻 Fantasmas'],amor:['💗 Corazones','🧸 Ositos','💘 Cupidos'],patrias:['🇲🇽 Charros','🦅 Banderas']}[s]||[];
 return ['🛍️ ¿Cómo compro?',...byS,'💳 Precios y pagos','📞 Sus datos de contacto','🧺 Ver mi selección'];
}

/* Tarjetas de resultados: cada foto se abre para elegir formato y añadir al carrito */
function showResults(hits,subject){
 lastResults=hits.slice(0,40);
 const box=document.createElement('div');box.className='cb-results';
 const head=document.createElement('div');head.className='cb-results-head';head.innerHTML=`<b>${hits.length.toLocaleString('es-MX')} modelo${hits.length===1?'':'s'}</b><span>${esc(subject||'')}</span>`;box.appendChild(head);
 const grid=document.createElement('div');grid.className='cb-grid';box.appendChild(grid);
 let shown=0;
 const addMore=n=>{for(const p of hits.slice(shown,shown+n)){
  const b=document.createElement('button');b.type='button';b.className='cb-card';b.title='Ver y seleccionar '+p.codigo;
  const img=document.createElement('img');img.alt=(DESC&&DESC[p.codigo]&&DESC[p.codigo].d)||p.nombre;img.loading='lazy';img.decoding='async';img.dataset.retry='0';img.addEventListener('error',()=>T.imagenRespaldo(img,p));img.src=T.imagen(p);
  const lab=document.createElement('span');lab.textContent=(SEC_ICON[p.seccion]||'')+' #'+(p.numeroEtiqueta||p.numero||'S/N')+' · '+(SEC[p.seccion]||'');
  const plus=document.createElement('em');plus.textContent='+';plus.setAttribute('aria-hidden','true');
  b.append(img,lab,plus);b.addEventListener('click',()=>{T.abrirModelo(p.codigo);if(mobile()){minimize();reopenAfterModal=true}});grid.appendChild(b)}shown=Math.min(hits.length,shown+n)};
 addMore(9);
 const act=document.createElement('div');act.className='cb-results-actions';
 const more=document.createElement('button');more.type='button';const upd=()=>{more.textContent=`Ver ${Math.min(12,hits.length-shown)} más ↓`;more.hidden=shown>=hits.length};upd();more.addEventListener('click',()=>{addMore(12);upd();scrollDown()});
 const all=document.createElement('button');all.type='button';all.className='cb-main';all.textContent=hits.length>1?`Ver los ${hits.length} en la página ↗`:'Abrir modelo ↗';all.addEventListener('click',()=>{if(hits.length===1){T.abrirModelo(hits[0].codigo)}else{T.mostrarEnCatalogo(hits.map(p=>p.codigo))}minimize()});
 act.append(more,all);box.appendChild(act);msgs.appendChild(box);
 const prev=box.previousElementSibling;requestAnimationFrame(()=>{msgs.scrollTop=Math.max(0,(prev&&prev.classList.contains('bot')?prev:box).offsetTop-msgs.offsetTop-8)});
}

/* ════════ Conocimiento de la tienda para la IA ════════ */
function storeFacts(){
 const pr=T.precios(),secs=T.temporadas().filter(s=>s.key!=='todos'&&s.total).map(s=>`${s.label}: ${s.total}`).join(', ');
 return `TIENDA: ${BIZ.nombre}. Más de 30 años creando moldes para figuras de FIELTRO (adornos, letreros de puerta, coronas, centros de mesa, juegos de baño, etc.).
COLECCIONES (modelos con foto): ${secs}.
PRECIOS DE REFERENCIA (se confirman antes de cobrar): molde digital ${money(pr.digital)} MXN, molde físico ${money(pr.fisico)} MXN por modelo.
CÓMO COMPRAR EN LA PÁGINA: 1) Busca el modelo (por colección, número o descripción; o pídemelo a mí). 2) Toca la foto o «Ver y seleccionar». 3) Elige «Molde digital» o «Molde físico» y toca «Añadir a mi selección». 4) Abre «Mi selección» (carrito arriba a la derecha) y toca «Preparar pedido por WhatsApp»: se abre WhatsApp con tu lista para confirmar precio, disponibilidad, forma de pago y entrega. El pago con Mercado Pago estará disponible próximamente; hoy NO hay cobros en línea.
DIGITAL: el molde se entrega por medios digitales; la forma de entrega se confirma por WhatsApp. FÍSICO: molde impreso; el envío y su costo se confirman antes de pagar.
Las fotos muestran la FIGURA TERMINADA de ejemplo; no son el archivo del molde.
CONTACTO: WhatsApp ${BIZ.whatsapp} (${BIZ.whatsappLink}). Tienda física en ${BIZ.direccion} (mapa: ${BIZ.mapa}). Tutoriales gratis en YouTube: ${BIZ.youtube}. Facebook: ${BIZ.facebook}.
Horarios, formas de pago exactas, tiempos de envío y descuentos por volumen: no los sabes; invita a confirmarlos por WhatsApp.`;
}
const SYS=()=>`Eres ${NAME}, el colibrí de fieltro mascota y asistente de atención a clientes de ${BIZ.nombre}. Hablas español de México, cálido, alegre y breve (máximo 3-4 frases, puedes usar 1 emoji). Ayudas a: encontrar moldes, explicar cómo comprar paso a paso, resolver dudas y dar los datos de la tienda. Nunca inventes modelos, precios, horarios ni datos: los modelos SOLO se muestran con la acción "buscar". Nunca pidas datos de tarjeta.
${storeFacts()}
RESPONDE SIEMPRE SOLO CON JSON: {"respuesta":"texto para el cliente","acciones":[...],"sugerencias":["2 a 4 botones cortos de siguiente paso"]}
ACCIONES disponibles (usa las necesarias, máximo 3):
{"tipo":"buscar","consulta":"palabras clave de la figura en español, ej. santa claus, muñeco de nieve, reno con trineo","seccion":"navidad|halloween|patrias|amor|bebes|bano|toda-ocasion|"} → muestra fotos del catálogo.
{"tipo":"abrir","codigo":"CÓDIGO"} → abre un modelo de los resultados para elegir formato.
{"tipo":"agregar","codigo":"CÓDIGO","formato":"digital|fisico"} → lo añade a «Mi selección» (solo si el cliente lo pide claramente).
{"tipo":"carrito"} → abre «Mi selección». {"tipo":"whatsapp"} → prepara el pedido por WhatsApp. {"tipo":"coleccion","clave":"navidad|halloween|patrias|amor|bebes|bano|toda-ocasion"} → muestra esa colección en la página.
{"tipo":"ir","lugar":"comprar|tutoriales|colecciones|contacto"} → lleva a esa parte de la página.
Si el cliente busca o describe una figura, SIEMPRE usa "buscar". Si es vago (ej. "algo bonito"), pregúntale qué temporada o figura busca y sugiere opciones.`;
function context(){
 const cart=T.carrito();
 const res=lastResults.slice(0,12).map((p,i)=>{const d=DESC&&DESC[p.codigo];return `${i+1}. ${p.codigo} (${SEC[p.seccion]} #${p.numeroEtiqueta||p.numero||'S/N'})${d&&d.d?': '+d.d:''}`}).join('\n');
 return `\n[CONTEXTO] Carrito: ${cart.length?cart.map(x=>`${x.codigo} ${x.formato}`).join(', '):'vacío'}.${res?`\nÚltimos resultados mostrados:\n${res}`:''}`;
}

/* ════════ IA gratuita (Pollinations, modelos abiertos) ════════ */
async function fetchT(url,init,ms){const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),ms);try{return await fetch(url,{...init,signal:ctl.signal})}finally{clearTimeout(to)}}
let goodModel=null;
async function freeAI(messages,max=600){
 const order=goodModel?[goodModel,...AI_MODELS.filter(m=>m!==goodModel)]:AI_MODELS;let last;
 for(const model of order){
  try{const r=await fetchT(AI_URL,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+AI_KEY},body:JSON.stringify({model,messages,max_tokens:max,temperature:.5})},28000);
   if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();const t=j?.choices?.[0]?.message?.content;if(!t)throw new Error('vacía');goodModel=model;return t}
  catch(e){last=e}
 }
 throw last||new Error('IA no disponible');
}
function parseAI(raw){
 const m=String(raw||'').match(/\{[\s\S]*\}/);let j=null;try{j=m?JSON.parse(m[0]):null}catch{}
 if(!j){return {respuesta:String(raw||'').replace(/```[\s\S]*?```/g,'').trim(),acciones:[],sugerencias:[]}}
 return {respuesta:String(j.respuesta||j.reply||'').trim(),acciones:Array.isArray(j.acciones)?j.acciones:Array.isArray(j.actions)?j.actions:[],sugerencias:Array.isArray(j.sugerencias)?j.sugerencias.filter(x=>typeof x==='string').slice(0,4):[]};
}

/* ════════ Guía local (respaldo sin IA) ════════ */
function localGuide(q){
 const t=norm(q),pr=T.precios();
 if(/tarjeta|mercado ?pago|pagar|pago|transferencia|deposito|oxxo|efectivo/.test(t))return `Por ahora no hay cobros en línea 💳. Arma tu selección y envíala por WhatsApp (${BIZ.whatsapp}); ahí te confirman el total y la forma de pago. El pago con Mercado Pago llegará pronto. Nunca compartas datos de tu tarjeta por chat.`;
 if(/precio|cuesta|cuanto|costo|vale/.test(t))return `Precios de referencia: molde digital ${money(pr.digital)} y molde físico ${money(pr.fisico)} MXN por modelo. Se confirman por WhatsApp antes de pagar.`;
 if(/compr|pedido|como (le )?hago|pasos|ordenar|adquirir|carrito|seleccion/.test(t))return `¡Es muy fácil! 🛍️\n1) Busca tu modelo (o pídemelo a mí).\n2) Toca la foto o «Ver y seleccionar».\n3) Elige digital o físico y toca «Añadir a mi selección».\n4) Abre «Mi selección» y toca «Preparar pedido por WhatsApp» para confirmar total, pago y entrega.`;
 if(/whats|contacto|telefono|celular|llamar|numero de ustedes|comunicar/.test(t))return `Escríbenos por WhatsApp al ${BIZ.whatsapp} 📱: ${BIZ.whatsappLink}`;
 if(/direccion|ubicacion|donde estan|tienda fisica|local|visitar|mapa/.test(t))return `Nuestra tienda está en ${BIZ.direccion} 📍. Mapa: ${BIZ.mapa}`;
 if(/envio|entrega|paqueteria|llega|mandan|domicilio/.test(t))return 'Los moldes físicos se envían; el costo y el tiempo de entrega se confirman por WhatsApp antes de pagar. Los digitales se entregan por medios digitales, también confirmados por WhatsApp.';
 if(/digital|pdf|descarg|imprimir|archivo/.test(t))return 'El molde digital es el patrón para que lo imprimas tú; la forma de entrega se confirma por WhatsApp. Las fotos de la página muestran la figura terminada de ejemplo.';
 if(/tutorial|video|youtube|aprender|como se hace/.test(t))return `Tenemos tutoriales gratis en YouTube 🎬: ${BIZ.youtube}`;
 if(/facebook|redes/.test(t))return `Síguenos en Facebook: ${BIZ.facebook} y en YouTube: ${BIZ.youtube}`;
 if(/horario|abren|cierran|hora/.test(t))return `Para horarios exactos, escríbenos por WhatsApp al ${BIZ.whatsapp} y con gusto te confirmamos.`;
 if(/^(hola|buen[oa]s|que tal|hey)/.test(t))return `¡Hola! 🌷 Soy ${NAME}. ¿Qué molde buscas hoy? Puedo mostrarte Santas, muñecos de nieve, renos, brujitas y mucho más.`;
 if(/gracias/.test(t))return '¡Con mucho gusto! 💗 Aquí estoy si necesitas otro molde.';
 return null;
}

/* ════════ Ejecutar acciones ════════ */
async function runSearch(query,seccion){
 await loadDescriptions();
 const r=searchCatalog(query,{seccion});
 const subject=[r.c.found.map(f=>f.label).join(' + ')||r.c.extra.join(' '),r.section?'· '+SEC[r.section]:''].join(' ').trim();
 if(r.hits.length){showResults(r.hits,subject);return true}
 const cov=coverage();
 if(r.c.found.length&&cov<.9){
  const pool=r.section?r.pool:T.obtenerModelos().filter(p=>p.seccion==='navidad');
  say(`Todavía estoy aprendiendo a reconocer todas las fotos (llevo ${Math.round(cov*100)}%), así que aún no encuentro «${subject}» con seguridad. Mientras tanto te muestro la colección de ${SEC[r.section||'navidad']} para que la revises 👇`);
  showResults(pool,SEC[r.section||'navidad']);return true;
 }
 if(r.onlySection){T.verColeccion(r.section);say(`Te abrí la colección de ${SEC[r.section]} en la página 👇`);minimize();return true}
 say(`No encontré modelos de «${subject||query}». Prueba con otra palabra (por ejemplo «reno», «Santa», «bruja», «corazón») o dime el número del modelo.`);return false;
}
async function perform(acts){
 let searched=false;
 for(const a of acts.slice(0,3)){
  const tipo=String(a&&(a.tipo||a.do)||'');
  if(tipo==='buscar'&&a.consulta){searched=await runSearch(String(a.consulta),a.seccion)||searched}
  else if(tipo==='abrir'&&a.codigo){if(T.obtenerModelos().some(p=>p.codigo===a.codigo)){T.abrirModelo(a.codigo);if(mobile())minimize()}}
  else if(tipo==='agregar'&&a.codigo){if(T.agregar(a.codigo,a.formato)){say(`Listo, añadí ${a.codigo} (${a.formato==='fisico'?'físico':'digital'}) a tu selección 🧺`)}}
  else if(tipo==='carrito'){T.abrirCarrito();minimize()}
  else if(tipo==='whatsapp'){if(T.carrito().length){T.enviarWhatsapp()}else say('Tu selección está vacía. Primero elige algún modelo y luego preparo tu pedido por WhatsApp 😉')}
  else if(tipo==='coleccion'&&a.clave){if(T.verColeccion(a.clave))minimize()}
  else if(tipo==='ir'&&a.lugar){const id={comprar:'comprar',tutoriales:'tutoriales',colecciones:'colecciones',contacto:'footer-whatsapp-link'}[a.lugar];const el=id&&(document.getElementById(id)||document.querySelector('footer'));if(el){el.scrollIntoView({behavior:'smooth',block:'start'});minimize()}}
 }
 return searched;
}

/* ════════ Conversación ════════ */
async function ask(text){
 text=String(text||'').trim();if(!text||busy)return;
 stopTips();say(text,'user');input.value='';fitInput();
 const t=norm(text);
 // 1) Número o código exacto: respuesta instantánea
 const num=byNumber(text);
 if(num){if(num.length){say(num.length===1?'¡Aquí está! Tócalo para verlo y añadirlo 👇':`Ese número existe en ${num.length} colecciones, elige el tuyo 👇`);showResults(num,'Modelo '+text.replace(/\D/g,''));}else say('No encontré ese número. Revisa el número que aparece en la foto o dime cómo es la figura.');setChips(defaultChips());return}
 // 2) Atajos que no necesitan IA
 if(/^(ver )?mi seleccion|^carrito$|^ver carrito/.test(t)){T.abrirCarrito();minimize();return}
 busy=true;thinking(true);const dots=typing();
 let out=null;
 try{
  await loadDescriptions();
  const msgsAI=[{role:'system',content:SYS()},...hist.slice(-8),{role:'user',content:text+context()}];
  out=parseAI(await freeAI(msgsAI,650));
 }catch(e){console.warn('Colibrí IA',e)}
 dots.remove();busy=false;thinking(false);
 if(out&&(out.respuesta||out.acciones.length)){
  if(out.respuesta)say(out.respuesta);
  hist.push({role:'user',content:text.slice(0,400)},{role:'assistant',content:JSON.stringify({respuesta:out.respuesta,acciones:out.acciones}).slice(0,700)});if(hist.length>16)hist.splice(0,hist.length-16);
  let searched=await perform(out.acciones);
  // Si mencionó una figura y la IA olvidó buscar, buscamos igual
  if(!searched&&!out.acciones.some(a=>(a.tipo||a.do)==='buscar')&&concepts(text).found.length&&!localGuide(text))await runSearch(text);
  setChips(out.sugerencias.length?out.sugerencias:defaultChips());
  return;
 }
 // 3) Respaldo local
 status('modo guía (sin conexión con la IA)');
 const g=localGuide(text);
 if(g&&!concepts(text).found.length){say(g)}
 else if(concepts(text).found.length||concepts(text).section){await runSearch(text)}
 else say(g||'Ahorita no pude conectarme con mi cerebro de IA 🙈, pero puedo buscar modelos: dime la figura (ej. «Santa», «reno», «bruja») o el número de la foto. También puedes escribirnos por WhatsApp al '+BIZ.whatsapp+'.');
 setChips(defaultChips());
}
function fitInput(){input.style.height='auto';input.style.height=Math.min(110,input.scrollHeight)+'px'}
input.addEventListener('input',fitInput);
input.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});
form.addEventListener('submit',e=>{e.preventDefault();if(rec.on){finishVoice();return}ask(input.value)});

function greet(){
 if(started)return;started=true;
 const cart=T.carrito().length;
 say(`¡Hola! 🌷 Soy ${NAME}, el colibrí de Moldes Gaby's. Puedo buscarte moldes (Santas, muñecos de nieve, brujitas…), explicarte cómo comprar y darte nuestros datos.${cart?` Veo que ya tienes ${cart} modelo${cart>1?'s':''} en tu selección 🧺.`:''}\n¿Qué estás buscando hoy?`);
 setChips(defaultChips());
}
function openPanel(prefill){
 stopTips();panel.hidden=false;bird.classList.add('cb-away');greet();
 if(prefill)ask(prefill);else if(!mobile())setTimeout(()=>input.focus(),250);
}
function minimize(){if(rec.on)cancelVoice();panel.hidden=true;bird.classList.remove('cb-away');hop()}
bird.addEventListener('click',()=>{hop();openPanel()});
$('.cb-close',root).addEventListener('click',minimize);
$('.cb-cart',root).addEventListener('click',()=>{T.abrirCarrito();minimize()});
$('.cb-clear',root).addEventListener('click',()=>{msgs.replaceChildren();hist=[];lastResults=[];started=false;greet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden&&document.getElementById('product-modal')?.hidden!==false)minimize()});

/* ════════ Vuelo del colibrí ════════ */
function hop(){bird.classList.remove('cb-hop');void bird.offsetWidth;bird.classList.add('cb-hop');setTimeout(()=>bird.classList.remove('cb-hop'),750)}
function wander(){
 if(reduce||document.hidden||!panel.hidden||!tip.hidden){return}
 const dx=-(20+Math.random()*90),dy=-(10+Math.random()*70);
 bird.style.transform=`translate(${dx}px,${dy}px)`;
 setTimeout(()=>{bird.style.transform='translate(0,0)'},1700+Math.random()*900);
}
setInterval(wander,9000+Math.random()*4000);

/* ════════ Preguntas del colibrí (globo) ════════ */
const TIPS={
 navidad:[['¿Buscas modelos de Santa Claus? 🎅','Muéstrame Santas'],['¿Te enseño muñecos de nieve? ⛄','Muéstrame muñecos de nieve'],['¿Buscas renos para esta Navidad? 🦌','Muéstrame renos'],['¿Te ayudo a encontrar un molde por su número? 🔎',null],['¿Quieres saber cómo comprar? 🛍️','¿Cómo compro?']],
 halloween:[['¿Buscas brujitas o calabazas? 🎃','Muéstrame brujas'],['¿Te enseño catrinas para Día de Muertos? 💀','Muéstrame catrinas'],['¿Quieres saber cómo comprar? 🛍️','¿Cómo compro?']],
 amor:[['¿Buscas corazones o cupidos? 💗','Muéstrame corazones'],['¿Quieres saber cómo comprar? 🛍️','¿Cómo compro?']],
 patrias:[['¿Buscas charros o banderas? 🇲🇽','Muéstrame charros'],['¿Quieres saber cómo comprar? 🛍️','¿Cómo compro?']]
};
let tipTimer=0,tipCount=0,tipDismiss=0,tipIdx=0;
const tipText=$('p',tip),tipChips=$('.cb-tip-chips',tip);
function showTip(){
 if(!panel.hidden||tipCount>=4||tipDismiss>=2||document.hidden)return;
 const list=TIPS[seasonNow()]||TIPS.navidad;const [q,act]=list[tipIdx++%list.length];
 tipText.textContent=q;tipChips.replaceChildren();
 const yes=document.createElement('button');yes.type='button';yes.className='cb-main';yes.textContent=act?'¡Sí, muéstrame!':'Sí, ayúdame';yes.addEventListener('click',()=>openPanel(act||undefined));
 const no=document.createElement('button');no.type='button';no.textContent='Busco otra cosa';no.addEventListener('click',()=>openPanel());
 tipChips.append(yes,no);tip.hidden=false;tipCount++;hop();
 clearTimeout(showTip.h);showTip.h=setTimeout(()=>{tip.hidden=true},14000);
 tipTimer=setTimeout(showTip,55000);
}
function stopTips(){tip.hidden=true;clearTimeout(tipTimer)}
$('.cb-tip-x',tip).addEventListener('click',e=>{e.stopPropagation();tip.hidden=true;tipDismiss++;clearTimeout(tipTimer);if(tipDismiss<2)tipTimer=setTimeout(showTip,90000)});
tipTimer=setTimeout(showTip,7000);

/* ════════ Voz: toca el micrófono, habla todo lo que quieras y toca ✓ para enviar ════════ */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const rec={on:false,sr:null,committed:'',session:'',mr:null,stream:null,chunks:[],ctx:null,t0:0,timer:0,mode:''};
const timeEl=$('time',recbar),bars=[...recbar.querySelectorAll('.cb-wave b')];
function recUI(on){
 rec.on=on;panel.classList.toggle('cb-rec',on);recbar.hidden=!on;cancelBtn.hidden=!on;
 micBtn.innerHTML=on?ICON.stop:ICON.mic;micBtn.setAttribute('aria-label',on?'Terminar y enviar':'Hablar por voz');
 input.placeholder=on?'Te escucho…':'Pregúntame o describe un molde…';
 clearInterval(rec.timer);
 if(on){rec.t0=Date.now();rec.timer=setInterval(()=>{const s=Math.floor((Date.now()-rec.t0)/1000);timeEl.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');if(!rec.ctx)bars.forEach(b=>b.style.height=(25+Math.random()*60)+'%')},180)}
}
function startDictation(){
 rec.mode='sr';rec.committed=input.value.trim()?input.value.trim()+' ':'';rec.session='';
 const begin=()=>{const r=new SR();rec.sr=r;r.lang='es-MX';r.continuous=true;r.interimResults=true;
  r.onresult=e=>{let s='';for(let i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;rec.session=s;input.value=(rec.committed+s).replace(/\s+/g,' ');fitInput()};
  r.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){rec.denied=true}};
  r.onend=()=>{rec.committed=(rec.committed+rec.session+' ').replace(/\s+/g,' ');rec.session='';rec.sr=null;
   if(rec.denied){rec.denied=false;recUI(false);if(window.MediaRecorder&&navigator.mediaDevices){startRecorder()}else say('Necesito permiso para usar el micrófono. Actívalo en el candado de la barra de direcciones y vuelve a tocarlo.');return}
   if(rec.on&&rec.mode==='sr'){try{begin()}catch{}} // sigue escuchando hasta que tú decidas enviar
   else if(rec.finishing){rec.finishing=false;const t=rec.committed.trim();rec.committed='';if(t)ask(t);else say('No alcancé a escucharte 🙈. Toca el micrófono e inténtalo otra vez.')}
  };
  r.start()};
 try{begin();recUI(true)}catch{startRecorder()}
}
async function startRecorder(){
 if(!(navigator.mediaDevices&&window.MediaRecorder)){say('Tu navegador no permite usar el micrófono aquí. Puedes escribirme 😊');return}
 try{rec.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}
 catch(e){say(e&&e.name==='NotFoundError'?'No encontré ningún micrófono conectado.':'Necesito permiso para usar el micrófono: permítelo en el aviso del navegador y vuelve a tocarlo.');return}
 rec.mode='mr';rec.chunks=[];
 const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'].find(m=>{try{return MediaRecorder.isTypeSupported(m)}catch{return false}})||'';
 rec.mr=new MediaRecorder(rec.stream,mime?{mimeType:mime}:{});rec.mr.ondataavailable=e=>{if(e.data&&e.data.size)rec.chunks.push(e.data)};
 try{const AC=window.AudioContext||window.webkitAudioContext;rec.ctx=new AC();const an=rec.ctx.createAnalyser();an.fftSize=256;rec.ctx.createMediaStreamSource(rec.stream).connect(an);const d=new Uint8Array(an.fftSize);
  const loop=()=>{if(!rec.ctx)return;an.getByteTimeDomainData(d);let e=0;for(const v of d)e+=(v-128)*(v-128);const lvl=Math.min(1,Math.sqrt(e/d.length)/40);bars.forEach((b,i)=>b.style.height=(18+lvl*80*(.6+.4*Math.sin(Date.now()/90+i)))+'%');requestAnimationFrame(loop)};loop()}catch{}
 rec.mr.onstop=async()=>{const type=(rec.mr&&rec.mr.mimeType)||mime||'audio/webm';const keep=rec.finishing;rec.finishing=false;releaseMic();
  if(!keep)return;if(!rec.chunks.length){say('No alcancé a escucharte 🙈. Inténtalo otra vez.');return}
  thinking(true);status('escuchando tu audio…');const dots=typing();let t='';
  try{t=await transcribe(new Blob(rec.chunks,{type}))}catch(e){console.warn('Colibrí voz',e)}
  dots.remove();thinking(false);
  if(!t||t.length<2){say('No te entendí bien 🙈. Intenta otra vez un poquito más cerca del micrófono, o escríbeme.');return}
  ask(t)};
 rec.mr.start(250);recUI(true);
}
function releaseMic(){try{rec.stream&&rec.stream.getTracks().forEach(t=>t.stop())}catch{}rec.stream=null;try{rec.ctx&&rec.ctx.close()}catch{}rec.ctx=null;rec.mr=null}
function finishVoice(){
 if(!rec.on)return;rec.finishing=true;recUI(false);
 if(rec.mode==='sr'&&rec.sr){try{rec.sr.stop()}catch{}}
 else if(rec.mode==='sr'){rec.finishing=false;const t=(rec.committed+rec.session).trim();rec.committed='';if(t)ask(t)}
 else if(rec.mr&&rec.mr.state==='recording'){try{rec.mr.stop()}catch{}}
}
function cancelVoice(){rec.finishing=false;const wasSR=rec.mode==='sr';recUI(false);if(wasSR&&rec.sr){try{rec.sr.abort()}catch{}}rec.committed='';rec.session='';if(rec.mr&&rec.mr.state==='recording'){try{rec.mr.stop()}catch{}}else releaseMic();input.value='';fitInput()}
function toWav(buf){const n=buf.length,out=new DataView(new ArrayBuffer(44+n*2)),W=(o,s)=>{for(let i=0;i<s.length;i++)out.setUint8(o+i,s.charCodeAt(i))};W(0,'RIFF');out.setUint32(4,36+n*2,true);W(8,'WAVE');W(12,'fmt ');out.setUint32(16,16,true);out.setUint16(20,1,true);out.setUint16(22,1,true);out.setUint32(24,16000,true);out.setUint32(28,32000,true);out.setUint16(32,2,true);out.setUint16(34,16,true);W(36,'data');out.setUint32(40,n*2,true);for(let i=0;i<n;i++){const v=Math.max(-1,Math.min(1,buf[i]));out.setInt16(44+i*2,v<0?v*0x8000:v*0x7fff,true)}return out.buffer}
const b64=ab=>{const u=new Uint8Array(ab);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
async function transcribe(blob){
 const AC=window.AudioContext||window.webkitAudioContext,ac=new AC(),dec=await ac.decodeAudioData(await blob.arrayBuffer());try{ac.close()}catch{}
 const len=Math.ceil(dec.duration*16000),off=new OfflineAudioContext(1,Math.max(1,len),16000),src=off.createBufferSource();src.buffer=dec;src.connect(off.destination);src.start();const pcm=(await off.startRendering()).getChannelData(0);
 const body={model:'openai-audio',temperature:0,max_tokens:400,messages:[{role:'system',content:'Eres un transcriptor. Escribe EXACTAMENTE lo que dice la persona en el audio, en español, sin responderle, sin comillas y sin agregar nada. Si no se entiende nada, responde solo: ""'},{role:'user',content:[{type:'text',text:'Transcribe este audio.'},{type:'input_audio',input_audio:{data:b64(toWav(pcm)),format:'wav'}}]}]};
 const r=await fetchT(AI_URL,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+AI_KEY},body:JSON.stringify(body)},40000);if(!r.ok)throw new Error('HTTP '+r.status);
 const j=await r.json(),m=j?.choices?.[0]?.message||{};return String(m.content||(m.audio&&m.audio.transcript)||'').replace(/^["«“\s]+|["»”\s]+$/g,'').trim();
}
micBtn.addEventListener('click',()=>{
 if(rec.on){finishVoice();return}
 if(busy)return;
 if(SR)startDictation();else startRecorder();
});
cancelBtn.addEventListener('click',cancelVoice);

/* En el celular, al cerrar la foto vuelve el chat (salvo que se haya abierto el carrito) */
let reopenAfterModal=false;
const modalEl=document.getElementById('product-modal');
if(modalEl)new MutationObserver(()=>{if(!modalEl.hidden||!reopenAfterModal)return;reopenAfterModal=false;setTimeout(()=>{if(!document.getElementById('cart-drawer')?.classList.contains('open')&&panel.hidden){panel.hidden=false;bird.classList.add('cb-away')}},250)}).observe(modalEl,{attributes:true,attributeFilter:['hidden']});

window.GABYS_COLIBRI={abrir:openPanel,preguntar:q=>openPanel(q),buscar:searchCatalog};
})();
