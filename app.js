(()=>{
'use strict';
const PRICE={digital:Number(window.GABYS_CONFIG?.precioDigital||30),fisico:Number(window.GABYS_CONFIG?.precioFisico||65)}; // Precios de demostración: editar antes de activar pagos.
let WHATSAPP=String(window.GABYS_CONFIG?.whatsapp||'').replace(/\D/g,'');
const base=Array.isArray(window.GABYS_CATALOGO)?window.GABYS_CATALOGO:[];
let products=[...base],season='navidad',selected=null,visible=48,assistantStarted=false,aiOnline=false;
let activeResultCodes=null;
const visualTags=window.GABYS_ETIQUETAS||{};
const seasons=[
{key:'todos',label:'Todas las temporadas',icon:'✨'},
{key:'halloween',label:'Halloween',icon:'🎃'},
{key:'navidad',label:'Navidad',icon:'🎄'},
{key:'dia-muertos',label:'Día de Muertos',icon:'🌼'},
{key:'patrias',label:'Fiestas patrias',icon:'🇲🇽'},
{key:'amor',label:'San Valentín',icon:'💗'},
{key:'bebes',label:'Bebés',icon:'🧸'},
{key:'cocina',label:'Cocina',icon:'🫖'},
{key:'toda-ocasion',label:'Toda ocasión',icon:'✂️'}
];
const $=sel=>document.querySelector(sel);
const money=v=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(v);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function safeCart(){try{let c=JSON.parse(localStorage.getItem('gabys_new_cart_v1')||'[]');return Array.isArray(c)?c.filter(x=>x&&typeof x.codigo==='string'&&['digital','fisico'].includes(x.formato)).slice(0,100):[]}catch{return []}}
let cart=safeCart();
function store(){try{localStorage.setItem('gabys_new_cart_v1',JSON.stringify(cart))}catch{}renderCart()}
function itemImage(p){return p.id?'images/'+encodeURIComponent(p.codigo)+'.webp':(p.imagen||'uploads/'+encodeURIComponent(p.archivo))}
function fallbackImage(img,p){
  const attempt=Number(img.dataset.retry||0);
  const urls=[
    'https://lh3.googleusercontent.com/d/'+encodeURIComponent(p.id)+'=w900',
    'https://drive.google.com/thumbnail?id='+encodeURIComponent(p.id)+'&sz=w900',
    'https://drive.google.com/uc?export=view&id='+encodeURIComponent(p.id)
  ];
  if(p.id&&attempt<urls.length){img.dataset.retry=String(attempt+1);img.src=urls[attempt];return}
  const wrap=img.closest('.product-image');if(wrap)wrap.classList.add('broken');
  img.alt='Fotografía temporalmente no disponible. Abre el original desde Google Drive.';
}
function bindImages(scope=document){scope.querySelectorAll('img[data-photo]').forEach(img=>{
  const p=products.find(x=>x.codigo===img.dataset.photo);if(!p)return;
  img.dataset.retry='0';img.addEventListener('error',()=>fallbackImage(img,p));img.src=itemImage(p);
})}
function setHeroImage(selector,p){const img=$(selector);if(!img||!p)return;img.dataset.retry='0';img.addEventListener('error',()=>fallbackImage(img,p));img.src=itemImage(p)}
function showToast(message){const t=$('#toast');t.textContent=message;t.hidden=false;clearTimeout(showToast.timeout);showToast.timeout=setTimeout(()=>t.hidden=true,2500)}
function renderCollections(){
 const wrap=$('#collections');wrap.replaceChildren();
 for(const c of seasons){
  const count=c.key==='todos'?products.length:products.filter(p=>p.seccion===c.key).length;
  const b=document.createElement('button');b.type='button';b.className='collection'+(season===c.key?' active':'');b.setAttribute('aria-pressed',String(season===c.key));
  b.innerHTML=`<span class="collection-icon">${c.icon}</span><strong>${esc(c.label)}</strong><small>${count?`${count.toLocaleString('es-MX')} modelos disponibles`:'Próximamente'}</small>`;
  b.addEventListener('click',()=>{season=c.key;activeResultCodes=null;visible=48;$('#search').value='';renderCollections();renderProducts();$('#catalogo').scrollIntoView({behavior:'smooth'})});wrap.appendChild(b);
 }
}
function filtered(){
 const q=norm($('#search').value.trim());
 let arr=products.filter(p=>(season==='todos'||p.seccion===season)&&(!activeResultCodes||activeResultCodes.has(p.codigo))&&(!q||norm([p.nombre,p.numero,p.codigo,p.archivo,p.busqueda,(visualTags[p.codigo]||[]).join(' ')].join(' ')).includes(q)));
 const sort=$('#sort').value;
 arr.sort((a,b)=>sort==='name'?a.nombre.localeCompare(b.nombre,'es'):(a.numero??Infinity)-(b.numero??Infinity)||(a.archivo||'').localeCompare(b.archivo||'','es'));
 if(sort==='desc')arr.reverse();return arr;
}
function renderProducts(){
 const sec=seasons.find(x=>x.key===season)||seasons[0],list=filtered();
 $('#catalog-heading').textContent=activeResultCodes?'Resultados del asistente':sec.label;
 $('#catalog-total').textContent=list.length.toLocaleString('es-MX')+' modelo'+(list.length===1?'':'s');
 $('#clear-search').hidden=!($('#search').value.trim()||activeResultCodes);
 $('#current-description').textContent=activeResultCodes?'Aquí puedes abrir todas las coincidencias encontradas y elegir los moldes que te gusten.':season==='navidad'?'Colección de Navidad con la numeración original de tu carpeta de Drive.':season==='halloween'?'Colección de Halloween, conservando los números y nombres originales.':'Busca por nombre, número, descripción o consulta al asesor.';
 const grid=$('#product-grid');grid.replaceChildren();const frag=document.createDocumentFragment();
 for(const p of list.slice(0,visible)){
  const card=document.createElement('article');card.className='product-card';const badge=p.numero===null?'S/N':'# '+String(p.numero).padStart(3,'0');
  card.innerHTML=`<div class="product-image"><img alt="${esc(p.nombre)}" loading="lazy" data-photo="${esc(p.codigo)}"><span class="number">${esc(badge)}</span><div class="failed-image">🖼️<span>Vista previa no disponible</span><a href="${esc(p.enlace||'#')}" target="_blank" rel="noopener noreferrer">Ver original ↗</a></div></div><div class="product-content"><small>${esc((seasons.find(x=>x.key===p.seccion)||{}).label||'Molde para fieltro')}</small><h3>${esc(p.nombre)}</h3><p class="code">Código: ${esc(p.codigo)}</p><button type="button">Ver y seleccionar ↗</button></div>`;
  card.querySelector('img').addEventListener('click',()=>openProduct(p.codigo));card.querySelector('.product-content button').addEventListener('click',()=>openProduct(p.codigo));frag.appendChild(card);
 }
 grid.appendChild(frag);bindImages(grid);
 $('#empty-state').hidden=list.length>0;$('#show-more').hidden=list.length<=visible;
 $('#show-more').textContent=`Ver más modelos (${(list.length-visible).toLocaleString('es-MX')} restantes) ↓`;
}
function openProduct(code){selected=products.find(p=>p.codigo===code);if(!selected)return;$('#modal-title').textContent=selected.nombre;$('#modal-code').textContent='Código '+selected.codigo+' · Fotografía original '+selected.archivo;$('#modal-season').textContent=(seasons.find(s=>s.key===selected.seccion)||{}).label||selected.seccion;$('#digital-price').textContent=money(PRICE.digital);$('#physical-price').textContent=money(PRICE.fisico);document.querySelector('input[name="format"][value="digital"]').checked=true;const img=$('#modal-photo');img.onerror=()=>fallbackImage(img,selected);img.dataset.retry='0';img.alt=selected.nombre;img.src=itemImage(selected);$('#modal-drive').href=selected.enlace||'#';$('#modal-drive').hidden=!selected.enlace;$('#product-modal').hidden=false;document.body.style.overflow='hidden'}
function closeModal(){$('#product-modal').hidden=true;selected=null;document.body.style.overflow=''}
function renderCart(){cart=cart.filter(c=>products.some(p=>p.codigo===c.codigo));$('#cart-count').textContent=cart.length;$('#cart-subcount').textContent='('+cart.length+')';const box=$('#cart-items');box.replaceChildren();if(!cart.length){box.innerHTML='<div class="drawer-empty">🧵<br><br>Tu selección está vacía.<br>¡Encuentra tus diseños favoritos!</div>'}else{for(const x of cart){let p=products.find(z=>z.codigo===x.codigo);if(!p)continue;let row=document.createElement('div');row.className='cart-line';row.innerHTML=`<img alt="" data-photo="${esc(p.codigo)}"><div class="text"><strong>${esc(p.nombre)}</strong><small>${esc(p.codigo)} · ${x.formato==='digital'?'Molde digital':'Molde físico'}</small><b>${money(PRICE[x.formato])}</b></div><button aria-label="Eliminar ${esc(p.codigo)}">×</button>`;row.querySelector('button').addEventListener('click',()=>{cart=cart.filter(y=>!(y.codigo===x.codigo&&y.formato===x.formato));store()});box.appendChild(row)}bindImages(box)}$('#cart-total').textContent=money(cart.reduce((s,c)=>s+PRICE[c.formato],0));$('#wa-order').disabled=!cart.length;$('#pay-btn').disabled=!cart.length||!window.GABYS_PAGOS_HABILITADOS;$('#pay-btn').textContent=window.GABYS_PAGOS_HABILITADOS?'Pagar con Mercado Pago ↗':'Pagar con Mercado Pago (pendiente)'}
function openCart(){$('#cart-drawer').classList.add('open');$('#cart-drawer').setAttribute('aria-hidden','false');$('#shade').hidden=false;renderCart()}
function closeCart(){$('#cart-drawer').classList.remove('open');$('#cart-drawer').setAttribute('aria-hidden','true');$('#shade').hidden=true}
function addCart(){if(!selected)return;let f=document.querySelector('input[name="format"]:checked').value;if(cart.some(x=>x.codigo===selected.codigo&&x.formato===f)){showToast('Ese formato ya está en tu selección')}else{cart.push({codigo:selected.codigo,formato:f});store();showToast('Modelo añadido a tu selección')}closeModal();openCart()}
function sendWhatsapp(){if(!cart.length)return;const lines=cart.map(x=>{let p=products.find(p=>p.codigo===x.codigo);return '• '+x.codigo+' — '+(p?.nombre||'Modelo')+' — '+(x.formato==='digital'?'Digital':'Físico')+' ('+money(PRICE[x.formato])+')'});const total=cart.reduce((s,c)=>s+PRICE[c.formato],0);const msg=['Hola, Moldes y Diseños Gaby’s 🌷','Quiero consultar este pedido:',...lines,'','Total estimado: '+money(total),'Aún NO he realizado un pago. Quisiera confirmar precios, disponibilidad y forma de entrega.','Gracias.'].join('\n');if(WHATSAPP){window.open('https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')}else if(navigator.clipboard){navigator.clipboard.writeText(msg).then(()=>showToast('Pedido copiado. Falta configurar tu número de WhatsApp')).catch(()=>showToast('Falta configurar el WhatsApp de la tienda'))}else{showToast('Falta configurar el WhatsApp de la tienda')}}
async function startPayment(){if(!cart.length)return;const btn=$('#pay-btn');btn.disabled=true;btn.textContent='Preparando pago seguro…';try{let resp=await fetch('/api/pagos/crear',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({articulos:cart})});let data=await resp.json();if(!resp.ok||!data.url)throw new Error(data.error||'No se pudo iniciar el pago');location.href=data.url}catch(e){showToast(e.message||'Pago no disponible');renderCart()}}
// Búsqueda por descripción, con índice de etiquetas visuales generado por CLIP (open source).
// El modo local nunca inventa etiquetas: muestra coincidencias conocidas y comunica la cobertura del índice.
const intents=[
 {tag:'muñeco de nieve',words:['muneco de nieve','munecos de nieve','snowman','snowmen','hombre de nieve','hombres de nieve','snow man']},
 {tag:'santa claus',words:['santa','santa claus','papa noel','viejo pascuero','san nicolas','abuelito navidad']},
 {tag:'reno',words:['reno','renos','renito','renita','reindeer','venado','ciervo']},
 {tag:'duende',words:['duende','duendes','elfo','elfos','elf','elves']},
 {tag:'galleta de jengibre',words:['galleta','galletas','gingerbread','jengibre']},
 {tag:'pingüino',words:['pinguino','pinguinos','penguin']},
 {tag:'grinch',words:['grinch','verde navideno']},
 {tag:'cascanueces',words:['cascanueces','soldadito','nutcracker']},
 {tag:'angel',words:['angel','angeles','angelito','angelitos']},
 {tag:'oso',words:['osito','ositos','oso','osos','bear']},
 {tag:'arbol de navidad',words:['arbol','arboles','pino','pinos','christmas tree']},
 {tag:'corona',words:['corona','coronas','guirnalda','wreath']},
 {tag:'bota navideña',words:['bota','botas','calcetin','calcetines','stocking']},
 {tag:'esfera navideña',words:['esfera','esferas','bola navidena','ornament']},
 {tag:'trineo',words:['trineo','sleigh']},
 {tag:'muñeca',words:['muneca','munecas','nina','ninas','doll']},
 {tag:'bruja',words:['bruja','brujas','brujita','brujitas','witch']},
 {tag:'catrina',words:['catrina','catrinas','catrin','catrines']},
 {tag:'calavera',words:['calavera','calaveras','calaverita','esqueleto','skeleton']},
 {tag:'fantasma',words:['fantasma','fantasmas','ghost']},
 {tag:'murciélago',words:['murcielago','murcielagos','bat']},
 {tag:'calabaza',words:['calabaza','calabazas','pumpkin']},
 {tag:'vampiro',words:['vampiro','vampiros','dracula','dracula']},
 {tag:'frankenstein',words:['frankenstein','franky','frankie']},
 {tag:'juego de baño',words:['juego de bano','juegos de bano','bano','sanitario']},
 {tag:'cortinero',words:['cortinero','cortineros','abrazadera','cortina']},
 {tag:'cojín',words:['cojin','cojines','almohada','almohadon']},
 {tag:'cocina',words:['cocina','cocinero','cocinera','chef','horno','microondas']}
];
const queryFiller=/^(dame|quiero|mostrar|muestrame|muéstrame|busco|busca|encontrar|encuentra|tienes|tengan|tiene|tiene|hazme|los|las|uno|una|unos|unas|del|de|el|la|por|favor|algun|alguna|algunos|algunas|moldes|molde|modelos|modelo|figuras|figura|foto|fotos|que|con|para|sus|ver|donde|hay|todos|todas|necesito|necesita|numero|numero|y|o|en|tu|catalogo|imagenes|diseños|disenos)$/;
const visualIndexCount=Object.keys(visualTags).length;
function say(content,role='bot'){
 const node=document.createElement('div');node.className='message '+role;node.textContent=content;$('#assistant-messages').appendChild(node);$('#assistant-messages').scrollTop=$('#assistant-messages').scrollHeight;return node;
}
function openAssistant(){const panel=$('#assistant-panel');panel.hidden=false;$('#assistant-launcher').hidden=true;if(!assistantStarted){
 say('¡Hola! 🌷 Describe un diseño (por ejemplo «muñecos de nieve»), escribe un número o pregúntame cómo comprar. Te mostraré los modelos que encuentre con botones para abrir las fotos.');assistantStarted=true;
}$('#assistant-question').focus()}
function closeAssistant(){$('#assistant-panel').hidden=true;$('#assistant-launcher').hidden=false}
function showInCatalog(hits){
 activeResultCodes=new Set(hits.map(p=>p.codigo));season='todos';$('#search').value='';$('#sort').value='asc';visible=48;renderCollections();renderProducts();
 closeAssistant();$('#catalogo').scrollIntoView({behavior:'smooth',block:'start'});
}
function resultMessage(hits,subject,visual){
 if(!hits.length)return;
 const ordered=[...hits].sort((a,b)=>a.seccion.localeCompare(b.seccion)||(a.numero??99999)-(b.numero??99999)||a.codigo.localeCompare(b.codigo));
 const container=document.createElement('div');container.className='message bot bot-results';
 const intro=document.createElement('p');intro.textContent=`${visual?'Encontré coincidencias visuales sugeridas':'Encontré'} ${ordered.length.toLocaleString('es-MX')} modelo${ordered.length===1?'':'s'} para «${subject}». Toca la foto o el número para verlo y añadirlo al carrito.`;container.appendChild(intro);
 const numbers=document.createElement('p');numbers.className='result-numbers';numbers.textContent='Números: '+ordered.map(p=>(p.seccion==='navidad'?'Navidad ':'Halloween ')+(p.numero===null?'S/N':p.numero)+(p.codigo.endsWith('-B')?' (variante B)':'')).join(' · ');container.appendChild(numbers);
 const grid=document.createElement('div');grid.className='chat-result-grid';container.appendChild(grid);
 function appendRange(from,to){for(const p of ordered.slice(from,to)){
  const button=document.createElement('button');button.type='button';button.className='chat-result';button.title='Abrir '+p.codigo;button.setAttribute('aria-label','Abrir modelo '+p.codigo);
  const img=document.createElement('img');img.alt=p.nombre;img.dataset.photo=p.codigo;img.loading='lazy';const span=document.createElement('span');span.textContent=(p.seccion==='navidad'?'🎄 ':'🎃 ')+(p.numero===null?'S/N':'#'+p.numero)+(p.codigo.endsWith('-B')?' B':'');button.append(img,span);button.addEventListener('click',()=>openProduct(p.codigo));grid.appendChild(button);
 }bindImages(grid)}
 let shown=Math.min(12,ordered.length);appendRange(0,shown);
 if(shown<ordered.length){const more=document.createElement('button');more.className='chat-more';more.type='button';more.textContent=`Ver ${Math.min(24,ordered.length-shown)} fotografías más ↓`;more.addEventListener('click',()=>{let next=Math.min(shown+24,ordered.length);appendRange(shown,next);shown=next;if(shown>=ordered.length)more.remove();else more.textContent=`Ver ${Math.min(24,ordered.length-shown)} fotografías más ↓`});container.appendChild(more)}
 const openAll=document.createElement('button');openAll.className='chat-catalog-link';openAll.type='button';openAll.textContent=`Ver los ${ordered.length} modelos en la página ↗`;openAll.addEventListener('click',()=>showInCatalog(ordered));container.appendChild(openAll);
 $('#assistant-messages').appendChild(container);$('#assistant-messages').scrollTop=$('#assistant-messages').scrollHeight;
}
function directSearch(query){
 const clean=norm(query),code=clean.match(/\b(hal|nav)[\s-]*(\d{1,5})(?:-([a-z]))?\b/i);
 if(code){const c=code[1].toUpperCase()+'-'+code[2].padStart(3,'0')+(code[3]?'-'+code[3].toUpperCase():'');return {subject:code[0],hits:products.filter(p=>p.codigo===c),visual:false,exact:true}}
 const numbers=clean.match(/(?:numero|modelo|#|fotografia|foto)\s*[:#-]?\s*(\d{1,5})(?!\d)/i)||(/^\d{1,5}$/.test(clean)?[clean,clean]:null);
 if(numbers){return {subject:'número '+numbers[1],hits:products.filter(p=>p.numero===Number(numbers[1])),visual:false,exact:true}}
 const requested=intents.filter(t=>t.words.some(w=>clean.includes(w))),terms=clean.split(/\s+/).filter(w=>w.length>2&&!queryFiller.test(w));
 let hits=[];
 if(requested.length){hits=products.filter(p=>{
  const text=norm([p.nombre,p.archivo,p.busqueda,(visualTags[p.codigo]||[]).join(' ')].join(' '));
  return requested.every(t=>t.words.some(w=>text.includes(w))||((visualTags[p.codigo]||[]).some(v=>norm(v)===norm(t.tag))));
 });}
 else if(terms.length){hits=products.filter(p=>{let text=norm([p.nombre,p.archivo,p.busqueda,(visualTags[p.codigo]||[]).join(' ')].join(' '));return terms.every(w=>text.includes(w))});}
 // Descripciones de varias palabras pueden ser "muñecos de nieve", "algo con pingüinos" o "reno y Santa".
 const name= requested.length?requested.map(t=>t.tag).join(' y '):terms.join(' ');
 return {subject:name||query,hits,visual:requested.length>0,exact:false,needsIndex:requested.length>0&&!visualIndexCount};
}
function localGuide(query){const clean=norm(query);
 if(/pagar|tarjeta|mercado pago|comprobante|deposito|transferencia/.test(clean))return 'Por ahora puedes preparar tu pedido y enviarlo por WhatsApp. Los cobros con tarjeta siguen desactivados hasta que Mercado Pago esté conectado y verifique el pago. Nunca envíes datos de tu tarjeta por el chat.';
 if(/como|compr|pedido|carrito|selecc/.test(clean))return 'Para comprar: 1) elige Navidad o Halloween; 2) busca por número o describe tu figura; 3) abre la foto, elige digital o físico y agrégalo al carrito; 4) envía la selección por WhatsApp. El pago electrónico todavía no está activo.';
 if(/digital|descarg|archivo|pdf|imprim/.test(clean))return 'Estas fotos son muestrarios de figuras terminadas, no los archivos PDF de moldes. Las descargas de patrones se habilitarán cuando se carguen los archivos digitales y se conecten los pagos.';
 if(/fisico|envio|entrega|paqueteria|direccion/.test(clean))return 'Puedes seleccionar moldes físicos y enviar el pedido por WhatsApp. El costo de envío se confirma antes del pago.';
 if(/whatsapp|contacto|telefono|llamar/.test(clean))return 'Puedes escribirnos directamente al WhatsApp 272 130 08 18, también está al final de la página.';
 return null;
}
async function askAssistant(query){
 const q=query.trim();if(!q)return;say(q,'user');$('#assistant-question').value='';
 const search=directSearch(q);
 const guide=localGuide(q);if(guide&&!search.exact&&!search.visual){say(guide);return}
 if(search.hits.length){resultMessage(search.hits,search.subject,search.visual);if(search.needsIndex)say('Estas son coincidencias basadas en los nombres de archivos. El reconocimiento visual está en proceso, por lo que pueden faltar modelos que solo tienen número.');return}
 if(search.exact){say('No encontré ese número o código en Navidad y Halloween. Revisa la numeración original e intenta otro.');return}
 if(search.needsIndex){say('Estoy preparando el reconocimiento visual de las fotografías. De momento no puedo garantizar cuáles son todos los '+search.subject+' porque muchas fotos solo tienen número. Prueba otra descripción o un número.');return}
 if(search.subject){say('No encontré coincidencias verificables para «'+search.subject+'». Prueba un nombre más corto, como «renos», «muñecos de nieve» o «brujitas».');return}
 say('Descríbeme la figura que quieres o dime el número de su foto. También puedo ayudarte con tu pedido.');
}
function setup(){setHeroImage('#hero-photo',products.find(p=>p.codigo==='NAV-1162')||base[0]);setHeroImage('#hero-photo-left',products.find(p=>p.codigo==='HAL-253')||base[1]);setHeroImage('#hero-photo-right',products.find(p=>p.codigo==='NAV-1173')||base[2]);renderCollections();renderProducts();renderCart();$('#open-cart').addEventListener('click',openCart);$('#shade').addEventListener('click',closeCart);document.querySelectorAll('[data-close="cart"]').forEach(x=>x.addEventListener('click',closeCart));document.querySelectorAll('[data-close="modal"]').forEach(x=>x.addEventListener('click',closeModal));$('#add-cart').addEventListener('click',addCart);$('#search').addEventListener('input',()=>{activeResultCodes=null;visible=48;renderProducts()});$('#sort').addEventListener('change',renderProducts);$('#show-more').addEventListener('click',()=>{visible+=48;renderProducts()});$('#clear-search').addEventListener('click',()=>{$('#search').value='';activeResultCodes=null;renderProducts()});$('#open-search').addEventListener('click',()=>{document.getElementById('catalogo').scrollIntoView({behavior:'smooth'});$('#search').focus()});$('#wa-order').addEventListener('click',sendWhatsapp);$('#pay-btn').addEventListener('click',startPayment);$('#assistant-launcher').addEventListener('click',openAssistant);$('#open-assistant-inline').addEventListener('click',openAssistant);$('#close-assistant').addEventListener('click',closeAssistant);$('#assistant-form').addEventListener('submit',e=>{e.preventDefault();askAssistant($('#assistant-question').value)});$$('[data-prompt]').forEach(x=>x.addEventListener('click',()=>askAssistant(x.dataset.prompt)));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeCart();closeAssistant()}});
// When a full Node server is running, it can offer additional uploaded photos, payments and a local open-source model.
fetch('api/config').then(r=>{if(!r.ok||!r.headers.get('content-type')?.includes('json'))throw Error('static');return r.json()}).then(async data=>{window.GABYS_PAGOS_HABILITADOS=!!data.payments_enabled;window.GABYS_IA_HABILITADA=!!data.ai_enabled;if(data.precios){PRICE.digital=Number(data.precios.digital)||PRICE.digital;PRICE.fisico=Number(data.precios.fisico)||PRICE.fisico}if(data.whatsapp)WHATSAPP=String(data.whatsapp).replace(/\D/g,'');renderCart();if(data.uploads_enabled){const r=await fetch('/api/catalogo');if(r.ok){const j=await r.json();if(Array.isArray(j.products)){products=j.products;renderCollections();renderProducts();renderCart()}}}}).catch(()=>{});
}
function $$(s){return Array.from(document.querySelectorAll(s))}
function motion(){
  const header=$('.site-header');
  const onScroll=()=>header.classList.toggle('scrolled',window.scrollY>10);
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  if('IntersectionObserver'in window){
    const ob=new IntersectionObserver(items=>{items.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in-view');ob.unobserve(x.target)}})},{threshold:.13});
    document.querySelectorAll('.reveal').forEach(x=>ob.observe(x));
  }else document.querySelectorAll('.reveal').forEach(x=>x.classList.add('in-view'));
  const area=$('.hero-showcase');
  if(area&&window.matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
    area.addEventListener('pointermove',e=>{let r=area.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;area.style.setProperty('--x',x);area.style.setProperty('--y',y);area.style.transform='translate3d('+x*6+'px,'+y*6+'px,0)'});
    area.addEventListener('pointerleave',()=>{area.style.transform='translate3d(0,0,0)'});
  }
}
window.GABYS_TIENDA={abrirModelo:openProduct,obtenerModelos:()=>products.slice()};
setup();motion();
})();